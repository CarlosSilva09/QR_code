'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink, Download } from 'lucide-react';

export default function QRList() {
    const [qrs, setQrs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/qrcodes')
            .then(res => res.json())
            .then(data => {
                setQrs(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-gray-400">Carregando seus QRs...</div>;
    if (qrs.length === 0) return <div className="text-gray-400">Nenhum QR Code criado ainda.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrs.map((qr) => (
                <div key={qr.id} className="glass-panel p-6 rounded-xl flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg">{qr.name}</h3>
                            <span className="text-xs px-2 py-1 bg-white/10 rounded-full uppercase text-gray-400">{qr.type}</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg">
                            <QRCodeSVG value={`http://localhost:3000/q/${qr.id}`} size={64} />
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 truncate" title={qr.payload}>{qr.payload}</p>

                    <div className="mt-auto flex gap-2">
                        <a
                            href={`http://localhost:3000/q/${qr.id}`}
                            target="_blank"
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
                        >
                            <ExternalLink size={16} /> Testar
                        </a>
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                        Definitivo ID: {qr.id.substring(0, 8)}...
                    </div>
                </div>
            ))}
        </div>
    );
}
