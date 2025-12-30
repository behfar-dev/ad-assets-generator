import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

        // Update payment status
        await prisma.payment.updateMany({
          where: { stripeSessionId: session.id },
          data: {
            status: "COMPLETED",
            stripePaymentId: session.id,
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
