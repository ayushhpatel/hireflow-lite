import { useState } from 'react';
import { Mail, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export type Stage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'HIRED' | 'REJECTED';

export interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  stage: Stage;
  resumeUrl?: string;
}

interface Props {
  application: Application;
  onUpdateStage: (id: string, newStage: Stage) => Promise<void>;
}

export function ApplicationCard({ application, onUpdateStage }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const getNextStage = (current: Stage): Stage | null => {
    switch (current) {
      case 'APPLIED': return 'SCREENING';
      case 'SCREENING': return 'INTERVIEW';
      case 'INTERVIEW': return 'HIRED';
      default: return null;
    }
  };

  const currentStage = application.stage;
  const nextStage = getNextStage(currentStage);

  const handleUpdate = async (stage: Stage) => {
    try {
      setIsLoading(true);
      await onUpdateStage(application.id, stage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md group flex flex-col gap-3">
      <div>
        <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          {application.candidateName}
        </h4>
        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 truncate">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{application.candidateEmail}</span>
        </div>
        
        {application.resumeUrl && (
          <a
            href={application.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Resume
          </a>
        )}
        <Link
          to={`/dashboard/candidates/${application.candidateId}`}
          className={`inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer ${application.resumeUrl ? 'ml-2' : ''}`}
        >
          View Profile
        </Link>
      </div>

      <div className="mt-1 flex items-center gap-2 pt-3 border-t border-slate-50">
        {nextStage && (
          <Button 
            className="flex-1 text-xs py-1.5 px-3 h-auto" 
            isLoading={isLoading} 
            onClick={() => handleUpdate(nextStage)}
          >
            Advance
          </Button>
        )}
        
        {currentStage !== 'REJECTED' && currentStage !== 'HIRED' && (
          <button 
            disabled={isLoading}
            onClick={() => handleUpdate('REJECTED')}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border border-transparent transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed text-slate-400' : 'text-slate-500 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
            } ${!nextStage ? 'flex-1 border-slate-200 bg-white shadow-sm' : ''}`}
          >
            Reject
          </button>
        )}
      </div>
    </div>
  );
}
