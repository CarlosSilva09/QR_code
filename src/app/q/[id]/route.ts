import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    const qr = await prisma.qRCode.findUnique({
        where: { id },
    });

    if (!qr) {
        return new Response("QR Code not found", { status: 404 });
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
