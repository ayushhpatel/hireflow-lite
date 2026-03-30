import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Clock } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export function CandidateNotes() {
  const { id } = useParams<{ id: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/candidates/${id}/notes`);
      setNotes(res.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchNotes();
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
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in ease-out duration-300 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link 
          to="/dashboard/candidates"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidate Notes</h1>
          <p className="text-slate-500 text-sm">Review context and history</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {/* Add Note Area */}
      <form onSubmit={handleAddNote} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Leave a note..."
          className="w-full min-h-[100px] p-3 border border-slate-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-y mb-4"
          required
        />
        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting} disabled={!newNote.trim()}>
            Add Note
          </Button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 border-dashed rounded-xl">
            <h3 className="text-base font-semibold text-slate-900">No notes yet</h3>
            <p className="text-sm text-slate-500 mt-1">Be the first to leave a comment.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed mb-3">
                {note.content}
              </p>
              <div className="flex items-center text-xs text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {formatDate(note.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
