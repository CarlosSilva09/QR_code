import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function hasAccess(subscription: { status: string; currentPeriodEnd: Date | null } | null | undefined) {
    if (!subscription) return false;
    const now = Date.now();
    if (subscription.currentPeriodEnd && subscription.currentPeriodEnd.getTime() > now) return true;
    return subscription.status === "active" || subscription.status === "trialing";
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { type, payload, name } = await req.json();

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { subscription: true },
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // Verify subscription again on backend
    if (!hasAccess(user.subscription)) {
        return NextResponse.json({ message: "Subscription required" }, { status: 403 });
    }

    const qr = await prisma.qRCode.create({
        data: {
            userId: user.id,
            type,
            payload,
            name: name || 'Untitled QR',
        },
    });

    return NextResponse.json(qr);
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, payload, name } = await req.json();

    if (!id || typeof id !== "string") {
        return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { subscription: true },
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (!hasAccess(user.subscription)) {
        return NextResponse.json({ message: "Subscription required" }, { status: 403 });
    }

    const qr = await prisma.qRCode.findUnique({ where: { id } });
    if (!qr || qr.userId !== user.id) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const updated = await prisma.qRCode.update({
        where: { id },
        data: {
            ...(typeof name === "string" ? { name: name.trim() || "Untitled QR" } : {}),
            ...(typeof payload === "string" ? { payload: payload.trim() } : {}),
        },
    });

    return NextResponse.json(updated);
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { qrcodes: { orderBy: { createdAt: 'desc' } } },
    });

    return NextResponse.json(user?.qrcodes || []);
}
