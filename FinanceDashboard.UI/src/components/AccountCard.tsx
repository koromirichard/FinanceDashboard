import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Account } from '../types';

interface AccountCardProps {
  account: Account;
  formatCurrency: (value: number, currency: string) => string;
  onChange: () => void;
}

export default function AccountCard({ account, formatCurrency, onChange }: AccountCardProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(account.name);

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditName(account.name);
  };

  const saveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://localhost:7145/api/accounts/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: editName, currency: account.currency, balance: account.balance })
      });
      if (!response.ok) throw new Error('Hiba a névváltoztatás mentésekor.');
      setIsEditing(false);
      onChange();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Biztosan törölni szeretnéd ezt a számlát?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://localhost:7145/api/accounts/${account.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Nem sikerült törölni a számlát.');
      onChange();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div 
      onClick={() => !isEditing && navigate(`/account/${account.id}`)} 
      className={`bg-slate-800/70 p-5 sm:p-6 rounded-2xl border shadow-xl relative group transition-colors duration-200 ${isEditing ? 'border-blue-500/50 cursor-default' : 'border-slate-700/50 hover:border-slate-500/50 cursor-pointer hover:bg-slate-800/90'}`}
    >
      {isEditing ? (
        <div onClick={(e) => e.stopPropagation()}>
          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-2 mb-4 bg-slate-900 text-white font-semibold rounded border border-blue-500/50 outline-none" autoFocus />
          <div className="flex gap-2">
            <button onClick={saveEdit} className="flex-1 bg-emerald-600/90 hover:bg-emerald-500 text-white py-1.5 rounded text-sm font-semibold transition">Mentés</button>
            <button onClick={cancelEdit} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-1.5 rounded text-sm transition">Mégse</button>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute top-3 right-3 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <button onClick={startEdit} className="bg-slate-700/80 hover:bg-slate-600 text-slate-300 p-1.5 rounded-lg" title="Név szerkesztése">✏️</button>
            <button onClick={handleDelete} className="bg-red-900/40 hover:bg-red-800/60 text-red-300 p-1.5 rounded-lg" title="Törlés">✖</button>
          </div>
          <h2 className="text-lg font-semibold text-blue-300 mb-3 pr-16">{account.name}</h2>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {formatCurrency(account.balance, account.currency)} <span className="text-sm sm:text-base text-slate-400 font-normal">{account.currency}</span>
          </p>
        </>
      )}
    </div>
  );
}