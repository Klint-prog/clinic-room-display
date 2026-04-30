'use client'
import { useEffect, useState } from 'react';
import AdminShell from '../../../components/AdminShell';
import { api } from '../../../lib/api';

export default function Devices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setDevices(await api('/api/devices'));
    setRooms(await api('/api/rooms'));
  }

  useEffect(() => { load(); }, []);

  async function save(e: any) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api('/api/devices', { method: 'POST', body: JSON.stringify({ name }) });
      setName('');
      await load();
    } finally { setLoading(false); }
  }

  async function link(id: string, roomId: string) {
    await api(`/api/devices/${id}/link-room`, { method: 'POST', body: JSON.stringify({ roomId: roomId || null }) });
    await load();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Excluir o tablet "${name}"? Essa ação remove o dispositivo da lista.`)) return;
    await api(`/api/devices/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="page-title">Tablets</h1>
        <p className="page-subtitle">Cadastre os dispositivos, vincule cada tablet a uma sala e abra a tela de display.</p>
      </div>

      <form onSubmit={save} className="card flex flex-col gap-3 md:flex-row mb-6">
        <input className="input" placeholder="Nome do tablet. Ex: Tablet Sala 01" value={name} onChange={e => setName(e.target.value)} />
        <button disabled={loading} className="btn md:w-44">Cadastrar</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr><th className="pb-3">Dispositivo</th><th className="pb-3">Status</th><th className="pb-3">Sala vinculada</th><th className="pb-3 text-right">Ações</th></tr>
          </thead>
          <tbody>
            {devices.map(d => (
              <tr className="table-row" key={d.id}>
                <td className="py-4">
                  <b className="text-slate-900">{d.name}</b>
                  <p className="text-xs text-slate-500">Código: {d.deviceCode}</p>
                  <a className="text-blue-600 text-xs font-semibold hover:underline" target="_blank" href={`/display/${d.deviceCode}`}>Abrir display</a>
                </td>
                <td><span className={`badge ${d.isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{d.isOnline ? 'Online' : 'Offline'}</span></td>
                <td>
                  <select className="input min-w-52" value={d.roomId || ''} onChange={e => link(d.id, e.target.value)}>
                    <option value="">Sem sala</option>
                    {rooms.map(r => <option value={r.id} key={r.id}>{r.name}</option>)}
                  </select>
                </td>
                <td className="text-right"><button className="btn-danger" onClick={() => remove(d.id, d.name)}>Excluir</button></td>
              </tr>
            ))}
            {!devices.length && <tr><td className="py-8 text-center text-slate-500" colSpan={4}>Nenhum tablet cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
