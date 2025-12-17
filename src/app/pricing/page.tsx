'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';

export default function PricingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState('');

    const canceled = searchParams.get('canceled');

    const handleCheckout = async (plan: 'monthly' | 'yearly') => {
        if (status !== 'authenticated') {
            router.push('/login?redirect=/pricing');
            return;
        }

        setLoading(plan);
        setError('');

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
            });

            const data = await res.json();

            if (res.ok && data.url) {
                window.location.href = data.url;
            } else {
                setError(data.message || 'Erro ao processar pagamento');
                setLoading(null);
            }
        } catch (err) {
            setError('Erro de conexão');
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Nav */}
            <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 backdrop-blur-md bg-black/50 border-b border-white/10">
                <Link href="/" className="text-xl font-bold tracking-tighter">QR Definitivo</Link>
                <div className="flex gap-4">
                    {session ? (
                        <Link href="/app" className="text-sm font-medium hover:text-blue-400 transition-colors">Dashboard</Link>
                    ) : (
                        <Link href="/login" className="text-sm font-medium hover:text-blue-400 transition-colors">Login</Link>
                    )}
                </div>
            </nav>

            <main className="pt-24 pb-16 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 text-sm">
                        <ArrowLeft size={16} className="mr-2" /> Voltar ao início
                    </Link>

                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        Escolha seu <span className="text-gradient">Plano</span>
                    </h1>
                    <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
                        Desbloqueie o poder dos QR Codes definitivos. Cancele quando quiser.
                    </p>

                    {canceled && (
                        <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-4 rounded-lg mb-8 max-w-md mx-auto">
                            Pagamento cancelado. Você pode tentar novamente quando quiser.
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-8 max-w-md mx-auto">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Monthly Plan */}
                        <div className="glass-panel p-8 rounded-2xl flex flex-col">
                            <h3 className="text-xl font-bold mb-2">Mensal</h3>
                            <div className="text-5xl font-bold mb-2">
                                R$ 29
                                <span className="text-lg font-normal text-gray-500">/mês</span>
                            </div>
                            <p className="text-gray-500 mb-6">Cobrança mensal</p>

                            <ul className="space-y-4 mb-8 text-left flex-1">
                                <li className="flex gap-3"><Check className="text-green-500 shrink-0" size={20} /> QR Codes ilimitados</li>
                                <li className="flex gap-3"><Check className="text-green-500 shrink-0" size={20} /> Edição do destino a qualquer momento</li>
                                <li className="flex gap-3"><Check className="text-green-500 shrink-0" size={20} /> Download PNG e SVG</li>
                                <li className="flex gap-3"><Check className="text-green-500 shrink-0" size={20} /> Suporte por email</li>
                            </ul>

                            <button
                                onClick={() => handleCheckout('monthly')}
                                disabled={loading !== null}
                                className="w-full py-4 rounded-lg border border-white/20 hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading === 'monthly' ? <Loader2 className="animate-spin" size={20} /> : null}
                                {loading === 'monthly' ? 'Processando...' : 'Escolher Mensal'}
                            </button>
                        </div>

                        {/* Yearly Plan */}
                        <div className="glass-panel p-8 rounded-2xl flex flex-col border-blue-500/50 relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                                Mais Popular
                            </div>

                            <h3 className="text-xl font-bold mb-2">Anual</h3>
                            <div className="text-5xl font-bold mb-2">
                                R$ 290
                                <span className="text-lg font-normal text-gray-500">/ano</span>
                            </div>
                            <p className="text-green-400 mb-6">Economize R$ 58 (2 meses grátis)</p>

                            <ul className="space-y-4 mb-8 text-left flex-1">
                                <li className="flex gap-3"><Check className="text-blue-500 shrink-0" size={20} /> Tudo do plano mensal</li>
                                <li className="flex gap-3"><Check className="text-blue-500 shrink-0" size={20} /> Suporte prioritário</li>
                                <li className="flex gap-3"><Check className="text-blue-500 shrink-0" size={20} /> Analytics básico</li>
                                <li className="flex gap-3"><Check className="text-blue-500 shrink-0" size={20} /> Organização por pastas</li>
                            </ul>

                            <button
                                onClick={() => handleCheckout('yearly')}
                                disabled={loading !== null}
                                className="w-full py-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-bold"
                            >
                                {loading === 'yearly' ? <Loader2 className="animate-spin" size={20} /> : null}
                                {loading === 'yearly' ? 'Processando...' : 'Escolher Anual'}
                            </button>
                        </div>
                    </div>

                    <p className="mt-12 text-gray-500 text-sm">
                        Pagamento seguro via Stripe. Cancele a qualquer momento.
                    </p>
                </div>
            </main>
        </div>
    );
}
