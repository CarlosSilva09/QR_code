'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Link as LinkIcon, Wifi, MessageSquare, AlignLeft, Lock } from 'lucide-react';
import clsx from 'clsx';

type QRType = 'link' | 'wifi' | 'whatsapp' | 'text';

export default function QRGenerator() {
    const [type, setType] = useState<QRType>('link');
    const [payload, setPayload] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasSubscription, setHasSubscription] = useState<boolean | null>(null); // null = loading
    const [showPaywall, setShowPaywall] = useState(false);

    // Specific state for inputs
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiPass, setWifiPass] = useState('');
    const [whatsappPhone, setWhatsappPhone] = useState('');

    useEffect(() => {
        // Check subscription status
        fetch('/api/user/subscription')
            .then(res => res.json())
            .then(data => setHasSubscription(data.active))
            .catch(() => setHasSubscription(false));
    }, []);

    // Construct payload based on type
    useEffect(() => {
        if (type === 'link') setPayload(payload); // from input
        else if (type === 'text') setPayload(payload);
        else if (type === 'wifi') setPayload(`WIFI:S:${wifiSsid};T:WPA;P:${wifiPass};;`);
        else if (type === 'whatsapp') setPayload(`https://wa.me/${whatsappPhone}`);
    }, [type, wifiSsid, wifiPass, whatsappPhone, payload]); // Dependency on raw payload for text/link matches

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
                body: JSON.stringify({ type, payload, name }),
            });
            if (res.ok) {
                alert('QR Definitivo criado com sucesso!');
                // Redirect or refresh list
                window.location.href = '/app/qrcodes';
            } else {
                alert('Erro ao criar QR Code.');
            }
        } catch (e) {
            alert('Erro de conexão.');
        }
        setLoading(false);
    };

    const handleDownload = (format: 'png' | 'svg') => {
        const svg = document.getElementById('qr-preview');
        if (!svg) return;

        if (format === 'svg') {
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qrcode-${name || 'definitivo'}.svg`;
            a.click();
        } else {
            // PNG requires drawing to canvas
            const svgData = new XMLSerializer().serializeToString(svg);
            const img = new Image();
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 1000; // High res
                canvas.height = 1000;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height); // white bg
                    ctx.drawImage(img, 0, 0, 1000, 1000);
                    const a = document.createElement('a');
                    a.href = canvas.toDataURL('image/png');
                    a.download = `qrcode-${name || 'definitivo'}.png`;
                    a.click();
                }
            };
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Input Section */}
            <div className="flex-1 space-y-8">

                {/* Type Selector */}
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
                                "flex flex-col items-center gap-2 px-6 py-4 rounded-lg min-w-[100px] transition-colors",
                                type === t.id ? "bg-blue-600 text-white" : "hover:bg-white/5 text-gray-400"
                            )}
                        >
                            <t.icon size={24} />
                            <span className="text-sm font-medium">{t.label}</span>
                        </button>
                    ))}
                </div>

                {/* Dynamic Inputs */}
                <div className="glass-panel p-6 rounded-xl space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Nome do QR (para sua organização)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                            placeholder="Ex: Wi-Fi Escritório"
                        />
                    </div>

                    {type === 'link' && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">URL de Destino</label>
                            <input
                                type="url"
                                value={payload}
                                onChange={(e) => setPayload(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                                placeholder="https://seu-site.com"
                            />
                        </div>
                    )}

                    {type === 'wifi' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nome da Rede (SSID)</label>
                                <input type="text" value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Senha</label>
                                <input type="text" value={wifiPass} onChange={e => setWifiPass(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3" />
                            </div>
                        </div>
                    )}

                    {/* Add other types logic... */}
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold text-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? 'Processando...' : (
                        <>
                            <Lock size={20} />
                            Gerar QR Definitivo
                        </>
                    )}
                </button>
            </div>

            {/* Preview Section */}
            <div className="w-full lg:w-96 flex flex-col gap-4">
                <div className="glass-panel p-8 rounded-xl flex flex-col items-center justify-center aspect-square bg-white/5">
                    <QRCodeSVG
                        id="qr-preview"
                        value={payload || 'https://qr-definitivo.com'}
                        size={256}
                        bgColor={"transparent"}
                        fgColor={"#FFFFFF"}
                        level={"H"}
                        className="w-full h-full"
                    />
                </div>
                <div className="flex gap-4">
                    <button onClick={() => handleDownload('png')} className="flex-1 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex justify-center gap-2">
                        <Download size={18} /> PNG
                    </button>
                    <button onClick={() => handleDownload('svg')} className="flex-1 py-3 glass-panel font-bold rounded-lg hover:bg-white/10 transition-colors flex justify-center gap-2">
                        <Download size={18} /> SVG
                    </button>
                </div>
            </div>

            {/* Paywall Modal */}
            {showPaywall && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center relative">
                        <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
                            <Lock size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Ative seu plano</h3>
                        <p className="text-gray-400 mb-6">Para gerar QRs definitivos e gerenciáveis, você precisa de uma assinatura ativa.</p>
                        <a href="/pricing" className="block w-full py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                            Ver Planos
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
