import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateInvoiceNumber,
  generateInvoicePDF,
  createInvoiceData,
} from "@/lib/invoice";
import { uploadToStorage } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 }
      );
    }

    const stripe = await import("stripe").then(
      (m) => new m.default(process.env.STRIPE_SECRET_KEY!)
    );

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          id: string;
          metadata?: { userId?: string; credits?: string; packageId?: string };
          client_reference_id?: string;
          amount_total?: number;
        };

        const userId =
          session.metadata?.userId || session.client_reference_id;
        const credits = parseInt(session.metadata?.credits || "0");

        if (!userId || !credits) {
          console.error("Missing userId or credits in session metadata");
          break;
        }

        // Get the payment record and user info
        const payment = await prisma.payment.findFirst({
          where: { stripeSessionId: session.id },
        });

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true },
        });

        if (!payment || !user) {
          console.error("Payment or user not found");
          break;
        }

        // Generate invoice number and PDF
        const invoiceNumber = generateInvoiceNumber(payment.id, payment.createdAt);
        let invoiceUrl: string | null = null;

        try {
          const invoiceData = createInvoiceData(
            {
              id: payment.id,
              amount: payment.amount,
              currency: payment.currency,
              creditsGranted: credits,
              createdAt: payment.createdAt,
              invoiceNumber,
            },
            user
          );

          const pdfBuffer = generateInvoicePDF(invoiceData);

          // Upload to Supabase Storage
          const fileName = `invoices/${userId}/${invoiceNumber}.pdf`;
          invoiceUrl = await uploadToStorage(
            "invoices",
            fileName,
            pdfBuffer,
            "application/pdf"
          );

          console.log(`Invoice generated: ${invoiceNumber} at ${invoiceUrl}`);
        } catch (invoiceError) {
          // Log error but don't fail the payment
          console.error("Failed to generate invoice:", invoiceError);
        }

        // Update payment status with invoice info
        await prisma.payment.updateMany({
          where: { stripeSessionId: session.id },
          data: {
            status: "COMPLETED",
            stripePaymentId: session.id,
            invoiceNumber,
            invoiceUrl,
          },
        });

        // Add credits to user
        await prisma.credits.upsert({
          where: { userId },
          update: {
            balance: {
              increment: credits,
            },
          },
          create: {
            userId,
            balance: credits,
          },
        });

        // Log the transaction
        await prisma.creditTransaction.create({
          data: {
            userId,
            amount: credits,
            type: "PURCHASE",
            description: `Purchased ${credits} credits`,
            metadata: {
              stripeSessionId: session.id,
              packageId: session.metadata?.packageId,
              invoiceNumber,
            },
          },
        });

        console.log(`Added ${credits} credits to user ${userId}`);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as { id: string };

        // Update payment status to failed
        await prisma.payment.updateMany({
          where: { stripeSessionId: session.id },
          data: { status: "FAILED" },
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
