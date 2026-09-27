import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Account, Transaction } from '../types';
import AddTransactionModal from '../components/AddTransactionModal';
import TransferModal from '../components/TransferModal';

const AccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [account, setAccount] = useState<Account | null>(null);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Adatok lekérése funkció kiszervezve, hogy a modalok is meg tudják hívni mentés után
  const fetchDetails = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const [accRes, allAccRes, txRes] = await Promise.all([
        fetch(`https://localhost:7145/api/accounts/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`https://localhost:7145/api/accounts`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`https://localhost:7145/api/Transactions/account/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!accRes.ok) throw new Error('Nem sikerült betölteni a számlát.');
      
      setAccount(await accRes.json());
      if (allAccRes.ok) setAllAccounts(await allAccRes.json());
      
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const formatCurrency = (value: number, currency: string) => {
    const curr = currency.toUpperCase();
    if (curr === 'HUF') return value.toLocaleString('hu-HU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (curr === 'EUR' || curr === 'USD') return value.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value.toLocaleString('hu-HU', { maximumFractionDigits: 8 });
  };

  const handleDeleteTransaction = async (txId: number) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a tranzakciót?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://localhost:7145/api/Transactions/${txId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Nem sikerült törölni a tranzakciót.');
      fetchDetails(); // Újratöltjük az adatokat, hogy az egyenleg frissüljön
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">Betöltés...</div>;
  if (error || !account) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400">{error || 'Számla nem található'}</div>;

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden text-slate-200">
      <div className="absolute top-[-400px] left-[-400px] w-[1000px] h-[1000px] lg:w-[1600px] lg:h-[1600px] bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.25)_0%,transparent_60%)] pointer-events-none z-0" />
      <div className="absolute bottom-[-400px] right-[-400px] w-[1000px] h-[1000px] lg:w-[1600px] lg:h-[1600px] bg-[radial-gradient(circle_at_center,rgba(6,78,59,0.15)_0%,transparent_60%)] pointer-events-none z-0" />

      <div className="relative z-10 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 h-screen flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <button onClick={() => navigate('/')} className="mb-4 text-slate-400 hover:text-white transition flex items-center gap-2 text-sm font-semibold">← Vissza a Vezérlőpultra</button>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-1">{account.name}</h1>
            <p className="text-4xl font-bold text-white drop-shadow-md mt-2">
              {formatCurrency(account.balance, account.currency)} <span className="text-xl text-slate-400 font-normal">{account.currency}</span>
            </p>
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <button onClick={() => setIsTransferModalOpen(true)} className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-3 rounded-xl transition border border-slate-600 hover:border-slate-500 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> Utalás
            </button>
            <button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-900/20 font-bold border border-emerald-400/20 whitespace-nowrap">
              + Új Tranzakció
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-4 sm:p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-300 mb-6">Tranzakciók története</h2>
            {transactions.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Nincsenek még tranzakciók ezen a számlán.</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-800/60 hover:bg-slate-800/80 rounded-xl border border-slate-700/30 transition-colors">
                    <div className="flex-1 mb-2 sm:mb-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-slate-200 text-lg">{tx.category}</span>
                        <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-md border border-slate-600/30">{new Date(tx.date).toLocaleDateString('hu-HU')}</span>
                      </div>
                      {tx.description && <p className="text-sm text-slate-400">{tx.description}</p>}
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className={`font-bold text-lg ${tx.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {tx.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount), account.currency)} <span className="text-sm font-normal">{account.currency}</span>
                      </div>
                      <button onClick={() => handleDeleteTransaction(tx.id)} className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-2 bg-red-900/30 hover:bg-red-800/60 text-red-400 rounded-lg transition-opacity border border-red-800/50" title="Törlés">✖</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        accountId={Number(id)} 
        currency={account.currency}
        onSuccess={fetchDetails} 
      />
      <TransferModal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)} 
        sourceAccount={account} 
        allAccounts={allAccounts} 
        onSuccess={fetchDetails} 
      />
    </div>
  );
};

export default AccountDetails;