export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
export function token(){ if(typeof window==='undefined') return ''; return localStorage.getItem('token') || '' }
export async function api(path:string, options:RequestInit={}){
  const headers:any = {'Content-Type':'application/json', ...(options.headers||{})}
  const t = token(); if(t) headers.Authorization = `Bearer ${t}`
  const res = await fetch(`${API}${path}`, {...options, headers})
  if(!res.ok) throw new Error((await res.json().catch(()=>({error:'Erro'}))).error || 'Erro')
  return res.json()
}
export function uploadUrl(path:string){ return `${API}${path}` }
