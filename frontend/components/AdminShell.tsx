'use client'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const nav = [
  ['Dashboard', '/admin/dashboard'],
  ['Médicos', '/admin/doctors'],
  ['Salas', '/admin/rooms'],
  ['Tablets', '/admin/devices'],
  ['Relatórios', '/admin/reports']
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  function logout() { localStorage.removeItem('token'); router.push('/login'); }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 bg-slate-950 text-white p-6 overflow-y-auto">
        <div className="mb-9">
          <div className="h-11 w-11 rounded-2xl bg-blue-600 grid place-items-center font-black mb-4">CR</div>
          <h1 className="text-2xl font-black">Clinic Room</h1>
          <p className="text-sm text-slate-400">Display inteligente para clínicas</p>
        </div>
        <nav className="space-y-2">
          {nav.map(([label, href]) => {
            const active = pathname === href;
            return <Link key={href} className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`} href={href}>{label}</Link>
          })}
        </nav>
        <button onClick={logout} className="mt-10 w-full rounded-2xl border border-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white">Sair</button>
      </aside>
      <main className="min-h-screen flex-1 p-5 md:p-8 lg:ml-72">
        {children}
      </main>
    </div>
  );
}
