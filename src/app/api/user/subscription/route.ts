import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ active: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { subscription: true },
    });

    if (!user || !user.subscription) {
        return NextResponse.json({ active: false });
    }

    const isActive =
        user.subscription.status === 'active' ||
        user.subscription.status === 'trialing';

    return NextResponse.json({ active: isActive });
}
