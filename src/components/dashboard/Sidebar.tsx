'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, QrCode, CreditCard, LogOut, Shield } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

const navItems = [
    { name: 'Gerar QR', href: '/app', icon: QrCode },
    { name: 'Meus QRs', href: '/app/qrcodes', icon: LayoutDashboard },
    { name: 'Assinatura', href: '/app/billing', icon: CreditCard },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetch('/api/user/role')
            .then(res => res.json())
            .then(data => setIsAdmin(data.role === 'admin'))
            .catch(() => { });
    }, []);

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-900 border-r border-white/10 flex flex-col z-20">
            <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    QR Definitivo
                </h2>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                                isActive ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon size={20} />
                            {item.name}
                        </Link>
                    );
                })}

                {isAdmin && (
                    <Link
                        href="/app/admin"
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                            pathname === '/app/admin' ? "bg-purple-600/10 text-purple-400 border border-purple-600/20" : "text-purple-400/60 hover:text-purple-400 hover:bg-purple-500/10"
                        )}
                    >
                        <Shield size={20} />
                        Admin
                    </Link>
                )}
            </nav>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                >
                    <LogOut size={20} />
                    Sair
                </button>
            </div>
        </aside>
    );
}
