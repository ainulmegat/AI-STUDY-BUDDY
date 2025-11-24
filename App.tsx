import React, { useState, useRef, useEffect } from 'react';
import { StudyMode, Message } from './types';
import { generateStudyResponse, resetSession } from './services/gemini';
import { ChatBubble } from './components/ChatBubble';
import { TypingIndicator } from './components/TypingIndicator';

// Icons
const ExplainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 2.625v-8.191c0-3.114-2.725-5.625-6-5.625h-.375a1.125 1.125 0 01-1.125-1.125V1.5m6 4.125h.008v.008h-.008V5.625zm-3 0h.008v.008h-.008V5.625zm3 5.625h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
  </svg>
);

const SummarizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
  </svg>
);

const QuizIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-500">
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM9 15a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019 15z" clipRule="evenodd" />
  </svg>
);

// Constants
const TEMPLATES: Record<StudyMode, string[]> = {
  [StudyMode.EXPLAIN]: [
    "Explain ... like I'm 5 years old",
    "How does ... work?",
    "Use an analogy to explain ...",
    "Difference between ... and ..."
  ],
  [StudyMode.SUMMARIZE]: [
    "Summarize this text in bullet points: ...",
    "Key takeaways from ...",
    "Simplify this concept: ...",
    "Create a study guide for ..."
  ],
  [StudyMode.QUIZ]: [
    "Generate a quiz on ...",
    "Test my knowledge of ...",
    "Create a hard quiz about ...",
    "Create a comprehensive quiz on ..."
  ]
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<StudyMode>(StudyMode.EXPLAIN);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const modelMessageId = (Date.now() + 1).toString();
    
    // Optimistically add model message container
    setMessages((prev) => [
      ...prev,
      {
        id: modelMessageId,
        role: 'model',
        text: '',
        timestamp: Date.now(),
      },
    ]);

    try {
      await generateStudyResponse(userMessage.text, mode, (accumulatedText) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId ? { ...msg, text: accumulatedText } : msg
          )
        );
      });
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMessageId
            ? { ...msg, text: "I'm having trouble connecting right now. Please try again.", isError: true }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    resetSession();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getWelcomeMessage = (currentMode: StudyMode) => {
    switch (currentMode) {
      case StudyMode.EXPLAIN:
        return "Hi! I'm your Study Buddy. What topic are you stuck on? I can explain it simply with examples.";
      case StudyMode.SUMMARIZE:
        return "Need to digest a lot of info? Paste your notes here, and I'll give you a clean bullet-point summary (max 5 points).";
      case StudyMode.QUIZ:
        return "Ready to test your knowledge? Tell me the topic, and I'll generate a comprehensive 10-question quiz for you.";
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Hidden on small mobile, visible on md+ */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M11.25 4.533A9.707 9.707 0 006 3.75a9.753 9.753 0 00-9.75 9.75c0 .482.112.936.313 1.345a.812.812 0 001.323.123l5.274-4.42a.75.75 0 011.125.966l-5.274 4.42a.809.809 0 00-.123 1.198c.506.609 1.09 1.157 1.736 1.633a.75.75 0 00.966-1.125l-4.42-5.274a.812.812 0 01.123-1.323c.409-.201.863-.313 1.345-.313a9.753 9.753 0 009.75-9.75c0-.206-.01-.41-.03-.611z" />
              <path d="M15 1.5a6.75 6.75 0 00-3.93 12.233.75.75 0 001.165-1.004A5.25 5.25 0 0115 3a.75.75 0 000-1.5z" />
            </svg>
            <span>StudyBuddy</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">AI-Powered Learning</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 ml-2">Select Mode</h3>
           
           <button 
            onClick={() => setMode(StudyMode.EXPLAIN)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${mode === StudyMode.EXPLAIN ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm ring-1 ring-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
           >
             <ExplainIcon />
             <span>Explain</span>
           </button>

           <button 
            onClick={() => setMode(StudyMode.SUMMARIZE)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${mode === StudyMode.SUMMARIZE ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm ring-1 ring-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
           >
             <SummarizeIcon />
             <span>Summarize</span>
           </button>

           <button 
            onClick={() => setMode(StudyMode.QUIZ)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${mode === StudyMode.QUIZ ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm ring-1 ring-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
           >
             <QuizIcon />
             <span>Generate Quiz</span>
           </button>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshIcon />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-10">
           <div className="font-bold text-indigo-600 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M11.25 4.533A9.707 9.707 0 006 3.75a9.753 9.753 0 00-9.75 9.75c0 .482.112.936.313 1.345a.812.812 0 001.323.123l5.274-4.42a.75.75 0 011.125.966l-5.274 4.42a.809.809 0 00-.123 1.198c.506.609 1.09 1.157 1.736 1.633a.75.75 0 00.966-1.125l-4.42-5.274a.812.812 0 01.123-1.323c.409-.201.863-.313 1.345-.313a9.753 9.753 0 009.75-9.75c0-.206-.01-.41-.03-.611z" />
              <path d="M15 1.5a6.75 6.75 0 00-3.93 12.233.75.75 0 001.165-1.004A5.25 5.25 0 0115 3a.75.75 0 000-1.5z" />
            </svg>
             StudyBuddy
           </div>
           <button onClick={handleReset} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
             <RefreshIcon />
           </button>
        </div>

        {/* Mobile Mode Tabs */}
        <div className="md:hidden flex bg-white border-b border-slate-200">
           <button onClick={() => setMode(StudyMode.EXPLAIN)} className={`flex-1 py-3 text-xs font-medium flex justify-center gap-1 ${mode === StudyMode.EXPLAIN ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>
             <ExplainIcon /> Explain
           </button>
           <button onClick={() => setMode(StudyMode.SUMMARIZE)} className={`flex-1 py-3 text-xs font-medium flex justify-center gap-1 ${mode === StudyMode.SUMMARIZE ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>
             <SummarizeIcon /> Summary
           </button>
           <button onClick={() => setMode(StudyMode.QUIZ)} className={`flex-1 py-3 text-xs font-medium flex justify-center gap-1 ${mode === StudyMode.QUIZ ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}>
             <QuizIcon /> Quiz
           </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                   {mode === StudyMode.EXPLAIN && <div className="scale-150"><ExplainIcon /></div>}
                   {mode === StudyMode.SUMMARIZE && <div className="scale-150"><SummarizeIcon /></div>}
                   {mode === StudyMode.QUIZ && <div className="scale-150"><QuizIcon /></div>}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                  {mode === StudyMode.EXPLAIN && "Let's learn something new."}
                  {mode === StudyMode.SUMMARIZE && "Let's summarize your notes."}
                  {mode === StudyMode.QUIZ && "Time for a quick quiz!"}
                </h1>
                <p className="text-slate-500 max-w-md text-lg leading-relaxed">
                  {getWelcomeMessage(mode)}
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={chatEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white/80 backdrop-blur-md border-t border-slate-200">
          <div className="max-w-3xl mx-auto">
            {/* Template Chips */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2 px-1">
                <SparklesIcon />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prompt Templates</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {TEMPLATES[mode].map((text, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(text)}
                    className="whitespace-nowrap px-4 py-2 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-slate-600 text-sm rounded-full border border-slate-200 transition-all shadow-sm flex-shrink-0"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  mode === StudyMode.QUIZ 
                  ? "Enter a topic to generate a quiz (e.g., Photosynthesis)..." 
                  : "Type your question or topic here..."
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none shadow-sm text-slate-700 placeholder:text-slate-400"
                rows={1}
                style={{ minHeight: '60px' }}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 top-2 bottom-2 aspect-square rounded-xl flex items-center justify-center transition-all duration-200 ${
                  input.trim() && !isLoading
                    ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:scale-105'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <SendIcon />
              </button>
            </div>
          </div>
          <div className="text-center mt-2">
             <p className="text-[10px] text-slate-400 uppercase tracking-widest">AI Study Buddy • Powered by Gemini</p>
          </div>
        </div>

      </div>
    </div>
  );
}