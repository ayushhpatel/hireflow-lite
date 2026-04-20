import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Send, Loader2, User, Bot, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  message: string;
  createdAt: string;
}

export function ScreeningChat() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const startSession = async () => {
      try {
        setIsTyping(true);
        const res = await api.post(`/chat/start/${applicationId}`);
        setSessionId(res.data.sessionId);
        setMessages([res.data.firstMessage]);
        
        // If the AI somehow completed it in 1 turn
        if (res.data.firstMessage.message.toLowerCase().includes('that’s all for now')) {
           setIsCompleted(true);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to initialize screening session.');
      } finally {
        setIsTyping(false);
      }
    };
    if (applicationId) {
      startSession();
    }
  }, [applicationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !sessionId || isCompleted || isTyping) return;

    const userText = inputValue;
    setInputValue('');
    
    // Optimistic UI update
    const tempUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'USER',
      message: userText,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const res = await api.post('/chat/message', {
        sessionId,
        message: userText
      });
      
      setMessages((prev) => [...prev, res.data.message]);
      if (res.data.isCompleted) {
        setIsCompleted(true);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border text-center border-red-200 p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Session Error</h2>
          <p className="text-red-500 font-medium text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:p-6">
      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col bg-white md:rounded-2xl md:shadow-xl md:border md:border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white">
               <Bot className="w-6 h-6" />
             </div>
             <div>
               <h1 className="text-sm font-black text-slate-900 uppercase tracking-wider">Hireflow Assistant</h1>
               <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
                 Live Screening
               </p>
             </div>
          </div>
        </div>

        {/* Chat Timeline */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 && !isTyping ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-50" />
               <p className="font-semibold text-sm">Preparing interview context...</p>
             </div>
          ) : (
            <>
              <div className="flex justify-center mb-8">
                <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              {messages.map((msg) => {
                const isAI = msg.sender === 'AI';
                return (
                  <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex max-w-[85%] gap-2.5 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center mt-1 ${isAI ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                        {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      
                      {/* Bubble */}
                      <div className={`px-4 py-3 rounded-2xl ${isAI ? 'bg-slate-100 rounded-tl-sm text-slate-800' : 'bg-indigo-600 rounded-tr-sm text-white'}`}>
                         <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                         <div className={`text-[10px] mt-1.5 font-semibold opacity-60 ${isAI ? 'text-slate-500 text-left' : 'text-indigo-200 text-right'}`}>
                           {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && messages.length > 0 && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] gap-2.5 flex-row items-center">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex shrink-0 items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="px-4 py-3.5 bg-slate-100 rounded-2xl rounded-tl-sm text-slate-500 flex items-center space-x-1">
                       <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                       <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                       <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-white border-t border-slate-100 shrink-0">
          {isCompleted ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-center text-emerald-700 font-bold gap-2 shadow-sm text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Interview completed successfully. You may close this tab.
            </div>
          ) : (
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-6 pr-14 py-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
                placeholder={isTyping ? 'Wait for AI to finish typing...' : 'Type your message...'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping || !sessionId}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping || !sessionId}
                className="absolute right-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-full text-white transition-colors shadow-sm"
              >
                <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
