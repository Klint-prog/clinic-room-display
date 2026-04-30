'use client'
import { useEffect, useState } from 'react';
import AdminShell from '../../../components/AdminShell';
import { api, API, token } from '../../../lib/api';

const statusLabel: any = {
  AVAILABLE: 'Disponível',
  IN_SERVICE: 'Em atendimento',
  PAUSED: 'Em pausa',
  CLOSED: 'Encerrado',
  UNAVAILABLE: 'Indisponível'
};

export default function Reports() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { setReport(await api('/api/reports/summary')); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function downloadPdf() {
    const res = await fetch(`${API}/api/reports/summary.pdf`, { headers: { Authorization: `Bearer ${token()}` } });
    if (!res.ok) return alert('Não foi possível gerar o PDF.');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-clinic-room-display.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const totals = report?.totals;

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Resumo operacional de salas, médicos, tablets e status atuais.</p>
        </div>
        <button onClick={downloadPdf} className="btn">Baixar PDF</button>
      </div>

      {loading && <div className="card text-slate-500">Carregando relatório...</div>}

      {report && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5 mb-6">
            <div className="card"><p className="text-sm text-slate-500">Médicos</p><strong className="text-4xl">{totals.doctors}</strong></div>
            <div className="card"><p className="text-sm text-slate-500">Salas</p><strong className="text-4xl">{totals.rooms}</strong></div>
            <div className="card"><p className="text-sm text-slate-500">Tablets</p><strong className="text-4xl">{totals.devices}</strong></div>
            <div className="card"><p className="text-sm text-slate-500">Online</p><strong className="text-4xl">{totals.onlineDevices}</strong></div>
            <div className="card"><p className="text-sm text-slate-500">Em atendimento</p><strong className="text-4xl">{totals.roomsInService}</strong></div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="card overflow-x-auto">
              <h2 className="mb-4 text-xl font-black">Salas por status</h2>
              <table className="w-full text-left text-sm">
                <tbody>
                  {Object.entries(report.roomsByStatus).map(([status, qty]: any) => (
                    <tr className="table-row" key={status}><td className="py-3">{statusLabel[status] || status}</td><td className="text-right font-bold">{qty}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card overflow-x-auto">
              <h2 className="mb-4 text-xl font-black">Tablets</h2>
              <table className="w-full text-left text-sm">
                <tbody>
                  {report.devices.map((d: any) => (
                    <tr className="table-row" key={d.id}>
                      <td className="py-3"><b>{d.name}</b><p className="text-xs text-slate-500">{d.deviceCode}</p></td>
                      <td>{d.room?.name || 'Sem sala'}</td>
                      <td className="text-right"><span className={`badge ${d.isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{d.isOnline ? 'Online' : 'Offline'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card overflow-x-auto mt-6">
            <h2 className="mb-4 text-xl font-black">Salas</h2>
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500"><tr><th className="pb-3">Sala</th><th className="pb-3">Médico</th><th className="pb-3">Status</th><th className="pb-3">Tablets</th></tr></thead>
              <tbody>
                {report.rooms.map((r: any) => (
                  <tr className="table-row" key={r.id}>
                    <td className="py-3"><b>{r.name}</b><p className="text-xs text-slate-500">{r.floor || '-'}</p></td>
                    <td>{r.doctor?.name || 'Sem médico'}</td>
                    <td>{statusLabel[r.status] || r.status}</td>
                    <td>{r.devices?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminShell>
  );
}
