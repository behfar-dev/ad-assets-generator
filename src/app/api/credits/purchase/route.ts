import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Credit packages configuration
const CREDIT_PACKAGES: Record<
  string,
  { credits: number; price: number; name: string }
> = {
  starter: { credits: 50, price: 9.99, name: "Starter" },
  pro: { credits: 200, price: 29.99, name: "Pro" },
  business: { credits: 500, price: 59.99, name: "Business" },
};

// POST /api/credits/purchase - Create checkout session for credit purchase
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packageId } = await request.json();

    if (!packageId || !CREDIT_PACKAGES[packageId]) {
      return NextResponse.json(
        { error: "Invalid package selected" },
        { status: 400 }
      );
    }

    const selectedPackage = CREDIT_PACKAGES[packageId];

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      // For development without Stripe, directly add credits
      if (process.env.NODE_ENV === "development") {
        // Add credits directly for development
        await prisma.credits.upsert({
          where: { userId: session.user.id },
          update: {
            balance: {
              increment: selectedPackage.credits,
            },
          },
          create: {
            userId: session.user.id,
            balance: selectedPackage.credits,
          },
        });

        // Log the transaction
        await prisma.creditTransaction.create({
          data: {
            userId: session.user.id,
            amount: selectedPackage.credits,
            type: "PURCHASE",
            description: `Purchased ${selectedPackage.name} package (dev mode)`,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Credits added (development mode)",
          credits: selectedPackage.credits,
        });
      }

      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 503 }
      );
    }

    // Import Stripe dynamically to avoid issues if not installed
    const stripe = await import("stripe").then(
      (m) => new m.default(process.env.STRIPE_SECRET_KEY!)
    );

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: session.user.email,
      client_reference_id: session.user.id,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${selectedPackage.name} Credit Package`,
              description: `${selectedPackage.credits} credits for Ad Assets Generator`,
            },
            unit_amount: Math.round(selectedPackage.price * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        packageId,
        credits: selectedPackage.credits.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true&credits=${selectedPackage.credits}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    });

    // Store pending payment
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: selectedPackage.price,
        status: "PENDING",
        stripeSessionId: checkoutSession.id,
        creditsGranted: selectedPackage.credits,
        metadata: { packageId },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Create checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
