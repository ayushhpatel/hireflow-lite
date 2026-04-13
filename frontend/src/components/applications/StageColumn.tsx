import type { Application, Stage } from './ApplicationCard';
import { ApplicationCard } from './ApplicationCard';
import { Layers } from 'lucide-react';

interface Props {
  title: string;
  stage: Stage;
  applications: Application[];
  onUpdateStage: (id: string, newStage: Stage) => Promise<void>;
}

export function StageColumn({ title, stage, applications, onUpdateStage }: Props) {
  const getStageColor = (s: Stage) => {
    switch (s) {
      case 'APPLIED': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'SCREENING': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'INTERVIEW': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'HIRED': return 'bg-green-50 text-green-700 border-green-200';
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-[300px] h-full bg-slate-50 rounded-2xl p-4 shrink-0 shadow-inner overflow-hidden border border-slate-200/60">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-[13px] uppercase tracking-wider text-slate-700 flex items-center gap-2">
          {title}
        </h3>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStageColor(stage)} shadow-sm`}>
          {applications.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-8 custom-scrollbar">
        {applications.length === 0 ? (
          <div className="h-28 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 opacity-60">
            <Layers className="w-5 h-5 mb-1 opacity-50" />
            <span className="text-xs font-medium">Empty</span>
          </div>
        ) : (
          applications.map(app => (
            <ApplicationCard
              key={app.id}
              application={app}
              onUpdateStage={onUpdateStage}
            />
          ))
        )}
      </div>
    </div>
  );
}
