'use client'
import { useEffect, useState } from 'react';
import AdminShell from '../../../components/AdminShell';
import { api } from '../../../lib/api';

const statuses = [
  ['AVAILABLE', 'Disponível'],
  ['IN_SERVICE', 'Em atendimento'],
  ['PAUSED', 'Em pausa'],
  ['CLOSED', 'Encerrado'],
  ['UNAVAILABLE', 'Indisponível']
];

const empty = { name: '', floor: '', description: '', doctorId: '' };

export default function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setRooms(await api('/api/rooms'));
    setDocs(await api('/api/doctors'));
  }
  useEffect(() => { load(); }, []);

  function edit(room: any) {
    setEditingId(room.id);
    setForm({ name: room.name || '', floor: room.floor || '', description: room.description || '', doctorId: room.doctorId || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() { setEditingId(null); setForm(empty); }

  async function save(e: any) {
    e.preventDefault();
    const payload = { ...form, doctorId: form.doctorId || null };
    if (editingId) await api(`/api/rooms/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
    else await api('/api/rooms', { method: 'POST', body: JSON.stringify(payload) });
    cancelEdit();
    await load();
  }

  async function status(id: string, s: string) {
    await api(`/api/rooms/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: s }) });
    await load();
  }

  async function updateDoctor(id: string, doctorId: string) {
    await api(`/api/rooms/${id}`, { method: 'PUT', body: JSON.stringify({ doctorId: doctorId || null }) });
    await load();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Excluir/desativar a sala "${name}"? Tablets vinculados ficarão sem sala.`)) return;
    await api(`/api/rooms/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="page-title">Salas</h1>
        <p className="page-subtitle">Cadastre, edite, exclua/desative salas e controle o status exibido nos tablets.</p>
      </div>

      <form onSubmit={save} className="card grid gap-3 md:grid-cols-5 mb-6">
        <input className="input" placeholder="Nome/número" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Andar/setor" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} />
        <input className="input" placeholder="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <select className="input" value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
          <option value="">Médico</option>
          {docs.map(d => <option value={d.id} key={d.id}>{d.name}</option>)}
        </select>
        <div className="flex gap-2">
          <button className="btn flex-1">{editingId ? 'Salvar' : 'Adicionar'}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="btn2">Cancelar</button>}
        </div>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr><th className="pb-3">Sala</th><th className="pb-3">Médico</th><th className="pb-3">Status</th><th className="pb-3 text-right">Ações</th></tr>
          </thead>
          <tbody>
            {rooms.map(r => (
              <tr className="table-row" key={r.id}>
                <td className="py-4"><b>{r.name}</b><p className="text-xs text-slate-500">{r.floor || '-'} {r.description ? `• ${r.description}` : ''}</p></td>
                <td><select className="input min-w-52" value={r.doctorId || ''} onChange={e => updateDoctor(r.id, e.target.value)}><option value="">Sem médico</option>{docs.map(d => <option value={d.id} key={d.id}>{d.name}</option>)}</select></td>
                <td><select className="input min-w-44" value={r.status} onChange={e => status(r.id, e.target.value)}>{statuses.map(s => <option value={s[0]} key={s[0]}>{s[1]}</option>)}</select></td>
                <td className="text-right"><div className="flex justify-end gap-2"><button className="btn2" onClick={() => edit(r)}>Editar</button><button className="btn-danger" onClick={() => remove(r.id, r.name)}>Excluir</button></div></td>
              </tr>
            ))}
            {!rooms.length && <tr><td colSpan={4} className="py-8 text-center text-slate-500">Nenhuma sala cadastrada.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
