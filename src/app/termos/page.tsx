import Link from "next/link";

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/register" className="text-sm text-gray-400 hover:text-white">
          Voltar
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-6">Termos de Uso</h1>
        <p className="text-gray-300 leading-relaxed">
          Esta página é um placeholder. Substitua pelo seu texto de termos de uso.
        </p>
      </div>
    </main>
  );
}

