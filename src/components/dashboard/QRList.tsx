'use client';

import { useEffect, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { ExternalLink, ImageDown } from 'lucide-react';

export default function QRList() {
    const [qrs, setQrs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [baseUrl, setBaseUrl] = useState<string>(process.env.NEXT_PUBLIC_APP_URL ?? '');

    useEffect(() => {
        fetch('/api/qrcodes')
            .then(res => res.json())
            .then(data => {
                setQrs(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!baseUrl && typeof window !== 'undefined') {
            setBaseUrl(window.location.origin);
        }
    }, [baseUrl]);

    if (loading) return <div className="text-gray-400">Carregando seus QRs...</div>;
    if (qrs.length === 0) return <div className="text-gray-400">Nenhum QR Code criado ainda.</div>;

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const sanitizeFilename = (name: string) =>
        name
            .trim()
            .replace(/[\\/:*?"<>|]+/g, '-')
            .replace(/\s+/g, ' ')
            .slice(0, 80) || 'qr-code';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrs.map((qr) => (
                <QRCard
                    key={qr.id}
                    qr={qr}
                    baseUrl={baseUrl}
                    onDownloadBlob={downloadBlob}
                    sanitizeFilename={sanitizeFilename}
                />
            ))}
        </div>
    );
}

function QRCard({
    qr,
    baseUrl,
    onDownloadBlob,
    sanitizeFilename,
}: {
    qr: any;
    baseUrl: string;
    onDownloadBlob: (blob: Blob, filename: string) => void;
    sanitizeFilename: (name: string) => string;
}) {
    const qrUrl = baseUrl ? `${baseUrl}/q/${qr.id}` : `/q/${qr.id}`;
    const filenameBase = sanitizeFilename(qr?.name || 'qr-code');

    const handleDownloadPng = () => {
        const canvas = document.getElementById(`qr-canvas-${qr.id}`) as HTMLCanvasElement | null;
        if (!canvas) return;
        canvas.toBlob((blob) => {
            if (!blob) return;
            onDownloadBlob(blob, `${filenameBase}.png`);
        }, 'image/png');
    };

    const handleDownloadSvg = () => {
        const svg = document.querySelector(`#qr-svg-${qr.id} svg`) as SVGElement | null;
        if (!svg) return;
        const serializer = new XMLSerializer();
        let svgText = serializer.serializeToString(svg);
        if (!svgText.includes('xmlns=')) {
            svgText = svgText.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
        onDownloadBlob(blob, `${filenameBase}.svg`);
    };

    return (
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg">{qr.name}</h3>
                            <span className="text-xs px-2 py-1 bg-white/10 rounded-full uppercase text-gray-400">{qr.type}</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg">
                            <div id={`qr-svg-${qr.id}`}>
                                <QRCodeSVG value={qrUrl} size={64} />
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 truncate" title={qr.payload}>{qr.payload}</p>

                    <div className="mt-auto flex gap-2">
                        <a
                            href={qrUrl}
                            target="_blank"
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
                        >
                            <ExternalLink size={16} /> Testar
                        </a>
                        <button
                            type="button"
                            onClick={handleDownloadPng}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-gray-200 rounded-lg hover:bg-white/15 transition-colors text-sm"
                            title="Baixar PNG"
                        >
                            <ImageDown size={16} />
                            PNG
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadSvg}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-gray-200 rounded-lg hover:bg-white/15 transition-colors text-sm"
                            title="Baixar SVG"
                        >
                            <ImageDown size={16} />
                            SVG
                        </button>
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                        Definitivo ID: {qr.id.substring(0, 8)}...
                    </div>

                    <div className="sr-only" aria-hidden="true">
                        <QRCodeCanvas id={`qr-canvas-${qr.id}`} value={qrUrl} size={1024} includeMargin />
                    </div>
                </div>
    );
}
