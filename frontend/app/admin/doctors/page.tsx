'use client'
import { useEffect, useState } from 'react';
import AdminShell from '../../../components/AdminShell';
import { api, API } from '../../../lib/api';

const empty = { name: '', specialty: '', crm: '', phone: '', email: '' };

export default function Doctors() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function load() {
    setItems(await api('/api/doctors'));
  }

  useEffect(() => { load(); }, []);

  function edit(doctor: any) {
    setEditingId(doctor.id);
    setForm({
      name: doctor.name || '',
      specialty: doctor.specialty || '',
      crm: doctor.crm || '',
      phone: doctor.phone || '',
      email: doctor.email || ''
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
    setError('');
  }

  async function save(e: any) {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        ...form,
        crm: form.crm || null,
        phone: form.phone || null,
        email: form.email || null
      };

      if (editingId) await api(`/api/doctors/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await api('/api/doctors', { method: 'POST', body: JSON.stringify(payload) });

      cancelEdit();
      await load();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar médico.');
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Excluir/desativar o médico "${name}"? Ele também será desvinculado das salas onde estiver cadastrado.`)) return;
    setError('');

    try {
      await api(`/api/doctors/${id}`, { method: 'DELETE' });
      if (editingId === id) cancelEdit();
      await load();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir médico.');
    }
  }

  async function photo(id: string, file?: File) {
    if (!file) return;
    setError('');

    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch(`${API}/api/doctors/${id}/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd
      });
      if (!res.ok) throw new Error('Erro ao enviar foto.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar foto.');
    }
  }

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="page-title">Médicos</h1>
        <p className="page-subtitle">Cadastre, edite, envie foto e exclua/desative médicos vinculados às salas.</p>
      </div>

      <form onSubmit={save} className="card grid gap-3 md:grid-cols-6 mb-4">
        <input className="input md:col-span-2" required placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="input" required placeholder="Especialidade" value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} />
        <input className="input" placeholder="CRM" value={form.crm} onChange={e => setForm({ ...form, crm: e.target.value })} />
        <input className="input" placeholder="Telefone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <input className="input" placeholder="E-mail" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <div className="md:col-span-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {editingId && <button type="button" onClick={cancelEdit} className="btn2">Cancelar edição</button>}
          <button className="btn">{editingId ? 'Salvar alterações' : 'Adicionar médico'}</button>
        </div>
      </form>

      {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="pb-3">Médico</th>
              <th className="pb-3">CRM</th>
              <th className="pb-3">Contato</th>
              <th className="pb-3">Foto</th>
              <th className="pb-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map(d => (
              <tr className="table-row" key={d.id}>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    {d.photoUrl
                      ? <img src={`${API}${d.photoUrl}`} className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100" alt={d.name} />
                      : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-600">{String(d.name || '?').slice(0, 1).toUpperCase()}</div>}
                    <div>
                      <b>{d.name}</b>
                      <p className="text-xs text-slate-500">{d.specialty}</p>
                    </div>
                  </div>
                </td>
                <td>{d.crm || '-'}</td>
                <td><p>{d.phone || '-'}</p><p className="text-xs text-slate-500">{d.email || ''}</p></td>
                <td><input className="text-xs" type="file" accept="image/*" onChange={e => photo(d.id, e.target.files?.[0] as File)} /></td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" className="btn2" onClick={() => edit(d)}>Editar</button>
                    <button type="button" className="btn-danger" onClick={() => remove(d.id, d.name)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={5} className="py-8 text-center text-slate-500">Nenhum médico cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
