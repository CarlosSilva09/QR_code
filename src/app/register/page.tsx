'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password strength indicators
    const passwordChecks = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        match: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0,
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    termsAccepted: formData.termsAccepted,
                }),
            });

            if (res.ok) {
                router.push('/login?registered=true');
            } else {
                const data = await res.json();
                setError(data.message || 'Erro ao criar conta.');
                setLoading(false);
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tl from-purple-900/20 to-blue-900/10 z-0" />

            <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl relative z-10 shadow-2xl">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 text-sm">
                    <ArrowLeft size={16} className="mr-2" /> Voltar
                </Link>

                <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
                <p className="text-gray-400 mb-8">Preencha seus dados para começar.</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nome completo *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            required
                            placeholder="Seu nome"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            required
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Telefone (opcional)</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="(11) 99999-9999"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Senha *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Confirmar Senha *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    {/* Password strength indicators */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center gap-1 ${passwordChecks.length ? 'text-green-400' : 'text-gray-500'}`}>
                            {passwordChecks.length ? <Check size={14} /> : <X size={14} />} Mínimo 8 caracteres
                        </div>
                        <div className={`flex items-center gap-1 ${passwordChecks.uppercase ? 'text-green-400' : 'text-gray-500'}`}>
                            {passwordChecks.uppercase ? <Check size={14} /> : <X size={14} />} 1 letra maiúscula
                        </div>
                        <div className={`flex items-center gap-1 ${passwordChecks.number ? 'text-green-400' : 'text-gray-500'}`}>
                            {passwordChecks.number ? <Check size={14} /> : <X size={14} />} 1 número
                        </div>
                        <div className={`flex items-center gap-1 ${passwordChecks.match ? 'text-green-400' : 'text-gray-500'}`}>
                            {passwordChecks.match ? <Check size={14} /> : <X size={14} />} Senhas coincidem
                        </div>
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                        <input
                            type="checkbox"
                            name="termsAccepted"
                            id="terms"
                            checked={formData.termsAccepted}
                            onChange={handleChange}
                            className="mt-1 w-4 h-4 rounded border-white/20 bg-black/50 text-blue-600 focus:ring-blue-500"
                            required
                        />
                        <label htmlFor="terms" className="text-sm text-gray-400">
                            Li e aceito os <Link href="/termos" className="text-blue-400 hover:underline">Termos de Uso</Link> e a <Link href="/privacidade" className="text-blue-400 hover:underline">Política de Privacidade</Link> *
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !Object.values(passwordChecks).every(Boolean) || !formData.termsAccepted}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Criando conta...' : 'Criar Conta'}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-500 text-sm">
                    Já tem uma conta? <Link href="/login" className="text-blue-400 hover:text-blue-300">Faça login</Link>
                </p>
            </div>
        </div>
    );
}
