import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ status: null, currentPeriodEnd: null, active: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { subscription: true },
    });

    if (!user || !user.subscription) {
        return NextResponse.json({ status: null, currentPeriodEnd: null, active: false });
    }

    const accessUntil = user.subscription.currentPeriodEnd;
    const now = Date.now();
    const isActive =
        (accessUntil ? accessUntil.getTime() > now : false) ||
        user.subscription.status === 'active' ||
        user.subscription.status === 'trialing';

    return NextResponse.json({
        status: user.subscription.status,
        currentPeriodEnd: user.subscription.currentPeriodEnd
            ? user.subscription.currentPeriodEnd.toISOString()
            : null,
        accessUntil: accessUntil ? accessUntil.toISOString() : null,
        active: isActive,
    });
}
