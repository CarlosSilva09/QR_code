import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function isUserAdmin(): Promise<boolean> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return false;
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
    });

    return user?.role === "admin";
}

export async function getUser() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return null;
    }

    return prisma.user.findUnique({
        where: { email: session.user.email },
        include: { subscription: true },
    });
}
