import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Send, MessageSquare, BrainCircuit, X, Mic, MicOff, User } from 'lucide-react';

const SUGGESTIONS = [
  'Web Development skills',
  'Data Science career path',
  'Interview preparation tips',
  'How to write a good resume',
  'Salary negotiation advice',
  'Cloud Computing skills',
];

const ChatMessage = ({ from, text }) => {
  const isUser = from === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`} aria-label={`${from}-message`}>
      {!isUser && (
        <div className="w-9 h-9 rounded-2xl bg-sky-600 flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-lg shadow-sky-100 dark:shadow-none">
          <BrainCircuit className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm leading-relaxed whitespace-pre-wrap text-sm font-medium ${
          isUser
            ? 'bg-sky-600 text-white rounded-br-none shadow-sky-100 dark:shadow-none'
            : 'bg-white dark:bg-dark-elevated text-light-text-primary dark:text-dark-text-primary rounded-bl-none border border-light-border dark:border-white/5'
        }`}
      >
        {text}
      </div>
    </div>
  );
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hi! I'm your AI career guidance assistant 🎯\n\nAsk me about tech domains, resume writing, interview prep, salary negotiation, or networking.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [interviewMode, setInterviewMode] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL || '/api';
  const api = useMemo(() => axios.create({ baseURL: API_BASE }), [API_BASE]);

  // Setup Speech Recognition
  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + ' ' + finalTranscript.trim());
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      alert("Microphone is not supported in this browser.");
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    setMessages(prev => [...prev, { from: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);
    try {
      const payload = { query: trimmed };
      if (interviewMode) {
        payload.query = `[Mock Interview Mode] ${trimmed}`;
      }
      const res = await api.post('/chatbot', payload);
      const answer = res.data?.answer || 'Sorry, I could not generate a response.';
      setMessages(prev => [...prev, { from: 'bot', text: answer }]);
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: 'There was a problem reaching the server. Please try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="card-3d overflow-hidden p-0 border-transparent shadow-premium dark:shadow-premium-dark">
        <div className="relative p-6 bg-white dark:bg-dark-surface">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.08),transparent_60%)]" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-sky-600 rounded-2xl shadow-lg shadow-sky-100 dark:shadow-none">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-light-text-primary dark:text-white tracking-tight flex items-center gap-2">
                {interviewMode ? 'AI Mock Interviewer' : 'Career Guidance Chatbot'}
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white rounded-lg ${interviewMode ? 'bg-emerald-500' : 'bg-sky-600'}`}>
                  AI
                </span>
              </h1>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium mt-0.5">
                {interviewMode ? 'Practice answering technical and HR questions' : 'Ask anything about careers, skills, or placement preparation'}
              </p>
            </div>
            
            <div className="ml-auto">
              <button
                onClick={() => {
                  setInterviewMode(!interviewMode);
                  if (!interviewMode) {
                    setMessages([{ from: 'bot', text: 'Mock Interview Mode Enabled.\n\nPlease tell me which role you are interviewing for (e.g., Software Engineer, Data Analyst) and we will begin.' }]);
                    setShowSuggestions(false);
                  } else {
                    setMessages([{ from: 'bot', text: "Hi! I'm your AI career guidance assistant 🎯\n\nAsk me about tech domains, resume writing, interview prep, salary negotiation, or networking." }]);
                    setShowSuggestions(true);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  interviewMode 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400 border border-sky-200 dark:border-sky-800 hover:bg-sky-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  {interviewMode ? 'Exit Interview' : 'Start Interview'}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat container */}
      <div className="flex flex-col h-[calc(100vh-310px)] max-h-[650px] overflow-hidden card-3d shadow-premium dark:shadow-premium-dark p-0 border-transparent">
        <div className="h-1 w-full bg-gradient-to-r from-sky-500 to-cyan-500" />

        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto bg-light-base/20 dark:bg-transparent" style={{ minHeight: 0 }}>
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} from={msg.from} text={msg.text} />
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-center gap-2 ml-12 mb-4">
              <div className="flex gap-1 bg-white dark:bg-dark-elevated px-4 py-3 rounded-2xl rounded-bl-none border border-light-border dark:border-white/5 shadow-sm">
                {[0, 150, 300].map(delay => (
                  <span key={delay} className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips */}
        {showSuggestions && (
          <div className="px-5 pb-3 border-t border-light-border dark:border-white/5 pt-3 bg-white dark:bg-dark-elevated/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Suggested Topics</p>
              <button onClick={() => setShowSuggestions(false)} className="text-light-text-muted hover:text-rose-500 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-light-border dark:border-white/5 p-4 bg-white dark:bg-dark-elevated/30">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="flex-1 resize-none bg-light-base dark:bg-white/[0.02] text-light-text-primary dark:text-white px-4 py-3 border border-light-border dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/50 outline-none placeholder:text-light-text-muted text-sm font-medium transition-all"
              placeholder={isListening ? 'Listening...' : (interviewMode ? 'Answer the question...' : 'Ask me anything about your career…')}
              disabled={loading}
            />
            
            <button
              onClick={toggleListen}
              className={`p-3.5 rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 active:scale-95 duration-200 h-[52px] w-[52px] flex items-center justify-center flex-shrink-0 ${
                isListening 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 dark:shadow-none animate-pulse' 
                  : 'bg-white dark:bg-dark-elevated text-sky-600 border border-light-border dark:border-white/5 hover:bg-sky-50 dark:hover:bg-sky-500/10'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className={`p-3.5 rounded-2xl text-white transition-all shadow-lg disabled:opacity-30 hover:-translate-y-0.5 active:scale-95 duration-200 h-[52px] w-[52px] flex items-center justify-center flex-shrink-0 ${interviewMode ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 dark:shadow-none' : 'bg-sky-600 hover:bg-sky-700 shadow-sky-100 dark:shadow-none'}`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-2 text-center">
            Press <kbd className="px-1 py-0.5 rounded bg-light-elevated dark:bg-dark-elevated text-[9px] font-mono">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-light-elevated dark:bg-dark-elevated text-[9px] font-mono">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;



