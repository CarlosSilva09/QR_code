import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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
    const isActive = user.subscription?.status === 'active' || user.subscription?.status === 'trialing';
    if (!isActive) {
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
