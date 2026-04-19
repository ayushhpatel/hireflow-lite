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
  const [sortMode, setSortMode] = useState<'matchScore' | 'newest'>('matchScore');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const fetchData = async () => {
    try {
      if (!jobId) return;
      setIsLoading(true);
      setError('');
      
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/applications/job/${jobId}/ranked-applications`)
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
  let filteredApps = applications.filter(app => {
    const matchesStage = selectedStage === 'ALL' || app.stage === selectedStage;
    const matchesEmail = app.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesEmail;
  });

  // Sort Applications
  if (sortMode === 'newest') {
    filteredApps = [...filteredApps].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  } else if (sortMode === 'matchScore') {
    filteredApps = [...filteredApps].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  const topCandidates = filteredApps.filter(app => app.isTopCandidate);
  const otherCandidates = filteredApps.filter(app => !app.isTopCandidate);

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

        <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto shrink-0 border border-slate-200 ml-auto">
           <button
             onClick={() => setSortMode('matchScore')}
             className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
               sortMode === 'matchScore' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
             }`}
           >
             AI Match Score
           </button>
           <button
             onClick={() => setSortMode('newest')}
             className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
               sortMode === 'newest' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
             }`}
           >
             Newest
           </button>
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
        <div className="pb-12 space-y-8">
          
          {/* Top Candidates Section */}
          {(topCandidates.length > 0 && sortMode === 'matchScore') && (
            <section className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-amber-800 uppercase tracking-wider mb-4 flex items-center">
                <span className="mr-2 text-amber-500 text-lg">⭐</span> Top Candidates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {topCandidates.map((app, index) => (
                  <div key={app.id} className="relative">
                    <div className="absolute -top-3 -left-3 z-10 bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                      #{index + 1}
                    </div>
                    <ApplicationCard
                      application={app}
                      onUpdateStage={handleUpdateStage}
                      onClick={setSelectedApplication}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Other Candidates Section */}
          <section>
            {(topCandidates.length > 0 && sortMode === 'matchScore') && (
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">Other Applications</h3>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherCandidates.map((app, index) => {
                 // For newest sorting or non-top, just generic rendering. If sorted by newest, topCandidates is theoretically empty if we turn off top candidates section.
                 // Actually, if sortMode === 'newest', we should probably just render ALL apps in one huge list. Let's do that cleanly.
                 return null; // Handled below
              })}
              
              {sortMode === 'matchScore' ? (
                otherCandidates.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onUpdateStage={handleUpdateStage}
                    onClick={setSelectedApplication}
                  />
                ))
              ) : (
                filteredApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onUpdateStage={handleUpdateStage}
                    onClick={setSelectedApplication}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* Drawer / Modal UI Overlay */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-5xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedApplication.candidateName}</h2>
                <div className="flex items-center text-sm text-slate-500 mt-1 space-x-4 shrink-0">
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-1.5 text-slate-400" />
                    {selectedApplication.candidateEmail}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                    Applied {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedApplication(null)}
                className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50">
              
              {/* Left Column: AI Match + Answers */}
              <div className="w-full md:w-[400px] flex-shrink-0 border-r border-slate-200 overflow-y-auto bg-white p-6 custom-scrollbar">
                
                {/* AI Insights Module */}
                {(selectedApplication.matchScore !== null && selectedApplication.matchScore !== undefined) && (
                  <div className="mb-8 bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
                        <span className="mr-2">✨</span> AI Match Insights
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold tracking-wide ${
                         selectedApplication.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                         selectedApplication.matchScore >= 60 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                         'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        Score: {selectedApplication.matchScore}%
                      </span>
                    </div>

                    {selectedApplication.strengths && (() => {
                      try {
                        const strengths = JSON.parse(selectedApplication.strengths);
                        if (strengths.length > 0) return (
                          <div className="mb-4">
                            <h5 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Strengths</h5>
                            <ul className="space-y-1.5">
                              {strengths.map((s: string, i: number) => (
                                <li key={`strength-${i}`} className="text-sm text-slate-600 flex items-start">
                                  <span className="mr-2 text-emerald-500 font-bold shrink-0">✓</span> <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      } catch (e) { return null; }
                    })()}

                    {selectedApplication.gaps && (() => {
                      try {
                        const gaps = JSON.parse(selectedApplication.gaps);
                        if (gaps.length > 0) return (
                          <div>
                            <h5 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Identified Gaps</h5>
                            <ul className="space-y-1.5">
                              {gaps.map((g: string, i: number) => (
                                <li key={`gap-${i}`} className="text-sm text-slate-600 flex items-start">
                                  <span className="mr-2 text-rose-500 font-bold shrink-0">✗</span> <span>{g}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      } catch (e) { return null; }
                    })()}
                  </div>
                )}

                <div className="mb-6 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Application Answers</h4>
                </div>
                {!selectedApplication.answers || selectedApplication.answers.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                    <p className="text-sm text-slate-500">No custom questions answered.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedApplication.answers.map((ans) => (
                      <div key={ans.questionId}>
                        <p className="text-xs font-semibold text-slate-500 mb-1.5">{ans.questionText}</p>
                        <p className="text-sm text-slate-900 font-medium whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">{ans.answerText}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Resume Preview */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 relative">
                {selectedApplication.resumeUrl ? (
                  <div className="w-full h-full flex flex-col">
                    <div className="bg-white border-b border-slate-200 py-2.5 px-4 flex justify-end shadow-sm z-10">
                       <a 
                         href={selectedApplication.resumeUrl} 
                         download
                         target="_blank" 
                         rel="noopener noreferrer" 
                         className="inline-flex items-center text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors px-4 py-2 rounded-lg shadow-sm"
                       >
                         <FileText className="w-3.5 h-3.5 mr-2" />
                         Open in New Tab
                       </a>
                    </div>
                    <div className="flex-1 p-4 overflow-hidden">
                      <iframe 
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedApplication.resumeUrl)}&embedded=true`}
                        className="w-full h-full rounded-xl shadow-sm border bg-white" 
                        title="Resume Preview"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <FileText className="w-16 h-16 mb-4 text-slate-300 opacity-50" />
                    <p className="font-medium text-slate-600">No Resume Uploaded</p>
                    <p className="text-sm mt-1">This candidate did not attach a resume file.</p>
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
