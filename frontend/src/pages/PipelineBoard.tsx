import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, X, Calendar, FileText, Mail } from 'lucide-react';
import { api } from '../lib/api';
import { ApplicationCard } from '../components/applications/ApplicationCard';
import type { Application, Stage } from '../components/applications/ApplicationCard';

interface Job {
  id: string;
  title: string;
  department: string | null;
  status: string;
}

const STAGES: { value: Stage | 'ALL', label: string }[] = [
  { value: 'ALL', label: 'All Candidates' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' }
];

export function PipelineBoard() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedStage, setSelectedStage] = useState<Stage | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const fetchData = async () => {
    try {
      if (!jobId) return;
      setIsLoading(true);
      setError('');
      
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/applications/job/${jobId}`)
      ]);
      
      setJob(jobRes.data);
      setApplications(appsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pipeline data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const handleUpdateStage = async (id: string, newStage: Stage) => {
    try {
      await api.patch(`/applications/${id}/stage`, { stage: newStage });
      // Optimistically update UI or fully refresh
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update stage');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading Pipeline...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-100 flex items-center shadow-sm">
          {error || 'Job not found'}
        </div>
        <Link to="/dashboard/jobs" className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
      </div>
    );
  }

  // Filter Applications
  const filteredApps = applications.filter(app => {
    const matchesStage = selectedStage === 'ALL' || app.stage === selectedStage;
    const matchesEmail = app.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesEmail;
  });

  return (
    <div className="flex flex-col animate-in fade-in ease-out duration-300">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between shrink-0 gap-4">
        <div>
          <Link to="/dashboard/jobs" className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{job.title}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
              Pipeline
            </span>
          </div>
          <p className="text-slate-500 font-medium mt-1 pl-1">
            {job.department ? `${job.department} Department` : 'No Department'}
          </p>
        </div>
      </header>

      {/* Control Bar (Filters & Search) */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 items-start md:items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto w-full md:w-auto">
          {STAGES.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedStage(s.value)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
                selectedStage === s.value
                  ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {s.label}
              <span className="ml-2 text-xs opacity-60">
                {s.value === 'ALL' 
                   ? applications.length 
                   : applications.filter(a => a.stage === s.value).length}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-slate-400"
            placeholder="Search candidate email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid View */}
      {filteredApps.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 border-dashed">
           <FileText className="w-12 h-12 text-slate-300 mb-3" />
           <h3 className="text-base font-semibold text-slate-800">No candidates found</h3>
           <p className="text-sm text-slate-500 mt-1">
             {selectedStage === 'ALL' && searchQuery === '' 
               ? "No one has applied to this job yet." 
               : "No candidates match the current filters."}
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
          {filteredApps.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onUpdateStage={handleUpdateStage}
              onClick={setSelectedApplication}
            />
          ))}
        </div>
      )}

      {/* Drawer / Modal UI Overlay */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Candidate Details</h2>
              <button 
                onClick={() => setSelectedApplication(null)}
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="mb-8">
                <h3 className="text-2xl font-extrabold text-slate-900">{selectedApplication.candidateName}</h3>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="w-4 h-4 mr-3 text-slate-400" />
                    <a href={`mailto:${selectedApplication.candidateEmail}`} className="text-blue-600 hover:underline">
                      {selectedApplication.candidateEmail}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                    <span>Applied on {new Date(selectedApplication.appliedAt).toLocaleDateString()}</span>
                  </div>
                  {selectedApplication.resumeUrl && (
                    <div className="flex items-center text-sm text-slate-600">
                      <FileText className="w-4 h-4 mr-3 text-slate-400" />
                      <a 
                        href={selectedApplication.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium text-blue-600 hover:underline decoration-blue-300 underline-offset-2"
                      >
                        View External Resume
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Answers Section */}
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Application Answers</h4>
                {!selectedApplication.answers || selectedApplication.answers.length === 0 ? (
                  <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg">No custom questions answered.</p>
                ) : (
                  <div className="space-y-5">
                    {selectedApplication.answers.map((ans) => (
                      <div key={ans.questionId} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-2">{ans.questionText}</p>
                        <p className="text-sm text-slate-900 font-medium whitespace-pre-wrap">{ans.answerText}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
