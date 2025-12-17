'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Box } from '@react-three/drei';
import Link from 'next/link';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

function FloatingCube() {
    return (
        <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
            <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                <boxGeometry args={[2.5, 2.5, 2.5]} />
                <meshStandardMaterial color="#4f46e5" roughness={0.3} metalness={0.8} />
                <meshStandardMaterial attach="material-0" color="#4338ca" />
                <meshStandardMaterial attach="material-1" color="#3730a3" />
                {/* QR Code Texture could be applied here later */}
            </mesh>
        </Float>
    );
}

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(textRef.current, {
                opacity: 0,
                y: 50,
                duration: 1,
                ease: 'power3.out',
                delay: 0.2,
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative w-full h-screen flex flex-col md:flex-row items-center justify-center overflow-hidden px-6 pt-16">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black -z-10" />

            {/* Content */}
            <div ref={textRef} className="z-10 w-full md:w-1/2 flex flex-col items-start space-y-6 max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                    Seu QR Code <span className="text-gradient">Definitivo</span>.
                    <br />
                    Uma vez criado, sempre seu.
                </h1>
                <p className="text-gray-400 text-xl font-light max-w-lg">
                    Gerencie o destino do seu QR Code sem precisar reimprimir.
                    A solução profissional para seu negócio.
                </p>
                <div className="flex gap-4 pt-4">
                    <Link href="/pricing" className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:scale-105 transition-transform">
                        Ver Planos
                    </Link>
                    <Link href="/login" className="px-8 py-4 glass-panel text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                        Gerar meu QR
                    </Link>
                </div>
            </div>

            {/* 3D Scene */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-full relative">
                <Canvas>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <FloatingCube />
                    <OrbitControls enableZoom={false} />
                </Canvas>
            </div>
        </section>
    );
}
