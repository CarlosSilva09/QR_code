'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Steps() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.step-card', {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 80%',
                },
                y: 100,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8,
                ease: 'power3.out',
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const steps = [
        {
            number: '01',
            title: 'Crie sua conta',
            description: 'Cadastre-se em segundos e acesse o painel.',
        },
        {
            number: '02',
            title: 'Assine um plano',
            description: 'Escolha a opção que cabe no seu bolso para liberar QRs definitivos.',
        },
        {
            number: '03',
            title: 'Gere seu QR',
            description: 'Crie QRs para WhatsApp, Wi-Fi ou Links e edite o destino quando quiser.',
        },
    ];

    return (
        <section ref={containerRef} className="py-24 px-6 bg-black relative">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Como funciona</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="step-card glass-panel p-8 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-colors">
                            <span className="text-7xl font-bold leading-none text-white/5 absolute top-6 right-6 transition-transform group-hover:scale-110">
                                {step.number}
                            </span>
                            <h3 className="text-2xl font-bold mb-4 relative z-10">{step.title}</h3>
                            <p className="text-gray-400 relative z-10">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
