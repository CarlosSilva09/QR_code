import Hero from '@/components/landing/Hero';
import Steps from '@/components/landing/Steps';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 backdrop-blur-md bg-black/50 border-b border-white/10">
        <div className="text-xl font-bold tracking-tighter">QR Definitivo</div>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-blue-400 transition-colors">Login</Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-blue-400 transition-colors">Planos</Link>
        </div>
      </nav>
      <Hero />
      <Steps />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}
