import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="py-12 border-t border-white/10 bg-black text-center text-gray-500 text-sm">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                <p>&copy; {new Date().getFullYear()} QR Definitivo. Todos os direitos reservados.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <Link href="#" className="hover:text-white">Termos</Link>
                    <Link href="#" className="hover:text-white">Privacidade</Link>
                </div>
            </div>
        </footer>
    )
}
