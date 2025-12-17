import QRGenerator from "@/components/dashboard/QRGenerator";

export default function DashboardPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Novo QR Code</h1>
                <p className="text-gray-400">Crie um QR Code definitivo que nunca expira.</p>
            </header>

            <QRGenerator />
        </div>
    );
}
