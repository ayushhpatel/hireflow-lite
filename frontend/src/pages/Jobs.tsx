import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Briefcase, Building2, Calendar } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department: string | null;
  status: string;
  createdAt: string;
}

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [createError, setCreateError] = useState('');

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/jobs');
      setJobs(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!newTitle.trim()) {
      setCreateError('Job title is required');
      return;
    }

    try {
      setIsCreating(true);
      await api.post('/jobs', {
        title: newTitle,
        department: newDepartment || null,
        status: 'OPEN'
      });
      // Reset form
      setNewTitle('');
      setNewDepartment('');
      // Refresh list
      await fetchJobs();
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in ease-out duration-300">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Jobs Management</h1>
        <p className="text-slate-500 mt-2">Create and manage your organization's open roles.</p>
      </header>

      {/* Create Job Form */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Post a new Job</h2>
        <form onSubmit={handleCreateJob} className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1 w-full relative">
            <Input 
              placeholder="e.g. Senior Frontend Engineer" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex-1 w-full">
            <Input 
              placeholder="Department (Optional)" 
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
            />
          </div>
          <Button type="submit" isLoading={isCreating} className="whitespace-nowrap px-8">
            Create Job
          </Button>
        </form>
        {createError && <p className="mt-3 text-sm text-red-500 font-medium">{createError}</p>}
      </section>

      {/* Jobs List */}
      <section className="pt-2">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 border-dashed rounded-xl">
            <Briefcase className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-900">No jobs posted</h3>
            <p className="text-sm text-slate-500 mt-1">Get started by creating a new job posting above.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow group flex flex-col">
                <div className="flex justify-between items-start mb-5">
                  <h3 className="font-semibold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors pr-3">
                    {job.title}
                  </h3>
                  <span className={`inline-flex shrink-0 items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    job.status === 'OPEN' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {job.status}
                  </span>
                </div>
                
                <div className="space-y-2.5 mt-auto">
                  <div className="flex items-center text-sm text-slate-500">
                    <Building2 className="w-4 h-4 mr-2.5 text-slate-400" />
                    {job.department || 'No department'}
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <Calendar className="w-4 h-4 mr-2.5 text-slate-400" />
                    Created {formatDate(job.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
