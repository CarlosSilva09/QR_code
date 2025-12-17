import QRList from '@/components/dashboard/QRList';

export default function MyQRCodesPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Meus QRs</h1>
                <p className="text-gray-400">Gerencie seus códigos definitivos.</p>
            </header>

            <QRList />
        </div>
    );
}

