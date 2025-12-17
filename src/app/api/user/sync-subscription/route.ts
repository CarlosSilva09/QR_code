import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const runtime = "nodejs";

function getStripe() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) return null;
    return new Stripe(apiKey, { apiVersion: "2025-11-17.clover" });
}

function getCurrentPeriodEndDate(subscription: Stripe.Subscription): Date | null {
    const items = subscription.items?.data ?? [];
    if (items.length === 0) return null;
    const maxEndSeconds = items.reduce((max, item) => Math.max(max, item.current_period_end), 0);
    return maxEndSeconds > 0 ? new Date(maxEndSeconds * 1000) : null;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const sessionIdFromQuery = searchParams.get("session_id");
        let sessionIdFromBody: string | null = null;
        try {
            const body = await req.json().catch(() => null);
            if (body && typeof body.sessionId === "string") sessionIdFromBody = body.sessionId;
        } catch {
            // ignore invalid JSON
        }

        const checkoutSessionId = sessionIdFromBody || sessionIdFromQuery;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { subscription: true },
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const stripe = getStripe();
        if (!stripe) {
            return NextResponse.json({ message: "Stripe not configured" }, { status: 503 });
        }

        if (checkoutSessionId) {
            const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId);
            const subscriptionId =
                typeof checkoutSession.subscription === "string"
                    ? checkoutSession.subscription
                    : checkoutSession.subscription?.id;

            if (!subscriptionId) {
                return NextResponse.json({ status: "no_subscription_on_session" }, { status: 200 });
            }

            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const currentPeriodEnd = getCurrentPeriodEndDate(subscription);

            await prisma.subscription.upsert({
                where: { userId: user.id },
                create: {
                    userId: user.id,
                    stripeCustomerId: typeof checkoutSession.customer === "string" ? checkoutSession.customer : null,
                    stripeSubscriptionId: subscription.id,
                    status: subscription.status,
                    currentPeriodEnd,
                },
                update: {
                    stripeCustomerId: typeof checkoutSession.customer === "string" ? checkoutSession.customer : null,
                    stripeSubscriptionId: subscription.id,
                    status: subscription.status,
                    currentPeriodEnd,
                },
            });

            return NextResponse.json({ status: "activated", subscription: subscription.status });
        }

        if (user.subscription?.stripeCustomerId) {
            const subscriptions = await stripe.subscriptions.list({
                customer: user.subscription.stripeCustomerId,
                status: "active",
                limit: 1,
            });

            if (subscriptions.data.length > 0) {
                const sub = subscriptions.data[0];
                const currentPeriodEnd = getCurrentPeriodEndDate(sub);
                await prisma.subscription.update({
                    where: { userId: user.id },
                    data: {
                        status: sub.status,
                        stripeSubscriptionId: sub.id,
                        currentPeriodEnd,
                    },
                });

                return NextResponse.json({ status: "synced", subscription: sub.status });
            }
        }

        const checkoutSessions = await stripe.checkout.sessions.list({ limit: 10 });
        const userSession = checkoutSessions.data.find(
            (s) => s.customer_email === user.email && s.status === "complete"
        );

        if (userSession && userSession.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
                userSession.subscription as string
            );
            const currentPeriodEnd = getCurrentPeriodEndDate(subscription);

            await prisma.subscription.upsert({
                where: { userId: user.id },
                create: {
                    userId: user.id,
                    stripeCustomerId: userSession.customer as string,
                    stripeSubscriptionId: subscription.id,
                    status: subscription.status,
                    currentPeriodEnd,
                },
                update: {
                    stripeCustomerId: userSession.customer as string,
                    stripeSubscriptionId: subscription.id,
                    status: subscription.status,
                    currentPeriodEnd,
                },
            });

            return NextResponse.json({ status: "activated", subscription: subscription.status });
        }

        return NextResponse.json({ status: "no_subscription_found" });
    } catch (error: any) {
        console.error("Sync subscription error:", error);
        return NextResponse.json(
            { message: error?.message || "Error syncing subscription" },
            { status: 500 }
        );
    }
}
