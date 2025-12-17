import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Use the latest API version supported by the installed Stripe SDK to satisfy TS literal type
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    apiVersion: "2025-11-17.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function getCurrentPeriodEndDate(subscription: Stripe.Subscription): Date | null {
    const items = subscription.items?.data ?? [];
    if (items.length === 0) return null;
    const maxEndSeconds = items.reduce((max, item) => Math.max(max, item.current_period_end), 0);
    return maxEndSeconds > 0 ? new Date(maxEndSeconds * 1000) : null;
}

export async function POST(req: Request) {
    if (!webhookSecret) {
        // In dev without webhook secret, maybe allow for testing?
        // But strictly we should fail or just log.
        console.warn("No STRIPE_WEBHOOK_SECRET set");
        return NextResponse.json({ received: true });
    }

    const body = await req.text();
    // Await headers() in Next 15+, or just call headers() in Next 14. 
    // Next 16 might require await headers().
    const headerList = await headers();
    const signature = headerList.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            // We expect userId in metadata or client_reference_id
            const userId = session.client_reference_id || session.metadata?.userId;
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;

            if (userId && subscriptionId) {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const currentPeriodEnd = getCurrentPeriodEndDate(subscription);

                await prisma.subscription.upsert({
                    where: { userId },
                    create: {
                        userId,
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: subscriptionId,
                        status: subscription.status,
                        currentPeriodEnd,
                    },
                    update: {
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: subscriptionId,
                        status: subscription.status,
                        currentPeriodEnd,
                    }
                });
            }
        } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
            const subscription = event.data.object as Stripe.Subscription;
            const currentPeriodEnd = getCurrentPeriodEndDate(subscription);
            // Find subscription by stripe ID
            const dbSub = await prisma.subscription.findFirst({
                where: { stripeSubscriptionId: subscription.id }
            });

            if (dbSub) {
                await prisma.subscription.update({
                    where: { id: dbSub.id },
                    data: {
                        status: subscription.status,
                        currentPeriodEnd,
                    }
                });
            }
        }
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json({ error: "Processing Error" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
