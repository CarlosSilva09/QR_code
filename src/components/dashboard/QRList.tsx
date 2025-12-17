'use client';

import { useEffect, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { ExternalLink, ImageDown, Pencil, X, Save } from 'lucide-react';

export default function QRList() {
    const [qrs, setQrs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [baseUrl, setBaseUrl] = useState<string>(process.env.NEXT_PUBLIC_APP_URL ?? '');
    const [editing, setEditing] = useState<any | null>(null);
    const [editName, setEditName] = useState('');
    const [editPayload, setEditPayload] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string>('');

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

    const startEdit = (qr: any) => {
        setEditing(qr);
        setEditName(qr?.name || '');
        setEditPayload(qr?.payload || '');
        setSaveError('');
    };

    const closeEdit = () => {
        if (saving) return;
        setEditing(null);
        setEditName('');
        setEditPayload('');
        setSaveError('');
    };

    const saveEdit = async () => {
        if (!editing) return;
        setSaving(true);
        setSaveError('');
        try {
            const res = await fetch('/api/qrcodes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editing.id,
                    name: editName,
                    payload: editPayload,
                }),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setSaveError((data && data.message) || 'Erro ao salvar alterações.');
                setSaving(false);
                return;
            }

            setQrs((prev) => prev.map((q) => (q.id === data.id ? data : q)));
            setSaving(false);
            closeEdit();
        } catch {
            setSaveError('Erro de conexão.');
            setSaving(false);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {qrs.map((qr) => (
                    <QRCard
                        key={qr.id}
                        qr={qr}
                        baseUrl={baseUrl}
                        onDownloadBlob={downloadBlob}
                        sanitizeFilename={sanitizeFilename}
                        onEdit={() => startEdit(qr)}
                    />
                ))}
            </div>

            {editing && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-xl glass-panel p-6 rounded-2xl border border-white/10">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-xl font-bold">Editar QR</h3>
                                <p className="text-sm text-gray-400">
                                    A imagem do QR não muda: ele sempre aponta para <span className="text-gray-200">/q/{editing.id}</span>.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeEdit}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                aria-label="Fechar"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nome</label>
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Nome do QR"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Destino</label>
                                <textarea
                                    value={editPayload}
                                    onChange={(e) => setEditPayload(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors min-h-[120px]"
                                    placeholder="URL/texto/WIFI/..."
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Para tipo <span className="text-gray-300">link</span>, use uma URL (ex.: https://seu-site.com).
                                </p>
                            </div>

                            {saveError && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
                                    {saveError}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeEdit}
                                    disabled={saving}
                                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={saveEdit}
                                    disabled={saving}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-bold flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function QRCard({
    qr,
    baseUrl,
    onDownloadBlob,
    sanitizeFilename,
    onEdit,
}: {
    qr: any;
    baseUrl: string;
    onDownloadBlob: (blob: Blob, filename: string) => void;
    sanitizeFilename: (name: string) => string;
    onEdit: () => void;
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

            <div className="mt-auto grid grid-cols-2 gap-2">
                <a
                    href={qrUrl}
                    target="_blank"
                    className="flex items-center justify-center gap-2 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
                >
                    <ExternalLink size={16} /> Testar
                </a>
                <button
                    type="button"
                    onClick={onEdit}
                    className="flex items-center justify-center gap-2 py-2 bg-white/10 text-gray-200 rounded-lg hover:bg-white/15 transition-colors text-sm"
                    title="Editar destino"
                >
                    <Pencil size={16} />
                    Editar
                </button>
                <button
                    type="button"
                    onClick={handleDownloadPng}
                    className="flex items-center justify-center gap-2 py-2 bg-white/10 text-gray-200 rounded-lg hover:bg-white/15 transition-colors text-sm"
                    title="Baixar PNG"
                >
                    <ImageDown size={16} />
                    PNG
                </button>
                <button
                    type="button"
                    onClick={handleDownloadSvg}
                    className="flex items-center justify-center gap-2 py-2 bg-white/10 text-gray-200 rounded-lg hover:bg-white/15 transition-colors text-sm"
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
