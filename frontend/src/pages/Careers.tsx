import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { api } from '../lib/api';

interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
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

          <div className="p-6 sm:p-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <div key={job.id} className="group relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 uppercase tracking-wider">
                          {job.department || 'General'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{job.title}</h3>
                      {job.description && (
                        <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-6">
                          {job.description.replace(/[#*`_]/g, '') /* strip basic markdown for preview */}
                        </p>
                      )}
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        to={`/careers/${job.id}`}
                        className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700"
                      >
                        View Role &rarr;
                      </Link>
                      <Link
                        to={`/careers/${job.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all shadow-sm group-hover:shadow"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
