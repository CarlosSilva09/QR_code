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

function getAccessUntil(subscription: Stripe.Subscription): Date | null {
    if (subscription.cancel_at) return new Date(subscription.cancel_at * 1000);
    const items = subscription.items?.data ?? [];
    if (items.length === 0) return null;
    const maxEndSeconds = items.reduce((max, item) => Math.max(max, item.current_period_end), 0);
    return maxEndSeconds > 0 ? new Date(maxEndSeconds * 1000) : null;
}

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripe();
    if (!stripe) {
        return NextResponse.json({ message: "Stripe not configured" }, { status: 503 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { subscription: true },
    });

    if (!user?.subscription?.stripeSubscriptionId) {
        return NextResponse.json({ message: "No subscription found" }, { status: 404 });
    }

    const stripeSubscriptionId = user.subscription.stripeSubscriptionId;

    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
        expand: ["items.data.price"],
    });

    const interval = subscription.items.data[0]?.price?.recurring?.interval;

    let updated: Stripe.Subscription;
    if (interval === "month") {
        updated = await stripe.subscriptions.update(stripeSubscriptionId, {
            cancel_at_period_end: true,
            proration_behavior: "none",
        });
    } else if (interval === "year") {
        const thirtyDaysFromNow = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
        updated = await stripe.subscriptions.update(stripeSubscriptionId, {
            cancel_at_period_end: false,
            cancel_at: thirtyDaysFromNow,
            proration_behavior: "none",
        });
    } else {
        // Default behavior: cancel at end of current period
        updated = await stripe.subscriptions.update(stripeSubscriptionId, {
            cancel_at_period_end: true,
            proration_behavior: "none",
        });
    }

    const accessUntil = getAccessUntil(updated);

    await prisma.subscription.update({
        where: { userId: user.id },
        data: {
            status: updated.status,
            currentPeriodEnd: accessUntil,
        },
    });

    return NextResponse.json({
        status: updated.status,
        accessUntil: accessUntil ? accessUntil.toISOString() : null,
        interval: interval || null,
    });
}

