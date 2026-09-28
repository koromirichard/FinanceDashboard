import { useState } from 'react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: number;
  currency: string;
  onSuccess: () => void;
}

export default function AddTransactionModal({ isOpen, onClose, accountId, currency, onSuccess }: AddTransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Bevásárlás');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Expense');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
    const dotIndex = rawValue.indexOf('.');
    if (dotIndex !== -1) {
      rawValue = rawValue.slice(0, dotIndex + 1) + rawValue.slice(dotIndex + 1).replace(/\./g, '');
    }
    setAmount(rawValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    
    let finalAmount = Number(amount);
    if (type === 'Expense') finalAmount = -Math.abs(finalAmount);
    else finalAmount = Math.abs(finalAmount);

    try {
      const response = await fetch('https://localhost:7145/api/Transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ accountId, amount: finalAmount, category, description })
      });

      if (!response.ok) throw new Error('Hiba a tranzakció mentésekor.');

      setAmount('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm z-50">
      <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-md relative">
        <h2 className="text-2xl font-bold text-white mb-6">Új tranzakció</h2>
        {error && <div className="text-red-400 mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 mb-6">
            <button type="button" onClick={() => {setType('Expense'); setCategory('Bevásárlás')}} className={`flex-1 py-2 rounded-lg font-semibold transition ${type === 'Expense' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-slate-800 text-slate-400 border border-transparent'}`}>Kiadás</button>
            <button type="button" onClick={() => {setType('Income'); setCategory('Fizetés')}} className={`flex-1 py-2 rounded-lg font-semibold transition ${type === 'Income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-400 border border-transparent'}`}>Bevétel</button>
          </div>
          <div className="mb-4">
            <label className="block text-slate-300 mb-2 text-sm font-medium">Összeg</label>
            <div className="relative">
              <input type="text" inputMode="numeric" value={amount ? Number(amount.toString().replace(/\D/g, '')).toLocaleString('hu-HU') : ''} onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); handleAmountChange(e); }} className="w-full p-3 bg-slate-800 text-white rounded-xl border border-slate-600 focus:border-emerald-500 outline-none pl-4 pr-16" placeholder="0" required />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">{currency}</span>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-slate-300 mb-2 text-sm font-medium">Kategória</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 bg-slate-800 text-white rounded-xl border border-slate-600 focus:border-emerald-500 outline-none">
              {type === 'Expense' ? (
                <><option value="Bevásárlás">Bevásárlás</option><option value="Számlák/Rezsi">Számlák / Rezsi</option><option value="Közlekedés">Közlekedés</option><option value="Szórakozás">Szórakozás</option><option value="Egészség">Egészség</option><option value="Egyéb">Egyéb</option></>
              ) : (
                <><option value="Fizetés">Fizetés</option><option value="Befektetés">Befektetés</option><option value="Ajándék">Ajándék</option><option value="Egyéb">Egyéb</option></>
              )}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-slate-300 mb-2 text-sm font-medium">Megjegyzés (Opcionális)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 bg-slate-800 text-white rounded-xl border border-slate-600 focus:border-emerald-500 outline-none placeholder-slate-500" placeholder="Pl.: Heti nagybevásárlás" />
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-700 text-white py-3 rounded-xl hover:bg-slate-600 transition font-medium">Mégse</button>
            <button type="submit" className={`flex-1 text-white py-3 rounded-xl transition font-bold shadow-lg ${type === 'Expense' ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'}`}>Mentés</button>
          </div>
        </form>
      </div>
    </div>
  );
}