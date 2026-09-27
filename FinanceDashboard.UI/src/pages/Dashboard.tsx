import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Account, Transaction } from '../types';
import CreateAccountModal from '../components/CreateAccountModal';
import AccountCard from '../components/AccountCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [chartCurrency, setChartCurrency] = useState('HUF'); 
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  
  const [wealthCurrency, setWealthCurrency] = useState('HUF'); 
  const [wealthRates, setWealthRates] = useState<Record<string, number>>({});

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const [accRes, txRes] = await Promise.all([
        fetch('https://localhost:7145/api/accounts', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://localhost:7145/api/Transactions', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (accRes.status === 401) {
        localStorage.removeItem('token');
        return navigate('/login');
      }
      
      if (!accRes.ok) throw new Error('Hiba a számlák letöltésekor.');
      
      setAccounts(await accRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${chartCurrency.toLowerCase()}.json`);
        if (res.ok) {
          const data = await res.json();
          setExchangeRates(data[chartCurrency.toLowerCase()]);
        }
      } catch (err) { console.error('Hiba:', err); }
    };
    fetchRates();
  }, [chartCurrency]);

  useEffect(() => {
    const fetchWealthRates = async () => {
      try {
        const res = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${wealthCurrency.toLowerCase()}.json`);
        if (res.ok) {
          const data = await res.json();
          setWealthRates(data[wealthCurrency.toLowerCase()]);
        }
      } catch (err) { console.error('Hiba:', err); }
    };
    fetchWealthRates();
  }, [wealthCurrency]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getFractionDigits = (currency: string) => {
    if (currency === 'HUF') return 0;
    if (currency === 'EUR' || currency === 'USD') return 2;
    return 8;
  };

  const formatCurrency = (value: number, currency: string) => {
    const curr = currency.toUpperCase();
    if (curr === 'HUF') return value.toLocaleString('hu-HU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (curr === 'EUR' || curr === 'USD') return value.toLocaleString('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value.toLocaleString('hu-HU', { maximumFractionDigits: 8 });
  };

  const accountCurrencies = accounts.reduce((acc, account) => {
    acc[account.id] = account.currency.toLowerCase();
    return acc;
  }, {} as Record<number, string>);

  const expensesByCategory = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, curr) => {
      const cat = curr.category || 'Egyéb';
      const txCurrency = accountCurrencies[curr.accountId] || 'huf'; 
      let convertedAmount = Math.abs(curr.amount);
      if (txCurrency !== chartCurrency.toLowerCase() && exchangeRates[txCurrency]) {
        convertedAmount = convertedAmount / exchangeRates[txCurrency];
      }
      acc[cat] = (acc[cat] || 0) + convertedAmount;
      return acc;
    }, {} as Record<string, number>);

  const expenseChartData = Object.keys(expensesByCategory)
    .map(key => ({ name: key, value: expensesByCategory[key] }))
    .sort((a, b) => b.value - a.value);

  const topCategory = expenseChartData.length > 0 ? expenseChartData[0].name : 'Nincs adat';

  let totalWealth = 0;
  const wealthChartData = accounts.map(acc => {
    const accCurr = acc.currency.toLowerCase();
    let convertedValue = acc.balance;
    if (accCurr !== wealthCurrency.toLowerCase() && wealthRates[accCurr]) {
      convertedValue = convertedValue / wealthRates[accCurr];
    }
    totalWealth += convertedValue;
    return { name: acc.name, value: Math.max(0, convertedValue) }; 
  }).filter(item => item.value > 0); 

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthSpending = transactions
    .filter(t => t.amount < 0)
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, t) => {
      const txCurrency = accountCurrencies[t.accountId] || 'huf';
      let converted = Math.abs(t.amount);
      if (txCurrency !== wealthCurrency.toLowerCase() && wealthRates[txCurrency]) {
        converted = converted / wealthRates[txCurrency];
      }
      return acc + converted;
    }, 0);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-slate-950 relative lg:overflow-hidden text-slate-200">
      <div className="absolute top-[-400px] left-[-400px] w-[1000px] h-[1000px] lg:w-[1600px] lg:h-[1600px] bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.35)_0%,transparent_60%)] pointer-events-none z-0" />
      <div className="absolute bottom-[-400px] right-[-400px] w-[1000px] h-[1000px] lg:w-[1600px] lg:h-[1600px] bg-[radial-gradient(circle_at_center,rgba(6,78,59,0.25)_0%,transparent_60%)] pointer-events-none z-0" />

      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden z-10">
        
        <div className="flex-1 lg:overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto pb-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Vezérlőpult</h1>
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none bg-blue-600/90 hover:bg-blue-500 text-white px-5 py-2 rounded-lg transition shadow-lg shadow-blue-900/20 font-semibold text-sm md:text-base border border-blue-400/20">
                  + Új számla
                </button>
                <button onClick={handleLogout} className="flex-1 sm:flex-none bg-slate-800/80 text-red-400 hover:bg-slate-700/80 px-5 py-2 rounded-lg transition text-sm md:text-base border border-red-500/20">
                  Kijelentkezés
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 mb-4">{error}</p>}

            {isLoading ? (
              <p className="text-slate-400">Adatok betöltése...</p>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4 text-slate-300">Számláid</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-10">
                  {accounts.length === 0 ? (
                    <p className="text-slate-500 col-span-full">Még nincs egyetlen számlád sem.</p>
                  ) : (
                    accounts.map((account) => (
                      <AccountCard key={account.id} account={account} formatCurrency={formatCurrency} onChange={fetchData} />
                    ))
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/50">
                      <p className="text-sm text-slate-400 mb-1">E havi kiadások ({wealthCurrency})</p>
                      <p className="text-xl font-bold text-red-400">
                        {thisMonthSpending.toLocaleString('hu-HU', { maximumFractionDigits: getFractionDigits(wealthCurrency) })}
                      </p>
                    </div>
                    <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/50">
                      <p className="text-sm text-slate-400 mb-1">Legnagyobb kiadás (Kategória)</p>
                      <p className="text-xl font-bold text-orange-400">{topCategory}</p>
                    </div>
                    <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/50">
                      <p className="text-sm text-slate-400 mb-1">Összes rögzített tranzakció</p>
                      <p className="text-xl font-bold text-blue-400">{transactions.length} db</p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 bg-slate-800/70 p-5 rounded-2xl border border-slate-700/50">
                    <h2 className="text-lg font-semibold text-slate-300 mb-4">Legutóbbi tranzakciók</h2>
                    {recentTransactions.length === 0 ? (
                      <p className="text-slate-500">Még nincs rögzített tranzakciód.</p>
                    ) : (
                      <div className="space-y-3">
                        {recentTransactions.map(t => {
                          const acc = accounts.find(a => a.id === t.accountId);
                          return (
                            <div key={t.id} className="flex justify-between items-center p-3 sm:p-4 bg-slate-900/60 rounded-xl border border-slate-700/30">
                              <div>
                                <p className="font-semibold text-slate-200">
                                  {t.category} <span className="text-xs sm:text-sm font-normal text-slate-500 ml-2">({acc?.name})</span>
                                </p>
                                <p className="text-xs text-slate-400 mt-1">{new Date(t.date).toLocaleDateString('hu-HU')}</p>
                              </div>
                              <div className={`font-bold ${t.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {t.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(t.amount), acc?.currency || 'HUF')} <span className="text-sm font-normal">{acc?.currency}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-hidden w-full lg:w-80 xl:w-96 shrink-0 bg-slate-900/60 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-slate-700/50 p-4 sm:p-6 flex flex-col lg:overflow-y-auto z-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-slate-200">Vagyoneloszlás</h2>
            <select value={wealthCurrency} onChange={(e) => setWealthCurrency(e.target.value)} className="bg-slate-800/80 text-blue-400 font-semibold rounded-lg border border-slate-600 focus:border-blue-500 outline-none p-1.5 text-sm">
              <option value="HUF">HUF</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="BTC">BTC</option>
            </select>
          </div>

          {!isLoading && accounts.length > 0 && (
            <div className="h-[250px] sm:h-[300px] lg:h-auto lg:flex-1 lg:min-h-[250px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={wealthChartData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {wealthChartData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${Number(value).toLocaleString('hu-HU', { maximumFractionDigits: getFractionDigits(wealthCurrency) })} ${wealthCurrency}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }} itemStyle={{ color: '#e2e8f0' }} />
                  <Legend verticalAlign="bottom" height={40} wrapperStyle={{ color: '#94a3b8', fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-auto bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 rounded-2xl border border-slate-700/50 text-center shadow-lg">
            <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider font-semibold">Teljes vagyon</p>
            <p className="text-2xl font-bold text-emerald-400 break-words drop-shadow-md">
              {totalWealth.toLocaleString('hu-HU', { maximumFractionDigits: getFractionDigits(wealthCurrency) })} <span className="text-base text-slate-400 font-normal">{wealthCurrency}</span>
            </p>
          </div>
        </div>
      </div>

      {!isLoading && expenseChartData.length > 0 && (
        <div className="h-[400px] lg:h-[35vh] min-h-[280px] shrink-0 bg-slate-900/60 backdrop-blur-xl border-t border-slate-700/50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 p-4 sm:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-2 px-2 sm:px-8 w-full max-w-4xl mx-auto">
            <h2 className="text-base sm:text-lg font-bold text-slate-200">Kiadások kategóriánként</h2>
            <select value={chartCurrency} onChange={(e) => setChartCurrency(e.target.value)} className="bg-slate-800/80 text-blue-400 font-semibold rounded-lg border border-slate-600 focus:border-blue-500 outline-none p-1.5 text-sm">
              <option value="HUF">Összesítés: HUF</option><option value="EUR">Összesítés: EUR</option><option value="USD">Összesítés: USD</option><option value="BTC">Összesítés: BTC</option>
            </select>
          </div>
          <div className="flex-1 w-full max-w-4xl mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {expenseChartData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: any) => `${Number(value).toLocaleString('hu-HU', { maximumFractionDigits: getFractionDigits(chartCurrency) })} ${chartCurrency}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }} itemStyle={{ color: '#e2e8f0' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <CreateAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />
    </div>
  );
};

export default Dashboard;