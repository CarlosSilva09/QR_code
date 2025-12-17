'use client';

import { useEffect, useMemo, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { AlignLeft, Download, Link as LinkIcon, Lock, MessageSquare, Wifi } from 'lucide-react';
import clsx from 'clsx';

type QRType = 'link' | 'wifi' | 'whatsapp' | 'text';

function sanitizeFilename(value: string) {
    return (
        value
            .trim()
            .replace(/[\\/:*?"<>|]+/g, '-')
            .replace(/\s+/g, ' ')
            .slice(0, 80) || 'qr-code'
    );
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export default function QRGenerator() {
    const [type, setType] = useState<QRType>('link');
    const [name, setName] = useState('');

    const [linkOrText, setLinkOrText] = useState('');
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiPass, setWifiPass] = useState('');
    const [whatsappPhone, setWhatsappPhone] = useState('');

    const [loading, setLoading] = useState(false);
    const [hasSubscription, setHasSubscription] = useState<boolean | null>(null); // null = loading
    const [showPaywall, setShowPaywall] = useState(false);

    const [baseUrl, setBaseUrl] = useState<string>(process.env.NEXT_PUBLIC_APP_URL ?? '');
    const [createdQr, setCreatedQr] = useState<any | null>(null);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        fetch('/api/user/subscription')
            .then((res) => res.json())
            .then((data) => setHasSubscription(Boolean(data.active)))
            .catch(() => setHasSubscription(false));
    }, []);

    useEffect(() => {
        if (!baseUrl && typeof window !== 'undefined') {
            setBaseUrl(window.location.origin);
        }
    }, [baseUrl]);

    const payloadToSave = useMemo(() => {
        if (type === 'wifi') return `WIFI:S:${wifiSsid};T:WPA;P:${wifiPass};;`;
        if (type === 'whatsapp') return `https://wa.me/${whatsappPhone}`;
        return linkOrText;
    }, [type, wifiSsid, wifiPass, whatsappPhone, linkOrText]);

    const handleGenerate = async () => {
        if (!hasSubscription) {
            setShowPaywall(true);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/qrcodes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, payload: payloadToSave, name }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                alert((data && data.message) || 'Erro ao criar QR Code.');
                setLoading(false);
                return;
            }

            const data = await res.json().catch(() => null);
            setCreatedQr(data);
            setShowResult(true);
        } catch {
            alert('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const qrUrl = createdQr?.id ? (baseUrl ? `${baseUrl}/q/${createdQr.id}` : `/q/${createdQr.id}`) : '';

    const handleDownloadPng = () => {
        if (!createdQr?.id) return;
        const canvas = document.getElementById('qr-result-canvas') as HTMLCanvasElement | null;
        if (!canvas) return;
        canvas.toBlob((blob) => {
            if (!blob) return;
            downloadBlob(blob, `${sanitizeFilename(createdQr?.name || name || 'qr-code')}.png`);
        }, 'image/png');
    };

    const handleDownloadSvg = () => {
        if (!createdQr?.id) return;
        const svg = document.querySelector('#qr-result-svg svg') as SVGElement | null;
        if (!svg) return;
        const serializer = new XMLSerializer();
        let svgText = serializer.serializeToString(svg);
        if (!svgText.includes('xmlns=')) {
            svgText = svgText.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        downloadBlob(
            new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }),
            `${sanitizeFilename(createdQr?.name || name || 'qr-code')}.svg`
        );
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-8">
                <div className="glass-panel p-4 rounded-xl flex gap-4 overflow-x-auto">
                    {[
                        { id: 'link', icon: LinkIcon, label: 'Link' },
                        { id: 'wifi', icon: Wifi, label: 'Wi-Fi' },
                        { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp' },
                        { id: 'text', icon: AlignLeft, label: 'Texto' },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setType(t.id as QRType)}
                            className={clsx(
                                'flex flex-col items-center gap-2 px-6 py-4 rounded-lg min-w-[100px] transition-colors',
                                type === t.id ? 'bg-blue-600/20 text-blue-300' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                            )}
                            type="button"
                        >
                            <t.icon size={18} />
                            <span className="text-sm font-medium">{t.label}</span>
                        </button>
                    ))}
                </div>

                <div className="glass-panel p-6 rounded-xl space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Nome (opcional)</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                            placeholder="Ex: Wi-Fi Escritório"
                        />
                    </div>

                    {type === 'link' && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">URL de destino</label>
                            <input
                                type="url"
                                value={linkOrText}
                                onChange={(e) => setLinkOrText(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                                placeholder="https://seu-site.com"
                            />
                        </div>
                    )}

                    {type === 'text' && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Texto</label>
                            <textarea
                                value={linkOrText}
                                onChange={(e) => setLinkOrText(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 min-h-[120px]"
                                placeholder="Digite seu texto..."
                            />
                        </div>
                    )}

                    {type === 'wifi' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nome da rede (SSID)</label>
                                <input
                                    value={wifiSsid}
                                    onChange={(e) => setWifiSsid(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Senha</label>
                                <input
                                    value={wifiPass}
                                    onChange={(e) => setWifiPass(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {type === 'whatsapp' && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Número (DDI+DDD+Número)</label>
                            <input
                                value={whatsappPhone}
                                onChange={(e) => setWhatsappPhone(e.target.value.replace(/\s+/g, ''))}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                                placeholder="5511999999999"
                            />
                        </div>
                    )}
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading || hasSubscription === null}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold text-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    type="button"
                >
                    {loading ? (
                        'Processando...'
                    ) : (
                        <>
                            <Lock size={20} />
                            Gerar QR Definitivo
                        </>
                    )}
                </button>
            </div>

            <div className="w-full lg:w-96 flex flex-col gap-4">
                <div className="glass-panel p-8 rounded-xl aspect-square bg-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-8 bg-white rounded-xl opacity-15 blur-md">
                            <QRCodeSVG value="https://qr-definitivo.com" size={256} />
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-300 mb-4">
                            <Lock size={28} />
                        </div>
                        <p className="font-bold">Prévia desativada</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Clique em <span className="text-gray-200">Gerar</span> para ver o QR definitivo e baixar.
                        </p>
                    </div>
                </div>
            </div>

            {showPaywall && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center relative">
                        <button
                            onClick={() => setShowPaywall(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            aria-label="Fechar"
                            type="button"
                        >
                            ×
                        </button>
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
                            <Lock size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Ative seu plano</h3>
                        <p className="text-gray-400 mb-6">
                            Para gerar QRs definitivos e gerenciáveis, você precisa de uma assinatura ativa.
                        </p>
                        <a
                            href="/pricing"
                            className="block w-full py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                        >
                            Ver Planos
                        </a>
                    </div>
                </div>
            )}

            {showResult && createdQr?.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl max-w-lg w-full relative">
                        <button
                            onClick={() => setShowResult(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            aria-label="Fechar"
                            type="button"
                        >
                            ×
                        </button>

                        <h3 className="text-2xl font-bold mb-6">QR Code pronto</h3>

                        <div className="glass-panel p-6 rounded-xl flex items-center justify-center bg-white/5">
                            <div className="p-4 bg-white rounded-xl" id="qr-result-svg">
                                <QRCodeSVG value={qrUrl} size={220} />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                                onClick={handleDownloadPng}
                                className="py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                type="button"
                            >
                                <Download size={18} /> PNG
                            </button>
                            <button
                                onClick={handleDownloadSvg}
                                className="py-3 glass-panel font-bold rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                                type="button"
                            >
                                <Download size={18} /> SVG
                            </button>
                            <a
                                href="/app/qrcodes"
                                className="col-span-2 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition-colors text-center"
                            >
                                Ver em Meus QRs
                            </a>
                        </div>

                        <div className="sr-only" aria-hidden="true">
                            <QRCodeCanvas id="qr-result-canvas" value={qrUrl} size={1024} includeMargin />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
