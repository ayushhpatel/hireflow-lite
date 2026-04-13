import { useState } from 'react';
import { Mail, User } from 'lucide-react';
import { Button } from '../ui/Button';

export type Stage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'HIRED' | 'REJECTED';

export interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  stage: Stage;
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
