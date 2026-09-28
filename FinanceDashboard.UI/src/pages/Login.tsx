import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://localhost:7145/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Hibás e-mail cím vagy jelszó.');

      const data = await response.json();
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden text-slate-200">
      
      <div className="absolute top-[-300px] left-[-200px] w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.4)_0%,transparent_60%)] pointer-events-none z-0" />
      <div className="absolute bottom-[-300px] right-[-200px] w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(6,78,59,0.3)_0%,transparent_60%)] pointer-events-none z-0" />

      <form onSubmit={handleLogin} className="relative z-10 p-8 sm:p-10 bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md mx-4 transform-gpu">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
            Üdv újra itt!
          </h1>
          <p className="text-slate-400 text-sm">Kérjük, jelentkezz be a fiókodba</p>
        </div>

        {error && <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm text-center font-medium backdrop-blur-md">{error}</div>}
        
        <div className="mb-5">
          <label className="block text-slate-300 mb-2 text-sm font-medium">E-mail cím</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3.5 bg-slate-800/80 text-white rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
            placeholder="pelda@email.com"
            required
          />
        </div>
        
        <div className="mb-8">
          <label className="block text-slate-300 mb-2 text-sm font-medium">Jelszó</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3.5 bg-slate-800/80 text-white rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
            placeholder="••••••••"
            required
          />
        </div>
        
        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/30 border border-blue-400/20">
          Belépés
        </button>
        
        <div className="mt-6 text-center">
          <span className="text-slate-400 text-sm">Nincs még fiókod? </span>
          <button 
            type="button" 
            onClick={() => navigate('/register')}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition"
          >
            Regisztrálj most!
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;