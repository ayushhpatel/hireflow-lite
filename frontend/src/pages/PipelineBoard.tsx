import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { StageColumn } from '../components/applications/StageColumn';
import type { Application, Stage } from '../components/applications/ApplicationCard';

interface Job {
  id: string;
  title: string;
  department: string | null;
  status: string;
}

const STAGES: { value: Stage, label: string }[] = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' }
];

export function PipelineBoard() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="h-[90vh] flex flex-col">
      <header className="mb-6 flex items-center justify-between shrink-0">
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

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden rounded-xl border border-slate-200/50 bg-white/50 pb-2 custom-scrollbar shadow-sm">
        <div className="flex gap-4 p-4 h-full min-w-max">
          {STAGES.map((s) => (
            <StageColumn
              key={s.value}
              title={s.label}
              stage={s.value}
              applications={applications.filter(app => app.stage === s.value)}
              onUpdateStage={handleUpdateStage}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
