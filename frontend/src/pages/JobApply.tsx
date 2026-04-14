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
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/public/jobs/${jobId}`);
        setJob(response.data);
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

      await api.post('/public/apply', {
        jobId,
        ...formData,
        resumeUrl: finalResumeUrl
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', resumeUrl: '' });
      setResumeFile(null);
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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto animate-in fade-in ease-out duration-300">
        
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{job?.title}</h1>
              <p className="text-slate-500 font-medium">{job?.department || 'General'}</p>
              
              {job?.description && (
                <div className="mt-6 text-slate-700 whitespace-pre-wrap leading-relaxed text-[15px]">
                  {job.description}
                </div>
              )}
              
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Submit your application</h3>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
                      placeholder="Jane Doe"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="resumeFile" className="text-sm font-medium text-slate-700">Resume (PDF, max 5MB)</label>
                    <input
                      type="file"
                      id="resumeFile"
                      name="resumeFile"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {resumeFile && (
                      <p className="text-xs text-green-600 mt-2 font-medium">Selected: {resumeFile.name}</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full justify-center text-base py-3" 
                      isLoading={isSubmitting}
                      disabled={!formData.name || !formData.email || isSubmitting}
                    >
                      {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
