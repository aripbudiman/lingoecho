/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Users, 
  Plus, 
  HelpCircle, 
  Settings, 
  LogOut, 
  Languages, 
  BrainCircuit, 
  Puzzle, 
  History as HistoryIcon,
  ChevronDown,
  Share2,
  MoreVertical,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ai, TRANSLATION_SCHEMA, QUIZ_SCHEMA, MATCHING_SCHEMA, type QuizQuestion, type MatchingPair } from './types';
import { saveTranslation, getSessions, getMessages, auth, loginWithEmail, registerWithEmail, logout, saveQuizScore, getQuizScores } from './firebase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'translate' | 'quiz' | 'matching' | 'progress';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('translate');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  // Close sidebar on tab change on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [activeTab, currentSessionId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      getSessions(user.uid, (data) => {
        setSessions(data);
      });
    } else {
      setSessions([]);
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setActiveTab('translate');
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setActiveTab('translate');
  };

  if (authLoading) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center p-6 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#121212] border border-white/5 rounded-[32px] p-8 md:p-10 text-center space-y-8"
        >
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-black mx-auto shadow-2xl shadow-brand/20">
            <Sparkles size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-white/40 text-sm font-medium">
              {isRegistering ? 'Join LingoEcho to start your journey.' : 'Sign in to continue your progress.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4 text-left">
            {isRegistering && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Full Name</label>
                <input 
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
                  placeholder="Olivia Brooks"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Email Address</label>
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
                placeholder="olivia@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Password</label>
              <input 
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-medium bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-dark transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                isRegistering ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/5">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-white/40 hover:text-white text-sm font-medium transition-colors"
            >
              {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
          <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Secure Authentication by Firebase</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: sidebarOpen ? 280 : 0, 
          x: sidebarOpen ? 0 : -280,
          opacity: sidebarOpen ? 1 : 0 
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "bg-[#121212] border-r border-white/5 flex flex-col overflow-hidden fixed md:relative h-full z-50",
          !sidebarOpen && "pointer-events-none"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-black">
            <Sparkles size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">LingoEcho</h1>
        </div>

        <div className="px-4 mb-6">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <Plus size={18} className="text-white/60 group-hover:text-brand" />
              <span className="font-medium text-sm">New Translation</span>
            </div>
          </button>
        </div>

        <div className="px-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-3 mb-2">Main Menu</p>
            <button 
              onClick={() => setActiveTab('translate')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                activeTab === 'translate' ? "bg-white/10 text-brand" : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Languages size={20} />
              <span className="font-medium">Translation</span>
            </button>
            <button 
              onClick={() => setActiveTab('quiz')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                activeTab === 'quiz' ? "bg-white/10 text-brand" : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <BrainCircuit size={20} />
              <span className="font-medium">Quiz Practice</span>
            </button>
            <button 
              onClick={() => setActiveTab('matching')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                activeTab === 'matching' ? "bg-white/10 text-brand" : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Puzzle size={20} />
              <span className="font-medium">Matching Game</span>
            </button>
            <button 
              onClick={() => setActiveTab('progress')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                activeTab === 'progress' ? "bg-white/10 text-brand" : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <TrendingUp size={20} />
              <span className="font-medium">My Progress</span>
            </button>
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-3 mb-2">Recent Translations</p>
            <div className="space-y-1">
              {sessions.map((session) => (
                <button 
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group text-left",
                    currentSessionId === session.id ? "bg-white/5 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <MessageSquare size={16} className="shrink-0" />
                  <span className="text-sm truncate">{session.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} className="w-8 h-8 rounded-full" alt="User" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.displayName}</p>
              <p className="text-[10px] text-white/40 truncate">{user.email}</p>
            </div>
            <button onClick={logout} className="p-2 text-white/40 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col bg-white text-black overflow-hidden relative transition-all duration-300",
        "md:rounded-l-[32px] md:my-2 md:mr-2 shadow-2xl"
      )}>
        <header className="h-16 border-b border-black/5 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-black/5 rounded-lg transition-colors"
            >
              <MessageSquare size={20} className="text-black/60" />
            </button>
            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium text-black/60">
              <span className="truncate max-w-[100px] md:max-w-none">LingoEcho 1.0</span>
              <ChevronDown size={14} />
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button className="p-2 hover:bg-black/5 rounded-lg transition-colors">
              <Share2 size={20} className="text-black/60" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'translate' && <TranslateView key={currentSessionId || 'new'} userId={user.uid} sessionId={currentSessionId} onSessionCreated={setCurrentSessionId} />}
            {activeTab === 'quiz' && <QuizView key="quiz" userId={user.uid} />}
            {activeTab === 'matching' && <MatchingView key="matching" />}
            {activeTab === 'progress' && <ProgressView key="progress" userId={user.uid} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function TranslateView({ userId, sessionId, onSessionCreated }: { userId: string, sessionId: string | null, onSessionCreated: (id: string) => void }) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'casual' | 'formal'>('casual');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionId) {
      getMessages(userId, sessionId, (data) => {
        setMessages(data);
      });
    } else {
      setMessages([]);
    }
  }, [userId, sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const currentInput = input;
    setInput('');
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Terjemahkan teks Indonesia berikut ke Bahasa Inggris dengan nada ${mode}. Berikan terjemahan dan penjelasan tata bahasa (grammar) singkat dalam Bahasa Indonesia.
        Teks: "${currentInput}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: TRANSLATION_SCHEMA
        }
      });
      
      const data = JSON.parse(response.text || '{}');
      const sid = await saveTranslation(userId, sessionId, currentInput, data.translation, data.explanation, mode);
      if (!sessionId) {
        onSessionCreated(sid);
      }
    } catch (error) {
      console.error(error);
      setInput(currentInput); // Restore input on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto relative">
      <div className="flex-1 overflow-y-auto space-y-6 md:space-y-8 pb-32 custom-scrollbar px-2 md:px-0">
        {messages.length === 0 && !loading && (
          <div className="text-center space-y-4 py-12 md:py-20">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-brand/10 text-brand rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Languages size={24} className="md:hidden" />
              <Languages size={32} className="hidden md:block" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-black">
              New Translation
            </h2>
            <p className="text-base md:text-xl text-black/40 font-medium px-4">
              Start by typing Indonesian text below.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 md:space-y-6"
          >
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-black/5 rounded-[20px] md:rounded-[24px] rounded-tr-none p-3 md:p-4 max-w-[90%] md:max-w-[80%]">
                <p className="text-black/80 font-medium text-sm md:text-base">{msg.indonesian}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest",
                    msg.mode === 'casual' ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                  )}>
                    {msg.mode}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Response */}
            <div className="space-y-3 md:space-y-4">
              <div className="bg-brand/10 border border-brand/20 rounded-[24px] md:rounded-[32px] rounded-tl-none p-4 md:p-6 shadow-sm">
                <div className="flex items-center gap-2 text-brand-dark mb-2 md:mb-3 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">
                  <Sparkles size={12} />
                  English Translation
                </div>
                <p className="text-lg md:text-xl font-semibold text-black leading-tight">
                  {msg.english}
                </p>
              </div>

              <div className="bg-black/5 rounded-[24px] md:rounded-[32px] rounded-tl-none p-4 md:p-6 ml-2 md:ml-4">
                <div className="flex items-center gap-2 text-black/40 mb-2 md:mb-3 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">
                  <BrainCircuit size={12} />
                  Grammar Insights
                </div>
                <div className="markdown-body text-black/80 text-sm md:text-base">
                  <Markdown>{msg.explanation}</Markdown>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-black/40 font-medium italic"
          >
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce" />
            </div>
            Translating...
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-black/10 rounded-[20px] md:rounded-[24px] p-1.5 md:p-2 shadow-xl flex items-end gap-2">
            <div className="flex-1 flex flex-col">
              <div className="flex gap-1 p-1 mb-0.5 md:mb-1">
                <button 
                  onClick={() => setMode('casual')}
                  className={cn(
                    "px-2 md:px-3 py-0.5 md:py-1 rounded-lg text-[9px] md:text-[10px] font-bold transition-all",
                    mode === 'casual' ? "bg-black/5 text-black" : "text-black/40 hover:text-black"
                  )}
                >
                  Casual
                </button>
                <button 
                  onClick={() => setMode('formal')}
                  className={cn(
                    "px-2 md:px-3 py-0.5 md:py-1 rounded-lg text-[9px] md:text-[10px] font-bold transition-all",
                    mode === 'formal' ? "bg-black/5 text-black" : "text-black/40 hover:text-black"
                  )}
                >
                  Formal
                </button>
              </div>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleTranslate();
                  }
                }}
                placeholder="Type Indonesian text here..."
                className="w-full max-h-32 p-2 md:p-3 bg-transparent text-sm md:text-base resize-none focus:outline-none placeholder:text-black/20"
                rows={1}
              />
            </div>
            <button 
              onClick={handleTranslate}
              disabled={loading || !input.trim()}
              className="p-2.5 md:p-3 bg-black text-white rounded-lg md:rounded-xl hover:bg-black/80 transition-colors disabled:opacity-50 mb-1 mr-1"
            >
              <Send size={18} className="md:hidden" />
              <Send size={20} className="hidden md:block" />
            </button>
          </div>
          <p className="text-center text-[9px] md:text-[10px] text-black/20 mt-2 md:mt-3 font-medium">
            LingoEcho can make mistakes. Check important grammar rules.
          </p>
        </div>
      </div>
    </div>
  );
}

