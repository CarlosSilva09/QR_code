import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Password validation: min 8 chars, 1 uppercase, 1 number
function isPasswordStrong(password: string): boolean {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password);
}

export async function POST(req: Request) {
    try {
        const { email, password, name, phone, cpf, termsAccepted } = await req.json();

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { message: "Email e senha são obrigatórios" },
                { status: 400 }
            );
        }

        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { message: "Nome é obrigatório (mínimo 2 caracteres)" },
                { status: 400 }
            );
        }

        if (!isPasswordStrong(password)) {
            return NextResponse.json(
                { message: "Senha deve ter no mínimo 8 caracteres, 1 maiúscula e 1 número" },
                { status: 400 }
            );
        }

        if (!termsAccepted) {
            return NextResponse.json(
                { message: "Você precisa aceitar os termos de uso" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Este email já está cadastrado" },
                { status: 400 }
            );
        }

        const hashedPassword = await hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name.trim(),
                phone: phone || null,
                cpf: cpf || null,
                termsAccepted: true,
            },
        });

        return NextResponse.json(
            { message: "Conta criada com sucesso!", userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Erro ao criar conta. Tente novamente." },
            { status: 500 }
        );
    }
}
