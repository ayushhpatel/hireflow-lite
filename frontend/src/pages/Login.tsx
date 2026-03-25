import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { setToken } from '../lib/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">HireFlow</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome back</h1>
          <p className="text-slate-500 mb-8">Enter your credentials to access your account.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">{error}</div>}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-slate-900 hover:text-slate-700 hover:underline transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:block relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white">
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-white">The modern way to hire.</h2>
          <p className="text-lg text-slate-300 max-w-md">
            Manage candidates, track pipelines, and collaborate with your team in one unified platform.
          </p>
        </div>
      </div>
    </div>
  );
}
