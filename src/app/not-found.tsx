import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050710] flex flex-col items-center justify-center text-white p-4">
      <h2 className="text-2xl font-bold mb-2">Pagina non trovata</h2>
      <p className="text-sm text-slate-400 mb-4">La pagina cercata non esiste.</p>
      <Link href="/" className="px-4 py-2 bg-cyan-500 text-black text-xs font-bold rounded-xl">
        Torna alla pagina principale
      </Link>
    </div>
  );
}
