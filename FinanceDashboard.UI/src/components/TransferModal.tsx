import { useState, useEffect } from 'react';
import type { Account } from '../types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceAccount: Account;
  allAccounts: Account[];
  onSuccess: () => void;
}

export default function TransferModal({ isOpen, onClose, sourceAccount, allAccounts, onSuccess }: TransferModalProps) {
  const [destinationId, setDestinationId] = useState<number | ''>('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferFee, setTransferFee] = useState('');
  const [exchangeRate, setExchangeRate] = useState<number>(1.0);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchRate = async () => {
      if (!destinationId) return;
      
      const destAccount = allAccounts.find(a => a.id === destinationId);
      if (!destAccount || sourceAccount.currency.toUpperCase() === destAccount.currency.toUpperCase()) {
        setExchangeRate(1.0);
        return;
      }

      setIsLoadingRate(true);
      try {
        const baseCurr = sourceAccount.currency.toUpperCase();
        const targetCurr = destAccount.currency.toUpperCase();
        const res = await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=${baseCurr}`);
        if (!res.ok) throw new Error(`API hiba: ${res.status}`);
        const responseData = await res.json();
        
        if (responseData.data && responseData.data.rates && responseData.data.rates[targetCurr]) {
          setExchangeRate(Number(responseData.data.rates[targetCurr]));
        } else {
          setExchangeRate(1.0);
        }
      } catch (err) {
        setExchangeRate(1.0);
      } finally {
        setIsLoadingRate(false);
      }
    };
    fetchRate();
  }, [destinationId, sourceAccount, allAccounts, isOpen]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    let rawValue = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
    const dotIndex = rawValue.indexOf('.');
    if (dotIndex !== -1) {
      rawValue = rawValue.slice(0, dotIndex + 1) + rawValue.slice(dotIndex + 1).replace(/\./g, '');
    }
    setter(rawValue);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('https://localhost:7145/api/transactions/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          sourceAccountId: sourceAccount.id,
          destinationAccountId: Number(destinationId),
          amount: Number(transferAmount),
          fee: Number(transferFee) || 0,
          exchangeRate: exchangeRate,
          description: 'Belső átutalás'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Hiba az utalás során.');
      }

      setTransferAmount('');
      setTransferFee('');
      setDestinationId('');
      setExchangeRate(1.0);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm z-50">
      <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-md relative">
        <h2 className="text-2xl font-bold text-white mb-6">Belső átutalás</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}
        <form onSubmit={handleTransferSubmit}>
          <div className="mb-4">
            <label className="block text-slate-300 mb-2 text-sm font-medium">Hová (Cél számla)</label>
            <select value={destinationId} onChange={(e) => setDestinationId(Number(e.target.value))} className="w-full p-3 bg-slate-800 text-white rounded-xl border border-slate-600 focus:border-indigo-500 outline-none" required>
              <option value="">Válassz számlát...</option>
              {allAccounts.filter(acc => acc.id !== sourceAccount.id).map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-slate-300 mb-2 text-sm font-medium">Összeg ({sourceAccount.currency})</label>
            <div className="relative">
              <input type="text" inputMode="numeric" value={transferAmount ? Number(transferAmount.toString().replace(/\D/g, '')).toLocaleString('hu-HU') : ''} onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); handleAmountChange(e, setTransferAmount); }} className="w-full p-3 bg-slate-800 text-white rounded-xl border border-slate-600 focus:border-indigo-500 outline-none pl-4 pr-16" placeholder="0" required />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">{sourceAccount.currency}</span>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-slate-300 mb-2 text-sm font-medium">Tranzakciós díj (Opcionális)</label>
            <div className="relative">
              <input type="text" inputMode="numeric" value={transferFee ? Number(transferFee.toString().replace(/\D/g, '')).toLocaleString('hu-HU') : ''} onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); handleAmountChange(e, setTransferFee); }} className="w-full p-3 bg-slate-800 text-white rounded-xl border border-slate-600 focus:border-indigo-500 outline-none pl-4 pr-16" placeholder="0" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">{sourceAccount.currency}</span>
            </div>
          </div>
          {destinationId && allAccounts.find(a => a.id === destinationId)?.currency !== sourceAccount.currency && (
            <div className="mb-6">
              <label className="text-sm text-slate-300 mb-2 font-medium flex justify-between">
                <span>Alkalmazott árfolyam</span>
                {isLoadingRate && <span className="text-indigo-400 text-xs">Betöltés...</span>}
              </label>
              <input type="number" step="0.00001" value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value))} className="w-full p-3 bg-slate-800 text-white rounded-xl border border-slate-600 focus:border-indigo-500 outline-none" required />
            </div>
          )}
          <div className="flex gap-4 mt-6">
            <button type="button" onClick={() => { onClose(); setError(''); }} className="flex-1 bg-slate-700 text-white py-3 rounded-xl hover:bg-slate-600 transition font-medium">Mégse</button>
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl transition font-bold shadow-lg shadow-indigo-900/20">Utalás</button>
          </div>
        </form>
      </div>
    </div>
  );
}