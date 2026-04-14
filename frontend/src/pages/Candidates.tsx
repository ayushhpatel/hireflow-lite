import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Users } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  appliedRoles: string[];
  createdAt: string;
}

export function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/candidates', {
        params: { page, size: 10, search: search || undefined }
      });
      setCandidates(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [page, search]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in ease-out duration-300">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Candidates</h1>
          <p className="text-slate-500 mt-2">View and search through your organization's talent pool.</p>
        </div>
        <div className="w-full sm:w-80">
          <Input 
            placeholder="Search name or email..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </header>

      <section>
        {isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">{error}</div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 border-dashed rounded-xl">
            <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-900">No candidates found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Roles Applied For</th>
                  <th className="py-3 px-6">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <Link to={`/dashboard/candidates/${candidate.id}`} className="group flex items-center">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-xs mr-3 ring-1 ring-slate-200">
                          {candidate.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                          {candidate.name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">{candidate.email}</td>
                    <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
                      {candidate.appliedRoles && candidate.appliedRoles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {candidate.appliedRoles.map((r, i) => (
                             <span key={i} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-xs font-medium">{r}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">{formatDate(candidate.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6 pt-2">
            <Button 
              className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="text-sm font-medium text-slate-600">
              Page {page + 1} of {totalPages}
            </span>
            <Button 
              className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
