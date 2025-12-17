import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-04-30.basil" as any, // Use latest available
});

// Price IDs - Replace with your actual Stripe Price IDs
const PRICES = {
    monthly: process.env.STRIPE_PRICE_MONTHLY || "price_monthly_placeholder",
    yearly: process.env.STRIPE_PRICE_YEARLY || "price_yearly_placeholder",
};

export async function POST(req: Request) {
    try {
        // Check if Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("STRIPE_SECRET_KEY not configured");
            return NextResponse.json(
                { message: "Pagamentos ainda não configurados. Configure STRIPE_SECRET_KEY no arquivo .env" },
                { status: 503 }
            );
        }

        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "Você precisa estar logado" },
                { status: 401 }
            );
        }

        const { plan } = await req.json();

        if (!plan || !["monthly", "yearly"].includes(plan)) {
            return NextResponse.json(
                { message: "Plano inválido" },
                { status: 400 }
            );
        }

        const priceId = plan === "monthly" ? PRICES.monthly : PRICES.yearly;

        // Check if price IDs are configured
        if (priceId.includes("placeholder")) {
            return NextResponse.json(
                { message: "Preços não configurados. Configure STRIPE_PRICE_MONTHLY e STRIPE_PRICE_YEARLY no .env" },
                { status: 503 }
            );
        }

        // Create Stripe Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXTAUTH_URL}/app?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
            client_reference_id: (session.user as any).id,
            customer_email: session.user.email,
            metadata: {
                userId: (session.user as any).id,
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error: any) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { message: error.message || "Erro ao criar sessão de pagamento" },
            { status: 500 }
        );
    }
}
