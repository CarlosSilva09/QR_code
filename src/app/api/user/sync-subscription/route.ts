import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-04-30.basil" as any,
});

// This endpoint syncs subscription status from Stripe
// Used as fallback when webhook is not available (local dev)
export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { subscription: true },
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // If user already has a subscription with stripeCustomerId, check Stripe
        if (user.subscription?.stripeCustomerId) {
            const subscriptions = await stripe.subscriptions.list({
                customer: user.subscription.stripeCustomerId,
                status: "active",
                limit: 1,
            });

            if (subscriptions.data.length > 0) {
                const sub = subscriptions.data[0];
                await prisma.subscription.update({
                    where: { userId: user.id },
                    data: {
                        status: sub.status,
                        stripeSubscriptionId: sub.id,
                        currentPeriodEnd: new Date(sub.current_period_end * 1000),
                    },
                });

                return NextResponse.json({ status: "synced", subscription: sub.status });
            }
        }

        // Search for recent checkout sessions by customer email
        const checkoutSessions = await stripe.checkout.sessions.list({
            limit: 10,
        });

        const userSession = checkoutSessions.data.find(
            (s) => s.customer_email === user.email && s.status === "complete"
        );

        if (userSession && userSession.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
                userSession.subscription as string
            );

            await prisma.subscription.upsert({
                where: { userId: user.id },
                create: {
                    userId: user.id,
                    stripeCustomerId: userSession.customer as string,
                    stripeSubscriptionId: subscription.id,
                    status: subscription.status,
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                },
                update: {
                    stripeCustomerId: userSession.customer as string,
                    stripeSubscriptionId: subscription.id,
                    status: subscription.status,
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                },
            });

            return NextResponse.json({ status: "activated", subscription: subscription.status });
        }

        return NextResponse.json({ status: "no_subscription_found" });
    } catch (error: any) {
        console.error("Sync subscription error:", error);
        return NextResponse.json(
            { message: error.message || "Error syncing subscription" },
            { status: 500 }
        );
    }
}
