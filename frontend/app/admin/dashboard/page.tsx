'use client'
import { useEffect, useState } from 'react';
import AdminShell from '../../../components/AdminShell';
import { api } from '../../../lib/api';

const labels: any = { AVAILABLE: 'Disponível', IN_SERVICE: 'Em atendimento', PAUSED: 'Em pausa', CLOSED: 'Encerrado', UNAVAILABLE: 'Indisponível' };

export default function Dashboard() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  async function load() { setRooms(await api('/api/rooms')); setDevices(await api('/api/devices')); setDoctors(await api('/api/doctors')); }
  useEffect(() => { load().catch(() => {}); }, []);
  const inService = rooms.filter(r => r.status === 'IN_SERVICE').length;
  const cards = [['Médicos', doctors.length], ['Salas', rooms.length], ['Tablets online', devices.filter(d => d.isOnline).length], ['Em atendimento', inService]];

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão rápida da operação dos displays de sala.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {cards.map(c => <div className="card" key={c[0]}><p className="text-sm font-semibold text-slate-500">{c[0]}</p><strong className="text-4xl font-black text-slate-950">{c[1]}</strong></div>)}
      </div>
      <div className="card overflow-x-auto">
        <h2 className="font-black text-xl mb-4">Salas</h2>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr><th className="pb-3">Sala</th><th className="pb-3">Médico</th><th className="pb-3">Status</th></tr></thead>
          <tbody>{rooms.map(r => <tr className="table-row" key={r.id}><td className="py-3 font-semibold">{r.name}</td><td>{r.doctor?.name || 'Sem médico'}</td><td>{labels[r.status] || r.status}</td></tr>)}</tbody>
        </table>
      </div>
    </AdminShell>
  );
}
