import { redirect } from "next/navigation";
import { isUserAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
    const isAdmin = await isUserAdmin();

    if (!isAdmin) {
        redirect("/app");
    }

    const users = await prisma.user.findMany({
        include: { subscription: true, _count: { select: { qrcodes: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    const stats = {
        totalUsers: await prisma.user.count(),
        activeSubscriptions: await prisma.subscription.count({ where: { status: "active" } }),
        totalQRs: await prisma.qRCode.count(),
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Painel Admin</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-xl">
                    <p className="text-gray-400 text-sm">Total de Usuários</p>
                    <p className="text-4xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="glass-panel p-6 rounded-xl">
                    <p className="text-gray-400 text-sm">Assinaturas Ativas</p>
                    <p className="text-4xl font-bold text-green-400">{stats.activeSubscriptions}</p>
                </div>
                <div className="glass-panel p-6 rounded-xl">
                    <p className="text-gray-400 text-sm">QR Codes Criados</p>
                    <p className="text-4xl font-bold text-blue-400">{stats.totalQRs}</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="text-left p-4 text-gray-400 font-medium">Usuário</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                            <th className="text-left p-4 text-gray-400 font-medium">QRs</th>
                            <th className="text-left p-4 text-gray-400 font-medium">Cadastro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-t border-white/5 hover:bg-white/5">
                                <td className="p-4">
                                    <div>
                                        <p className="font-medium">{user.name || user.email}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin'
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : user.subscription?.status === 'active'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        {user.role === 'admin' ? 'Admin' : user.subscription?.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="p-4">{user._count.qrcodes}</td>
                                <td className="p-4 text-gray-400 text-sm">
                                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
