import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Users, Mail, Calendar } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-slate-100">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      {candidate.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{candidate.name}</h3>
                      <div className="flex items-center text-sm text-slate-500 mt-0.5">
                        <Mail className="w-3.5 h-3.5 mr-1.5" />
                        {candidate.email}
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center text-sm text-slate-500">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    Added {formatDate(candidate.createdAt)}
                  </div>
                </div>
              ))}
            </div>
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
