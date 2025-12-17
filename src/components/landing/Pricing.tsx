'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
    return (
        <section id="pricing" className="py-24 px-6 bg-black">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Planos Simples</h2>
                <p className="text-gray-400 mb-16">Comece a usar agora.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Monthly Plan */}
                    <div className="glass-panel p-8 rounded-2xl flex flex-col items-center">
                        <h3 className="text-xl font-bold mb-2">Mensal</h3>
                        <div className="text-4xl font-bold mb-6">R$ 29<span className="text-lg font-normal text-gray-500">/mês</span></div>
                        <ul className="space-y-4 mb-8 text-left w-full">
                            <li className="flex gap-2"><Check className="text-green-500" size={20} /> QRs Ilimitados</li>
                            <li className="flex gap-2"><Check className="text-green-500" size={20} /> Edição a qualquer momento</li>
                            <li className="flex gap-2"><Check className="text-green-500" size={20} /> Analytics Básico</li>
                        </ul>
                        <Link href="/pricing" className="w-full py-4 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-center block">Escolher Mensal</Link>
                    </div>

                    {/* Yearly Plan */}
                    <div className="glass-panel p-8 rounded-2xl flex flex-col items-center border-blue-500/50 relative">
                        <div className="absolute -top-4 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Recomendado</div>
                        <h3 className="text-xl font-bold mb-2">Anual</h3>
                        <div className="text-4xl font-bold mb-6">R$ 290<span className="text-lg font-normal text-gray-500">/ano</span></div>
                        <p className="text-green-400 text-sm mb-6">2 meses grátis</p>
                        <ul className="space-y-4 mb-8 text-left w-full">
                            <li className="flex gap-2"><Check className="text-blue-500" size={20} /> Tudo do mensal</li>
                            <li className="flex gap-2"><Check className="text-blue-500" size={20} /> Suporte Prioritário</li>
                            <li className="flex gap-2"><Check className="text-blue-500" size={20} /> Domínios personalizados (breve)</li>
                        </ul>
                        <Link href="/pricing" className="w-full py-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-center block font-bold">Escolher Anual</Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
