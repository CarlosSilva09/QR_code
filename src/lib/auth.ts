import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDatabaseUrl, prisma } from "./prisma";
import { compare } from "bcryptjs";
import { Prisma } from "@prisma/client";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                const databaseUrl = getDatabaseUrl();
                if (!databaseUrl) {
                    throw new Error("DATABASE_URL is not configured");
                }

                let user: { id: string; email: string; password: string } | null = null;
                try {
                    user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                        select: {
                            id: true,
                            email: true,
                            password: true,
                        },
                    });
                } catch (error) {
                    if (error instanceof Prisma.PrismaClientInitializationError) {
                        throw new Error("Database connection failed");
                    }
                    throw error;
                }

                if (!user) {
                    return null;
                }

                const isPasswordValid = await compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.email, // Using email as name for simplicity or extend schema
                };
            },
        }),
    ],
    callbacks: {
        session: ({ session, token }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                },
            };
        },
        jwt: ({ token, user }) => {
            if (user) {
                const u = user as any;
                return {
                    ...token,
                    id: u.id,
                };
            }
            return token;
        },
    },
};