function QuizView({ userId }: { userId: string }) {
  const [theme, setTheme] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    if (!theme.trim()) return;
    setLoading(true);
    setQuestions([]);
    setUserAnswers({});
    setShowResult(false);
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Buat 10 soal kuis pilihan ganda dalam Bahasa Inggris berdasarkan tema: "${theme}". Sertakan pilihan jawaban, jawaban yang benar, dan penjelasan singkat dalam Bahasa Indonesia untuk setiap soal.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: QUIZ_SCHEMA
        }
      });
      
      const data = JSON.parse(response.text || '[]');
      setQuestions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex: number, option: string) => {
    if (userAnswers[questionIndex]) return;
    setUserAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  const calculateScore = () => {
    return Object.entries(userAnswers).reduce((acc, [idx, ans]) => {
      return ans === questions[Number(idx)].correctAnswer ? acc + 1 : acc;
    }, 0);
  };

  const handleFinish = async () => {
    const finalScore = calculateScore();
    setShowResult(true);
    await saveQuizScore(userId, theme, finalScore, questions.length);
    // Scroll to top to see results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showResult) {
    const finalScore = calculateScore();
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto text-center space-y-8 py-12"
      >
        <div className="w-24 h-24 bg-brand rounded-full flex items-center justify-center mx-auto text-black mb-6">
          <Sparkles size={48} />
        </div>
        <h2 className="text-4xl font-bold">Quiz Completed!</h2>
        <p className="text-xl text-black/60">You scored {finalScore} out of {questions.length}</p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => {
              setQuestions([]);
              setTheme('');
              setUserAnswers({});
              setShowResult(false);
            }}
            className="px-8 py-3 bg-black text-white rounded-2xl font-bold hover:bg-black/80 transition-colors"
          >
            Try Another Theme
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
      <div className="text-center space-y-2 md:space-y-4 mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-black">Quiz Practice</h2>
        <p className="text-base md:text-xl text-black/40 font-medium">Master English through interactive challenges.</p>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white border border-black/10 rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm space-y-6 max-w-xl mx-auto">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Enter Quiz Theme</label>
            <input 
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., Business Meeting, Traveling, Grammar Tenses..."
              className="w-full p-3 md:p-4 bg-black/5 rounded-xl md:rounded-2xl text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <button 
            onClick={generateQuiz}
            disabled={loading || !theme.trim()}
            className="w-full py-3 md:py-4 bg-black text-white rounded-xl md:rounded-2xl font-bold hover:bg-black/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <BrainCircuit size={20} />}
            Generate Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {questions.map((q, qIdx) => (
            <motion.div 
              key={qIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIdx * 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Question {qIdx + 1} of {questions.length}</span>
              </div>

              <div className="bg-white border border-black/10 rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-sm">
                <h3 className="text-xl md:text-2xl font-bold text-black mb-6 md:mb-8 leading-tight">
                  {q.question}
                </h3>
                
                <div className="grid gap-3">
                  {q.options.map((option, oIdx) => {
                    const isCorrect = option === q.correctAnswer;
                    const isSelected = option === userAnswers[qIdx];
                    const hasAnswered = !!userAnswers[qIdx];
                    
                    return (
                      <button 
                        key={oIdx}
                        onClick={() => handleAnswer(qIdx, option)}
                        disabled={hasAnswered}
                        className={cn(
                          "w-full p-4 rounded-xl md:rounded-2xl text-left text-sm md:text-base font-medium transition-all border flex items-center justify-between group",
                          !hasAnswered && "hover:border-black hover:bg-black/5 border-black/10",
                          hasAnswered && isCorrect && "bg-brand/20 border-brand text-black",
                          hasAnswered && isSelected && !isCorrect && "bg-red-50 border-red-200 text-red-600",
                          hasAnswered && !isSelected && !isCorrect && "opacity-50 border-black/5"
                        )}
                      >
                        <span>{option}</span>
                        {hasAnswered && isCorrect && <CheckCircle2 size={20} className="text-brand-dark" />}
                        {hasAnswered && isSelected && !isCorrect && <XCircle size={20} className="text-red-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {userAnswers[qIdx] && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/5 rounded-[24px] md:rounded-[32px] p-6 md:p-8"
                >
                  <div className="flex items-center gap-2 text-black/40 mb-2 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                    <BrainCircuit size={14} />
                    Explanation
                  </div>
                  <p className="text-black/80 leading-relaxed text-sm md:text-base">
                    {q.explanation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}

          <div className="pt-8 flex justify-center">
            <button 
              onClick={handleFinish}
              disabled={Object.keys(userAnswers).length < questions.length}
              className="px-12 py-4 bg-brand text-black rounded-2xl font-bold hover:bg-brand-dark transition-all shadow-xl shadow-brand/20 disabled:opacity-50 disabled:shadow-none"
            >
              Finish & Save Results
            </button>
          </div>
          {Object.keys(userAnswers).length < questions.length && (
            <p className="text-center text-xs text-black/40 font-medium">Please answer all questions to finish.</p>
          )}
        </div>
      )}
    </div>
  );
}

function MatchingView() {
  const [theme, setTheme] = useState('');
  const [pairs, setPairs] = useState<MatchingPair[]>([]);
  const [shuffledIndo, setShuffledIndo] = useState<string[]>([]);
  const [shuffledEng, setShuffledEng] = useState<string[]>([]);
  const [selectedIndo, setSelectedIndo] = useState<string | null>(null);
  const [selectedEng, setSelectedEng] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const generateMatching = async () => {
    if (!theme.trim()) return;
    setLoading(true);
    setPairs([]);
    setMatches({});
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 8 Indonesian-English matching pairs based on the theme: "${theme}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: MATCHING_SCHEMA
        }
      });
      
      const data = JSON.parse(response.text || '[]');
      setPairs(data);
      setShuffledIndo([...data.map((p: any) => p.indonesian)].sort(() => Math.random() - 0.5));
      setShuffledEng([...data.map((p: any) => p.english)].sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedIndo && selectedEng) {
      const pair = pairs.find(p => p.indonesian === selectedIndo && p.english === selectedEng);
      if (pair) {
        setMatches(prev => ({ ...prev, [selectedIndo]: selectedEng }));
      }
      setTimeout(() => {
        setSelectedIndo(null);
        setSelectedEng(null);
      }, 500);
    }
  }, [selectedIndo, selectedEng, pairs]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="text-center space-y-2 md:space-y-4 mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-black">Matching Game</h2>
        <p className="text-base md:text-xl text-black/40 font-medium">Connect words and phrases to build your vocabulary.</p>
      </div>

      {pairs.length === 0 ? (
        <div className="bg-white border border-black/10 rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm space-y-6 max-w-xl mx-auto">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Enter Game Theme</label>
            <input 
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., Household Items, Emotions, Slang..."
              className="w-full p-3 md:p-4 bg-black/5 rounded-xl md:rounded-2xl text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <button 
            onClick={generateMatching}
            disabled={loading || !theme.trim()}
            className="w-full py-3 md:py-4 bg-black text-white rounded-xl md:rounded-2xl font-bold hover:bg-black/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Puzzle size={20} />}
            Start Game
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-2 md:space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2 md:mb-4 px-2">Indonesian</h4>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3">
              {shuffledIndo.map((indo, idx) => (
                <button 
                  key={idx}
                  onClick={() => !matches[indo] && setSelectedIndo(indo)}
                  className={cn(
                    "w-full p-3 md:p-4 rounded-xl md:rounded-2xl text-left text-sm md:text-base font-medium transition-all border",
                    matches[indo] ? "bg-brand/10 border-brand/20 text-black/30 line-through" : 
                    selectedIndo === indo ? "bg-black text-white border-black" : "bg-white border-black/10 hover:border-black"
                  )}
                >
                  {indo}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 md:space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2 md:mb-4 px-2">English</h4>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3">
              {shuffledEng.map((eng, idx) => {
                const isMatched = Object.values(matches).includes(eng);
                return (
                  <button 
                    key={idx}
                    onClick={() => !isMatched && setSelectedEng(eng)}
                    className={cn(
                      "w-full p-3 md:p-4 rounded-xl md:rounded-2xl text-left text-sm md:text-base font-medium transition-all border",
                      isMatched ? "bg-brand/10 border-brand/20 text-black/30 line-through" : 
                      selectedEng === eng ? "bg-black text-white border-black" : "bg-white border-black/10 hover:border-black"
                    )}
                  >
                    {eng}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {Object.keys(matches).length === pairs.length && pairs.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6 md:py-8"
        >
          <h3 className="text-xl md:text-2xl font-bold mb-4">Well Done! You matched them all.</h3>
          <button 
            onClick={() => {
              setPairs([]);
              setTheme('');
            }}
            className="px-6 md:px-8 py-2.5 md:py-3 bg-brand text-black rounded-xl md:rounded-2xl font-bold hover:bg-brand-dark transition-colors"
          >
            Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
}

function ProgressView({ userId }: { userId: string }) {
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuizScores(userId, (data) => {
      setScores(data);
      setLoading(false);
    });
  }, [userId]);

  const averageScore = scores.length > 0 
    ? (scores.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / scores.length * 100).toFixed(1)
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8 md:space-y-12"
    >
      <div className="text-center space-y-2 md:space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-black">Your Progress</h2>
        <p className="text-base md:text-xl text-black/40 font-medium">Track your journey to English fluency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-brand/10 border border-brand/20 rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark mb-2">Average Score</p>
          <p className="text-3xl md:text-5xl font-bold text-black">{averageScore}%</p>
        </div>
        <div className="bg-black/5 rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2">Quizzes Taken</p>
          <p className="text-3xl md:text-5xl font-bold text-black">{scores.length}</p>
        </div>
        <div className="bg-black/5 rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2">Total Points</p>
          <p className="text-3xl md:text-5xl font-bold text-black">{scores.reduce((acc, curr) => acc + curr.score, 0)}</p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg md:text-xl font-bold px-2 md:px-4">Quiz History</h3>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center py-12 md:py-20 bg-black/5 rounded-[24px] md:rounded-[32px] border border-dashed border-black/10">
            <BrainCircuit size={48} className="mx-auto text-black/20 mb-4" />
            <p className="text-black/40 font-medium px-4">No quiz scores yet. Take a quiz to see your progress!</p>
          </div>
        ) : (
          <div className="grid gap-3 md:gap-4">
            {scores.map((score) => (
              <div key={score.id} className="bg-white border border-black/10 rounded-[20px] md:rounded-[24px] p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] md:text-sm font-bold text-black/40 uppercase tracking-widest">{new Date(score.timestamp).toLocaleDateString()}</p>
                  <p className="text-base md:text-lg font-bold text-black">{score.theme}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-left sm:text-right">
                    <p className="text-xl md:text-2xl font-bold text-black">{score.score} / {score.total}</p>
                    <p className="text-[10px] md:text-xs font-bold text-brand-dark uppercase tracking-widest">Score</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-brand/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] md:text-xs font-bold">{(score.score / score.total * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

