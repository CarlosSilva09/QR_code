import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function hasAccess(subscription: { status: string; currentPeriodEnd: Date | null } | null | undefined) {
    if (!subscription) return false;
    const now = Date.now();
    if (subscription.currentPeriodEnd && subscription.currentPeriodEnd.getTime() > now) return true;
    return subscription.status === "active" || subscription.status === "trialing";
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const qr = await prisma.qRCode.findUnique({
        where: { id },
        include: { user: { include: { subscription: true } } },
    });

    if (!qr) {
        return new Response("QR Code not found", { status: 404 });
    }

    if (!hasAccess(qr.user.subscription)) {
        return new Response(
            `
        <html>
           <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff; padding: 24px; text-align: center;">
              <h1 style="margin: 0 0 12px;">QR Code inativo</h1>
              <p style="margin: 0 0 18px; color: rgba(255,255,255,.8); max-width: 520px;">
                Este QR Code pertence a uma assinatura que expirou. Para reativar, faça uma nova assinatura.
              </p>
              <a href="/pricing" style="display: inline-block; padding: 12px 16px; border-radius: 10px; background: #2563eb; color: #fff; text-decoration: none; font-weight: 700;">
                Ver planos
              </a>
           </body>
        </html>
      `,
            { headers: { "Content-Type": "text/html" }, status: 402 }
        );
    }

    // Handle different types
    if (qr.type === 'link' || qr.type === 'whatsapp') {
        // Ensure protocol
        let url = qr.payload;
        if (!url.startsWith('http') && !url.startsWith('https') && !url.startsWith('whatsapp:')) {
            if (qr.type === 'link') url = `https://${url}`;
        }
        redirect(url);
    } else if (qr.type === 'wifi') {
        // WIFI URIs might work as redirects on mobile, or display simple page
        // redirect(`WIFI:${qr.payload}`); // This might fail in browser if not handled
        // Better to show a page for WiFi/Text
        return new Response(`
        <html>
           <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff;">
              <h1>QR Code: ${qr.name || 'Wi-Fi'}</h1>
              <p>Conteúdo: ${qr.payload}</p>
              <p>Copie o conteúdo acima se não abrir automaticamente.</p>
           </body>
        </html>
      `, {
            headers: { 'Content-Type': 'text/html' }
        });
    } else {
        // Text
        return new Response(qr.payload);
    }
}
