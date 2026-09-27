import { useState } from 'react';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAccountModal({ isOpen, onClose, onSuccess }: CreateAccountModalProps) {
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountCurrency, setNewAccountCurrency] = useState('HUF');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/[^\d.,-]/g, '').replace(',', '.');
    const dotIndex = rawValue.indexOf('.');
    if (dotIndex !== -1) {
      rawValue = rawValue.slice(0, dotIndex + 1) + rawValue.slice(dotIndex + 1).replace(/\./g, '');
    }
    if (!rawValue || rawValue === '-') {
      setNewAccountBalance(rawValue);
      return;
    }
    const isNegative = rawValue.startsWith('-');
    const cleanValue = rawValue.replace(/-/g, '');
    const parts = cleanValue.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
    setNewAccountBalance((isNegative ? '-' : '') + integerPart + decimalPart);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('https://localhost:7145/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newAccountName,
          currency: newAccountCurrency,
          balance: Number(String(newAccountBalance).replace(/\s/g, '')) 
        })
      });
      if (!response.ok) throw new Error(`Hiba a mentéskor: ${await response.text()}`);
      
      setNewAccountName('');
      setNewAccountCurrency('HUF');
      setNewAccountBalance('');
      onSuccess(); // Frissíti a Dashboardot
      onClose();   // Bezárja a modalt
    } catch (err: any) { 
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm z-50">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Új számla hozzáadása</h2>
        {error && <div className="text-red-400 mb-4 text-sm">{error}</div>}
        <form onSubmit={handleCreateAccount}>
          <div className="mb-4">
            <label className="block text-slate-300 mb-2 text-sm font-medium">Számla neve</label>
            <input type="text" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} className="w-full p-3 bg-slate-800 text-white rounded-xl border border-slate-600 focus:border-blue-500 outline-none" required />
          </div>
          <div className="mb-4">
            <label className="block text-slate-300 mb-2 text-sm font-medium">Pénznem</label>
            <select value={newAccountCurrency} onChange={(e) => setNewAccountCurrency(e.target.value)} className="w-full p-3 bg-slate-800 text-white rounded-xl border border-slate-600 focus:border-blue-500 outline-none">
              <optgroup label="Hagyományos valuták" className="bg-slate-800">
                <option value="HUF">HUF - Forint</option>
                <option value="EUR">EUR - Euró</option>
                <option value="USD">USD - Dollár</option>
              </optgroup>
              <optgroup label="Kriptovaluták" className="bg-slate-800">
                <option value="BTC">BTC - Bitcoin</option>
                <option value="ETH">ETH - Ethereum</option>
              </optgroup>
            </select>
          </div>
          <div className="mb-8">
            <label className="block text-slate-300 mb-2 text-sm font-medium">Kezdő egyenleg</label>
            <input type="text" inputMode="decimal" value={newAccountBalance} onChange={handleBalanceChange} className="w-full p-3 bg-slate-800 text-white rounded-xl border border-slate-600 focus:border-blue-500 outline-none" required />
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-700 text-white py-3 rounded-xl hover:bg-slate-600 transition font-medium">Mégse</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-500 transition font-bold shadow-lg shadow-blue-900/20">Mentés</button>
          </div>
        </form>
      </div>
    </div>
  );
}