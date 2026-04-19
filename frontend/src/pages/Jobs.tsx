import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Briefcase, Plus, Trash2 } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department: string | null;
  status: string;
  createdAt: string;
}

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [questions, setQuestions] = useState<{questionText: string, type: 'TEXT' | 'YES_NO', isDealbreaker: boolean, preferredAnswer: 'YES' | 'NO'}[]>([]);
  const [createError, setCreateError] = useState('');

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/jobs', {
        params: { page, size: 9, search: search || undefined }
      });
      setJobs(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, search]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!newTitle.trim()) {
      setCreateError('Job title is required');
      return;
    }

    try {
      setIsCreating(true);
      const createdJobRes = await api.post('/jobs', {
        title: newTitle,
        department: newDepartment || null,
        description: newDescription || null,
        status: 'OPEN'
      });
      
      const jobId = createdJobRes.data.id;
      
      if (questions.length > 0) {
        // Post all questions dynamically
        await Promise.all(
          questions
            .filter(q => q.questionText.trim().length > 0)
            .map(q => api.post(`/jobs/${jobId}/questions`, q))
        );
      }

      // Reset form
      setNewTitle('');
      setNewDepartment('');
      setNewDescription('');
      setQuestions([]);
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
        <form onSubmit={handleCreateJob} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
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
          </div>
          <div className="w-full">
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Enter job description..."
              className="w-full min-h-[100px] p-3 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-y"
            />
          </div>
          
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-slate-800">Custom Questions (Optional)</h3>
            {questions.map((q, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Input 
                      value={q.questionText}
                      onChange={(e) => {
                        const newQ = [...questions];
                        newQ[idx].questionText = e.target.value;
                        setQuestions(newQ);
                      }}
                      placeholder="e.g. Do you require visa sponsorship?"
                    />
                    <select 
                      value={q.type}
                      onChange={(e) => {
                        const newQ = [...questions];
                        newQ[idx].type = e.target.value as 'TEXT' | 'YES_NO';
                        setQuestions(newQ);
                      }}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                    >
                      <option value="TEXT">Text Answer</option>
                      <option value="YES_NO">Yes / No</option>
                    </select>
                    <button 
                      type="button"
                      onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {q.type === 'YES_NO' && (
                    <div className="flex items-center gap-4 bg-white p-2 rounded border border-slate-200 text-sm pl-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.isDealbreaker}
                          onChange={(e) => {
                            const newQ = [...questions];
                            newQ[idx].isDealbreaker = e.target.checked;
                            setQuestions(newQ);
                          }}
                          className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                        />
                        <span className="font-semibold text-slate-700">Mark as Dealbreaker</span>
                      </label>
                      
                      {q.isDealbreaker && (
                        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                          <span className="text-slate-500 font-medium">Preferred Answer:</span>
                          <select
                            value={q.preferredAnswer}
                            onChange={(e) => {
                              const newQ = [...questions];
                              newQ[idx].preferredAnswer = e.target.value as 'YES' | 'NO';
                              setQuestions(newQ);
                            }}
                            className="px-2 py-1 text-xs border border-slate-200 rounded font-semibold focus:outline-none"
                          >
                            <option value="YES">Yes</option>
                            <option value="NO">No</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button 
               type="button" 
               onClick={() => setQuestions([...questions, {questionText: '', type: 'TEXT', isDealbreaker: false, preferredAnswer: 'YES'}])}
               className="inline-flex items-center justify-center font-medium transition-colors bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 rounded-lg px-4 py-2 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Question
            </button>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" isLoading={isCreating} className="whitespace-nowrap px-8">
              Create Job
            </Button>
          </div>
        </form>
        {createError && <p className="mt-3 text-sm text-red-500 font-medium">{createError}</p>}
      </section>

      {/* Jobs List Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
        <h2 className="text-xl font-bold text-slate-800">Active Postings</h2>
        <div className="w-full sm:w-72">
          <Input 
            placeholder="Search by title..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>

      {/* Jobs List */}
      <section>
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="py-3 px-6">Title</th>
                  <th className="py-3 px-6">Dept</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Created</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">{job.title}</td>
                    <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">{job.department || '—'}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        job.status === 'OPEN' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">{formatDate(job.createdAt)}</td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <Link 
                        to={`/dashboard/jobs/${job.id}/board`}
                        className="text-sm font-semibold px-3 py-1.5 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors inline-block"
                      >
                        View Pipeline
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-200">
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
