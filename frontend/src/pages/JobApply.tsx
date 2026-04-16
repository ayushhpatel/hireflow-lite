import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';

interface Job {
  id: string;
  title: string;
  department: string;
  description?: string;
}

export function JobApplyPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resumeUrl: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const [questions, setQuestions] = useState<{id: string, questionText: string, type: 'TEXT' | 'YES_NO'}[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        const [jobRes, qRes] = await Promise.all([
          api.get(`/public/jobs/${jobId}`),
          api.get(`/public/jobs/${jobId}/questions`)
        ]);
        setJob(jobRes.data);
        setQuestions(qRes.data);
      } catch (err) {
        setError('Job not found or is no longer open.');
      } finally {
        setIsLoading(false);
      }
    };
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      setIsSubmitting(true);
      setError('');
      let finalResumeUrl = '';

      if (resumeFile) {
        const fileData = new FormData();
        fileData.append('file', resumeFile);
        const uploadRes = await api.post('/public/upload/resume', fileData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        finalResumeUrl = uploadRes.data.url;
      }

      const answersArray = Object.keys(answers).map(qId => ({
        questionId: qId,
        answerText: answers[qId]
      }));

      await api.post('/public/apply', {
        jobId,
        ...formData,
        resumeUrl: finalResumeUrl,
        answers: answersArray
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', resumeUrl: '' });
      setResumeFile(null);
      setAnswers({});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 px-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium border border-red-100 max-w-md w-full">
          {error}
        </div>
        <Link to="/careers" className="text-blue-600 hover:underline text-sm font-medium">
          ← Back to all careers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 border-t-4 border-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto animate-in fade-in ease-out duration-300">
        
        <Link to="/careers" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all careers
        </Link>

        {isSuccess ? (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Application Submitted!</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Thank you for applying to the {job?.title} position. Our team will review your application and be in touch soon.
            </p>
            <div className="pt-4">
              <Link to="/careers">
                <Button>Browse more roles</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8 sm:p-10 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    {job?.department || 'General'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    Actively Hiring
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{job?.title}</h1>
              </div>
              
              <div className="p-8 sm:p-10">
                {job?.description && (
                  <div className="mb-12">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">About the Role</h3>
                    <div className="text-slate-600 whitespace-pre-wrap leading-relaxed text-base">
                      {job.description}
                    </div>
                  </div>
                )}
                
                <div className="pt-10 border-t border-slate-100">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Submit your application</h3>
                  <p className="text-slate-500 mb-8">Please fill out the form below carefully. All fields marked with an asterisk (*) are required.</p>
                  
                  {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center shadow-sm">
                      <span className="mr-2">⚠️</span> {error}
                    </div>
                  )}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label htmlFor="name" className="text-sm font-bold text-slate-700">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-900"
                          placeholder="Jane Doe"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-900"
                          placeholder="jane@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="text-sm font-bold text-slate-700">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-900"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="resumeFile" className="text-sm font-bold text-slate-700">Resume (PDF, max 5MB)</label>
                      <input
                        type="file"
                        id="resumeFile"
                        name="resumeFile"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 font-medium text-slate-600 cursor-pointer"
                      />
                      {resumeFile && (
                        <p className="text-sm text-emerald-600 mt-2 font-bold inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Selected: {resumeFile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {questions.length > 0 && (
                    <div className="pt-8 mt-8 border-t border-slate-100 space-y-6">
                      <h4 className="font-bold text-slate-900 text-lg">Job Specific Questions</h4>
                      <div className="space-y-8">
                        {questions.map((q) => (
                          <div key={q.id} className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <label className="block text-sm font-bold text-slate-800 leading-relaxed">
                              {q.questionText} <span className="text-red-500">*</span>
                            </label>
                            {q.type === 'TEXT' ? (
                              <textarea
                                required
                                value={answers[q.id] || ''}
                                onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[120px] transition-all font-medium text-slate-800 resize-y"
                                placeholder="Write your answer here..."
                              />
                            ) : (
                              <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                                  <input
                                    type="radio"
                                    name={`question_${q.id}`}
                                    value="Yes"
                                    required
                                    checked={answers[q.id] === 'Yes'}
                                    onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                    className="w-4 h-4 text-slate-900 focus:ring-slate-900 border-slate-300 cursor-pointer"
                                  />
                                  <span className="text-sm font-bold text-slate-700">Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                                  <input
                                    type="radio"
                                    name={`question_${q.id}`}
                                    value="No"
                                    required
                                    checked={answers[q.id] === 'No'}
                                    onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                    className="w-4 h-4 text-slate-900 focus:ring-slate-900 border-slate-300 cursor-pointer"
                                  />
                                  <span className="text-sm font-bold text-slate-700">No</span>
                                </label>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-8 mt-8 border-t border-slate-100">
                    <Button 
                      type="submit" 
                      className="w-full justify-center text-lg py-4 font-bold rounded-xl bg-slate-900 shadow-md hover:shadow-lg transition-all" 
                      isLoading={isSubmitting}
                      disabled={!formData.name || !formData.email || isSubmitting}
                    >
                      {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                    </Button>
                    <p className="text-center text-xs text-slate-400 mt-4 font-medium">By submitting, you agree to HireFlow's data processing terms.</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
