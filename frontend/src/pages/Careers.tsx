import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { api } from '../lib/api';

interface Job {
  id: string;
  title: string;
  department: string;
  createdAt: string;
}

export function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        // Note: we fetch from our new public unauthenticated endpoint
        const response = await api.get('/public/jobs');
        setJobs(response.data);
      } catch (err) {
        setError('Failed to load open positions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in ease-out duration-300">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Careers at HireFlow</h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Join our team and help build the future. We're always looking for talented people to join us.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Job List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Open Positions</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {jobs.length} Roles
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                <Briefcase className="w-12 h-12 text-slate-300 mb-4" />
                <p>No open positions right now. Check back later!</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{job.department || 'General'}</p>
                  </div>
                  <Link
                    to={`/careers/${job.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors shrink-0"
                  >
                    View Role & Apply
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
