import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { setToken } from '../lib/auth';

export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organizationName: '',
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/register', formData);
      setToken(response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">HireFlow</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Create an account</h1>
          <p className="text-slate-500 mb-8">Start managing your hiring pipeline today.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Organization Name"
              name="organizationName"
              placeholder="Acme Corp"
              value={formData.organizationName}
              onChange={handleChange}
              required
            />
            <Input
              label="Full Name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
            
            {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">{error}</div>}

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Sign up
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-900 hover:text-slate-700 hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:block relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-slate-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white">
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-white">Streamline your hiring.</h2>
          <p className="text-lg text-slate-300 max-w-md">
            Build your organization, invite your team, and discover top talent effortlessly.
          </p>
        </div>
      </div>
    </div>
  );
}
