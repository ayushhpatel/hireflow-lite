import { useState } from 'react';
import { Mail, User, Flag } from 'lucide-react';

export type Stage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'HIRED' | 'REJECTED';

export interface ApplicationAnswer {
  questionId: string;
  questionText: string;
  answerText: string;
  isContradictory?: boolean;
  preferredAnswer?: string;
}

export interface ApplicationRecommendation {
  jobTitle: string;
  matchScore: number;
  reasoning: string;
}

export interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  stage: Stage;
  resumeUrl?: string;
  answers: ApplicationAnswer[];
  appliedAt: string;
  matchScore: number | null;
  strengths: string | null;
  gaps: string | null;
  skills: string | null;
  isTopCandidate?: boolean;
  hasContradictions?: boolean;
  crossJobRecommendations?: ApplicationRecommendation[];
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
      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-slate-300 group flex flex-col gap-3 cursor-pointer"
    >
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

      <div className="mt-1 flex justify-end gap-2 items-center">
        {application.hasContradictions && (
           <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold tracking-wide bg-red-100 text-red-700 border border-red-200" title="Contradictory Answer to Dealbreaker Question!">
             <Flag className="w-3 h-3 mr-1 fill-current" /> Flagged
           </span>
        )}
        {application.matchScore !== null && application.matchScore !== undefined && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${
             application.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
             application.matchScore >= 60 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
             'bg-rose-100 text-rose-700 border border-rose-200'
          }`}>
            🎯 {application.matchScore}% Match
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
