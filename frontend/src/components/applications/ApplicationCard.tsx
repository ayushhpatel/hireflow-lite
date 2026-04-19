import { useState } from 'react';
import { Mail, User } from 'lucide-react';

export type Stage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'HIRED' | 'REJECTED';

export interface ApplicationAnswer {
  questionId: string;
  questionText: string;
  answerText: string;
}

export interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  stage: Stage;
  resumeUrl?: string;
  matchScore?: number;
  isTopCandidate?: boolean;
  answers: ApplicationAnswer[];
  appliedAt: string;
  strengths: string | null;
  gaps: string | null;
}

interface Props {
  application: Application;
  onUpdateStage: (id: string, newStage: Stage) => Promise<void>;
  onClick: (application: Application) => void;
}

export function ApplicationCard({ application, onUpdateStage, onClick }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const currentStage = application.stage;

  const handleUpdate = async (stage: Stage) => {
    try {
      setIsLoading(true);
      await onUpdateStage(application.id, stage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      onClick={() => onClick(application)}
      className={`bg-white p-4 rounded-xl shadow-sm border transition-all hover:shadow-md group flex flex-col gap-3 cursor-pointer ${application.isTopCandidate ? 'border-amber-200 ring-1 ring-amber-100 shadow-amber-100/50' : 'border-slate-200'}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            {application.candidateName}
          </h4>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{application.candidateEmail}</span>
          </div>
        </div>
        
        {application.matchScore !== undefined && application.matchScore !== null && (
          <div className={`flex flex-col items-end shrink-0 ml-2 ${application.isTopCandidate ? 'text-amber-600' : 'text-emerald-600'}`}>
            <span className={`text-2xl font-extrabold ${application.matchScore >= 80 ? 'text-emerald-600' : application.matchScore >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
              {application.matchScore}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200">
           {application.stage}
        </span>
        {application.isTopCandidate && (
           <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
             ⭐ Top Ranked
           </span>
        )}
      </div>

      <div className="pt-3 border-t border-slate-50 relative" onClick={(e) => e.stopPropagation()}>
        <label className="sr-only">Change Stage</label>
        <select
          value={currentStage}
          onChange={(e) => handleUpdate(e.target.value as Stage)}
          disabled={isLoading}
          className="block w-full text-xs py-1.5 pl-3 pr-8 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 appearance-none font-medium text-slate-700"
        >
          <option value="APPLIED">Applied</option>
          <option value="SCREENING">Screening</option>
          <option value="INTERVIEW">Interview</option>
          <option value="HIRED">Hired</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-3 text-slate-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );
}
