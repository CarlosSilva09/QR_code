'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Monitor, Wifi, MessageCircle, Edit } from 'lucide-react';

export default function Features() {
    const containerRef = useRef(null);

    // Animation logic similar to Steps
    useEffect(() => {
        // ... implementation of GSAP context ...
    }, []);

    return (
        <section className="py-24 px-6 bg-zinc-950">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="md:w-1/2">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Recursos Poderosos</h2>
                        <p className="text-gray-400 text-lg mb-8">
                            Tudo o que você precisa para gerenciar seus QR Codes em um só lugar.
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Edit />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Editável sempre</h4>
                                    <p className="text-sm text-gray-500">Mude o link de destino sem alterar a imagem do QR Code.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                                    <Wifi />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Múltiplos Tipos</h4>
                                    <p className="text-sm text-gray-500">Links, WhatsApp, Wi-Fi, Texto e muito mais.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center">
                        {/* Mockup or Illustration */}
                        <div className="w-full h-80 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-2xl border border-white/10 flex items-center justify-center">
                            <span className="text-white/20 font-bold text-xl">Dashboard Mockup</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
