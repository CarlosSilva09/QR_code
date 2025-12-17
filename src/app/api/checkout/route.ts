import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

export const runtime = "nodejs";

function getStripe() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) return null;
    return new Stripe(apiKey, { apiVersion: "2025-11-17.clover" });
}

const PRICES = {
    monthly: process.env.STRIPE_PRICE_MONTHLY || "price_monthly_placeholder",
    yearly: process.env.STRIPE_PRICE_YEARLY || "price_yearly_placeholder",
};

export async function POST(req: Request) {
    try {
        const stripe = getStripe();
        if (!stripe) {
            console.error("STRIPE_SECRET_KEY not configured");
            return NextResponse.json(
                { message: "Pagamentos nao configurados. Configure STRIPE_SECRET_KEY no ambiente (Vercel)." },
                { status: 503 }
            );
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Voce precisa estar logado" }, { status: 401 });
        }

        const { plan } = await req.json();
        if (!plan || !["monthly", "yearly"].includes(plan)) {
            return NextResponse.json({ message: "Plano invalido" }, { status: 400 });
        }

        const priceId = plan === "monthly" ? PRICES.monthly : PRICES.yearly;
        if (priceId.includes("placeholder")) {
            return NextResponse.json(
                { message: "Precos nao configurados. Configure STRIPE_PRICE_MONTHLY e STRIPE_PRICE_YEARLY no ambiente (Vercel)." },
                { status: 503 }
            );
        }

        const origin =
            req.headers.get("origin") ||
            process.env.NEXTAUTH_URL ||
            "http://localhost:3000";

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${origin}/app/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/pricing?canceled=true`,
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
            { message: error?.message || "Erro ao criar sessao de pagamento" },
            { status: 500 }
        );
    }
}
