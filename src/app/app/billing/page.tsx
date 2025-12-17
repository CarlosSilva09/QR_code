'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Crown, Loader2 } from 'lucide-react';

interface SubscriptionData {
    status: string | null;
    currentPeriodEnd: string | null;
}

export default function BillingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

    const success = searchParams.get('success');

    useEffect(() => {
        const fetchSubscription = async () => {
            // If returning from successful checkout, sync with Stripe first
            if (success) {
                try {
                    await fetch('/api/user/sync-subscription', { method: 'POST' });
                } catch (e) {
                    console.error('Failed to sync subscription:', e);
                }
            }

            // Then fetch subscription status
            fetch('/api/user/subscription')
                .then(res => res.json())
                .then(data => {
                    setSubscription(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        };

        fetchSubscription();
    }, [success]);

    const handleCheckout = async (plan: 'monthly' | 'yearly') => {
        setCheckoutLoading(plan);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.message || 'Erro ao iniciar pagamento');
                setCheckoutLoading(null);
            }
        } catch {
            alert('Erro de conexão');
            setCheckoutLoading(null);
        }
    };

    const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Assinatura</h1>
            <p className="text-gray-400 mb-8">Gerencie seu plano.</p>

            {success && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg mb-8">
                    🎉 Pagamento confirmado! Sua assinatura está ativa.
                </div>
            )}

            {isActive ? (
                <div className="glass-panel p-8 rounded-2xl mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-500/10 rounded-full">
                            <Crown className="text-green-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Plano Ativo</h2>
                            <p className="text-gray-400">Sua assinatura está ativa</p>
                        </div>
                    </div>

                    {subscription?.currentPeriodEnd && (
                        <p className="text-gray-500 text-sm">
                            Próxima renovação: {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                        </p>
                    )}

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <h3 className="font-bold mb-4">Seus benefícios:</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex gap-2"><Check className="text-green-500" size={18} /> QR Codes ilimitados</li>
                            <li className="flex gap-2"><Check className="text-green-500" size={18} /> Edição a qualquer momento</li>
                            <li className="flex gap-2"><Check className="text-green-500" size={18} /> Download PNG e SVG</li>
                            <li className="flex gap-2"><Check className="text-green-500" size={18} /> Suporte prioritário</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <>
                    <div className="glass-panel p-8 rounded-2xl mb-8 border-yellow-500/30">
                        <h2 className="text-xl font-bold mb-2">Você ainda não tem uma assinatura</h2>
                        <p className="text-gray-400 mb-4">
                            Assine agora para desbloquear QR Codes definitivos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Monthly */}
                        <div className="glass-panel p-6 rounded-xl">
                            <h3 className="font-bold text-lg mb-2">Mensal</h3>
                            <div className="text-3xl font-bold mb-4">
                                R$ 29<span className="text-sm font-normal text-gray-500">/mês</span>
                            </div>
                            <ul className="space-y-2 text-gray-400 text-sm mb-6">
                                <li className="flex gap-2"><Check size={16} className="text-green-500" /> QRs ilimitados</li>
                                <li className="flex gap-2"><Check size={16} className="text-green-500" /> Edição livre</li>
                            </ul>
                            <button
                                onClick={() => handleCheckout('monthly')}
                                disabled={checkoutLoading !== null}
                                className="w-full py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {checkoutLoading === 'monthly' && <Loader2 className="animate-spin" size={18} />}
                                Assinar Mensal
                            </button>
                        </div>

                        {/* Yearly */}
                        <div className="glass-panel p-6 rounded-xl border-blue-500/30">
                            <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded inline-block mb-2">Economize 17%</div>
                            <h3 className="font-bold text-lg mb-2">Anual</h3>
                            <div className="text-3xl font-bold mb-4">
                                R$ 290<span className="text-sm font-normal text-gray-500">/ano</span>
                            </div>
                            <ul className="space-y-2 text-gray-400 text-sm mb-6">
                                <li className="flex gap-2"><Check size={16} className="text-blue-500" /> Tudo do mensal</li>
                                <li className="flex gap-2"><Check size={16} className="text-blue-500" /> 2 meses grátis</li>
                            </ul>
                            <button
                                onClick={() => handleCheckout('yearly')}
                                disabled={checkoutLoading !== null}
                                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-bold"
                            >
                                {checkoutLoading === 'yearly' && <Loader2 className="animate-spin" size={18} />}
                                Assinar Anual
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
