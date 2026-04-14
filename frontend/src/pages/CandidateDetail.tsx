import { useState, useEffect, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Clock, Mail, Briefcase } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  stage: string;
  appliedAt: string;
  answers?: { questionId: string; questionText: string; answerText: string }[];
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  
  const [newNote, setNewNote] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [candidateRes, appsRes, notesRes] = await Promise.all([
        api.get(`/candidates/${id}`),
        api.get(`/candidates/${id}/applications`),
        api.get(`/candidates/${id}/notes`)
      ]);
      
      setCandidate(candidateRes.data);
      setApplications(appsRes.data);
      setNotes(notesRes.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load candidate details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/candidates/${id}/notes`);
      setNotes(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAllData();
    }
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !id) return;

    try {
      setIsSubmitting(true);
      await api.post(`/candidates/${id}/notes`, { content: newNote });
      setNewNote('');
      await fetchNotes();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStageBadge = (stage: string) => {
    const stageStyles: Record<string, string> = {
      'APPLIED': 'bg-blue-50 text-blue-700 border-blue-200',
      'SCREENING': 'bg-purple-50 text-purple-700 border-purple-200',
      'INTERVIEW': 'bg-amber-50 text-amber-700 border-amber-200',
      'OFFER': 'bg-green-50 text-green-700 border-green-200',
      'REJECTED': 'bg-slate-100 text-slate-600 border-slate-200'
    };
    
    const style = stageStyles[stage] || stageStyles['APPLIED'];
    
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${style}`}>
        {stage}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
        {error || 'Candidate not found'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in ease-out duration-300 pb-12">
      
      {/* Header Info Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start gap-4 mb-2">
          <Link 
            to="/dashboard/candidates"
            className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{candidate.name}</h1>
            <div className="flex items-center text-sm text-slate-500 mt-2 space-x-4">
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-1.5" />
                {candidate.email}
              </span>
              <span className="flex items-center text-slate-400">
                <Clock className="w-4 h-4 mr-1.5" />
                Added {new Date(candidate.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Applications</h2>
        
        {applications.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900">No applications</h3>
            <p className="text-sm text-slate-500 mt-1">This candidate hasn't applied to any roles yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="py-3 px-6">Job Title</th>
                  <th className="py-3 px-6">Stage</th>
                  <th className="py-3 px-6">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <Fragment key={app.id}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium text-slate-900">
                        {app.jobTitle}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {renderStageBadge(app.stage)}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                    </tr>
                    {app.answers && app.answers.length > 0 && (
                      <tr className="bg-slate-50/30">
                        <td colSpan={3} className="py-4 px-6 border-t border-slate-100">
                          <div className="space-y-4 pl-4 border-l-2 border-slate-200 ml-2">
                            {app.answers.map(ans => (
                              <div key={ans.questionId}>
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{ans.questionText}</h4>
                                <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{ans.answerText}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Notes Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Internal Notes</h2>
        
        <form onSubmit={handleAddNote} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Review thoughts, next steps, feedback..."
            className="w-full min-h-[100px] p-3 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-y mb-4"
          />
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting} disabled={!newNote.trim() || isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 border border-slate-200 border-dashed rounded-xl">
              <h3 className="text-sm font-semibold text-slate-900">No notes yet</h3>
              <p className="text-sm text-slate-500 mt-1">Review the candidate's profile and leave your thoughts.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {formatDate(note.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
