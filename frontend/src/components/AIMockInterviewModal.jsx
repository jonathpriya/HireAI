import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import API from '../services/api';

import { 
  Sparkles, X, Mic, MicOff, Volume2, Send, CheckCircle2, 
  AlertCircle, BookOpen, Lightbulb, RefreshCw, Award, Zap, ThumbsUp, ArrowRight
} from 'lucide-react';

export default function AIMockInterviewModal({ invitation, onClose }) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'guide'
  const [prepData, setPrepData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputAnswer, setInputAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [scoresList, setScoresList] = useState([]);
  const [interviewFinished, setInterviewFinished] = useState(false);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Speech Synthesis (Text-to-speech)
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  const chatBottomRef = useRef(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, evaluating]);

  // Load Interview Questions & Context from Backend
  useEffect(() => {
    const fetchPrepData = async () => {
      setLoading(true);
      try {
        const res = await API.post(`/candidate/interview-prep/${invitation.id}`);
        const data = res.data;
        setPrepData(data);

        // Initialize Chat Messages with AI Greeting & Question #1
        const initialQuestions = data.questions || [];
        if (initialQuestions.length > 0) {
          const firstQ = initialQuestions[0];
          setMessages([
            {
              id: 'msg-welcome',
              sender: 'ai',
              type: 'greeting',
              text: `Hello! I'm your AI Technical Interviewer for the **${invitation.job_title}** position at **${invitation.company_name}**. \n\nI will ask you 4 tailored interview questions. You can reply by **typing** or using the **🎤 Voice Input** button to speak your answer! \n\nLet's get started with your first question:`,
            },
            {
              id: 'msg-q-0',
              sender: 'ai',
              type: 'question',
              questionIndex: 0,
              text: firstQ,
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to load interview prep data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrepData();

    // Check Speech Recognition Browser Support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, [invitation.id, invitation.job_title, invitation.company_name]);

  // Handle Speech Recognition (Voice-to-Text)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          let newFinalText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              newFinalText += event.results[i][0].transcript + ' ';
            }
          }
          if (newFinalText.trim()) {
            setInputAnswer((prev) => {
              const existing = (prev || '').trim();
              const added = newFinalText.trim();
              if (existing.endsWith(added)) return prev;
              return existing ? `${existing} ${added}` : added;
            });
          }
        };


        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        console.error("Failed to start speech recognition", e);
        setIsListening(false);
      }
    }
  };

  // Text-to-Speech (AI reads question out loud)
  const handleSpeakText = (msgId, text) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);

      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Submit Answer & Request AI Evaluation
  const handleSendAnswer = async (e) => {
    if (e) e.preventDefault();
    const answerText = inputAnswer.trim();
    if (!answerText || evaluating || interviewFinished) return;

    // Stop recording if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const currentQText = prepData?.questions[currentQuestionIndex] || "";

    // Append Candidate Answer Message
    const candMsgId = `cand-ans-${currentQuestionIndex}-${Date.now()}`;
    const userMsg = {
      id: candMsgId,
      sender: 'user',
      type: 'answer',
      text: answerText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputAnswer('');
    setEvaluating(true);

    try {
      // Call backend AI answer evaluation API
      const res = await API.post('/candidate/interview-chat', {
        question: currentQText,
        answer: answerText,
        job_title: invitation.job_title,
        job_description: prepData?.job_description || invitation.job_description,
        required_skills: prepData?.required_skills || []
      });

      const evalData = res.data;
      setScoresList((prev) => [...prev, evalData.score]);

      // Evaluation Feedback Card Message
      const evalMsg = {
        id: `eval-${currentQuestionIndex}-${Date.now()}`,
        sender: 'ai',
        type: 'evaluation',
        questionIndex: currentQuestionIndex,
        eval: evalData
      };

      const nextQIndex = currentQuestionIndex + 1;
      const totalQ = prepData?.questions?.length || 4;

      if (nextQIndex < totalQ) {
        const nextQText = prepData.questions[nextQIndex];
        const nextQMsg = {
          id: `msg-q-${nextQIndex}`,
          sender: 'ai',
          type: 'question',
          questionIndex: nextQIndex,
          text: `**Question ${nextQIndex + 1} of ${totalQ}:**\n${nextQText}`
        };

        setMessages((prev) => [...prev, evalMsg, nextQMsg]);
        setCurrentQuestionIndex(nextQIndex);
      } else {
        // Finish Interview
        setMessages((prev) => [...prev, evalMsg]);
        setInterviewFinished(true);
      }
    } catch (err) {
      console.error("Evaluation failed", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'ai',
          type: 'error',
          text: "Failed to evaluate response. Please check your connection and try submitting again."
        }
      ]);
    } finally {
      setEvaluating(false);
    }
  };

  // Restart Practice Interview
  const handleRestart = () => {
    setInterviewFinished(false);
    setCurrentQuestionIndex(0);
    setScoresList([]);
    setInputAnswer('');
    if (prepData?.questions?.length > 0) {
      setMessages([
        {
          id: 'msg-welcome-restart',
          sender: 'ai',
          type: 'greeting',
          text: `Welcome back! Let's restart your AI mock interview for **${invitation.job_title}**. \n\nHere is Question #1:`,
        },
        {
          id: `msg-q-restart-0`,
          sender: 'ai',
          type: 'question',
          questionIndex: 0,
          text: prepData.questions[0],
        }
      ]);
    }
  };

  const avgScore = scoresList.length > 0 
    ? Math.round(scoresList.reduce((a, b) => a + b, 0) / scoresList.length) 
    : 0;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="glass-card max-w-3xl w-full h-[90vh] rounded-3xl border border-purple-500/30 flex flex-col overflow-hidden shadow-2xl bg-slate-950 relative z-[10000]">


        {/* ── Modal Header ──────────────────────────────────────────────────────── */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">AI Mock Interviewer</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  LIVE CHAT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {invitation.job_title} &bull; <strong className="text-purple-300">{invitation.company_name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Average Score Badge if questions answered */}
            {scoresList.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Score: {avgScore}%</span>
              </div>
            )}

            <button 
              onClick={onClose} 
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/50 px-4 gap-2 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'chat'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Interactive Interview (ChatGPT Mode)
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'guide'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            Strategy &amp; Prep Tips
          </button>
        </div>

        {/* ── Content Container ───────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-400 gap-3">
            <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-sm font-semibold">Initializing AI Technical Interviewer...</p>
          </div>
        ) : activeTab === 'guide' ? (
          /* ── Tab 2: Strategy Guide ── */
          <div className="flex-grow p-6 space-y-6 overflow-y-auto">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" /> Prepared Question Blueprint
              </h4>
              <div className="space-y-2">
                {prepData?.questions?.map((q, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                    <span className="font-extrabold text-purple-400 shrink-0">Q{idx + 1}.</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" /> Pro Preparation Tips
              </h4>
              <div className="space-y-2">
                {prepData?.tips?.map((tip, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
                    <span className="text-amber-400 shrink-0">💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('chat')}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-purple-500/20"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Launch Interactive Practice Interview
            </button>
          </div>
        ) : (
          /* ── Tab 1: Live Chat Mode ── */
          <div className="flex-grow flex flex-col min-h-0 bg-slate-950">

            {/* Chat Messages Feed */}
            <div className="flex-grow p-4 sm:p-5 overflow-y-auto space-y-4">

              {messages.map((msg, index) => (
                <div key={msg.id || index} className="space-y-2">

                  {/* AI Message */}
                  {msg.sender === 'ai' && (
                    <div className="flex items-start gap-3 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-purple-500/20 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>

                      <div className="space-y-2 flex-grow">

                        {/* Text / Question Bubble */}
                        {msg.text && (
                          <div className="glass-card p-4 rounded-2xl bg-slate-900/90 border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-sm relative group">
                            <p className="whitespace-pre-line">{msg.text}</p>

                            {/* Listen Button (Speech Synthesis) */}
                            <button
                              type="button"
                              onClick={() => handleSpeakText(msg.id, msg.text)}
                              className={`absolute right-2 top-2 p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                                speakingMsgId === msg.id 
                                  ? 'bg-purple-500 text-white animate-pulse' 
                                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                              }`}
                              title="Listen to question"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Evaluation Result Card */}
                        {msg.type === 'evaluation' && msg.eval && (
                          <div className="glass-card p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/30 space-y-3 shadow-lg">

                            {/* Score & Grade Header */}
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                                  msg.eval.score >= 80 
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                    : msg.eval.score >= 60 
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}>
                                  Grade {msg.eval.grade} ({msg.eval.grade_label})
                                </span>
                                <span className="text-xs font-bold text-slate-300">
                                  Score: {msg.eval.score}%
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-400">
                                Words: {msg.eval.word_count}
                              </div>
                            </div>

                            {/* Feedback Text */}
                            <p className="text-xs text-slate-200 font-medium">
                              {msg.eval.feedback}
                            </p>

                            {/* Suggestions / Key Improvements */}
                            {msg.eval.suggestions && msg.eval.suggestions.length > 0 && (
                              <div className="space-y-1 pt-1">
                                <p className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                                  <Lightbulb className="w-3 h-3" /> Tips &amp; Suggestions:
                                </p>
                                <ul className="space-y-1">
                                  {msg.eval.suggestions.map((sug, sIdx) => (
                                    <li key={sIdx} className="text-[11px] text-slate-300 pl-2 border-l-2 border-amber-500/40">
                                      {sug}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Model Answer Hint */}
                            {msg.eval.model_answer_hint && (
                              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200 space-y-0.5">
                                <p className="font-bold text-purple-300 flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-amber-400" /> Ideal Answer Outline:
                                </p>
                                <p className="text-slate-300">{msg.eval.model_answer_hint}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Candidate Answer Bubble */}
                  {msg.sender === 'user' && (
                    <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="max-w-xl p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs sm:text-sm leading-relaxed shadow-lg shadow-purple-600/20">
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                  )}

                </div>
              ))}

              {/* Evaluating Loading Indicator */}
              {evaluating && (
                <div className="flex items-center gap-3 max-w-md animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="glass-card px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-purple-300 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                    <span>Evaluating your answer &amp; preparing next question...</span>
                  </div>
                </div>
              )}

              {/* Final Summary Card when Interview Finished */}
              {interviewFinished && (
                <div className="glass-card p-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 space-y-4 shadow-xl text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-white">Mock Interview Complete!</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Great effort! You answered all 4 tailored questions for <strong className="text-purple-300">{invitation.job_title}</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-w-sm mx-auto space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Average Score</p>
                    <p className="text-4xl font-black gradient-text">{avgScore}%</p>
                    <p className="text-[11px] text-slate-400">
                      {avgScore >= 75 ? "🎉 Excellent! You are well prepared for recruiter interviews." : "💡 Keep practicing to sharpen your responses!"}
                    </p>
                  </div>

                  <button
                    onClick={handleRestart}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-2 transition shadow-lg shadow-purple-500/20"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Restart Practice Interview
                  </button>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Candidate Answer Input Area */}
            {!interviewFinished && (
              <form onSubmit={handleSendAnswer} className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 space-y-2 shrink-0">

                {/* Voice Status Pill */}
                {isListening && (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs animate-pulse">
                    <span className="flex items-center gap-2 font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      Listening... Speak your answer clearly into your microphone
                    </span>
                    <button type="button" onClick={toggleSpeechRecognition} className="text-[11px] underline hover:text-white">
                      Done Speaking
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2">

                  {/* Speech-to-Text Voice Input Button */}
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    disabled={evaluating}
                    className={`p-3 rounded-2xl border transition shrink-0 flex items-center justify-center ${
                      isListening
                        ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-500/30 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-purple-400 border-slate-700'
                    }`}
                    title={isListening ? 'Stop Listening' : 'Speak answer (Voice Input)'}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  {/* Text Input Area */}
                  <div className="flex-grow relative">
                    <textarea
                      rows={2}
                      disabled={evaluating}
                      value={inputAnswer}
                      onChange={(e) => setInputAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendAnswer();
                        }
                      }}
                      placeholder={isListening ? "Listening to your voice..." : "Type your answer or click 🎤 to speak..."}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-purple-500 outline-none resize-none"
                    />
                  </div>

                  {/* Send Answer Button */}
                  <button
                    type="submit"
                    disabled={evaluating || !inputAnswer.trim()}
                    className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition disabled:opacity-40 shrink-0 shadow-lg shadow-purple-500/20"
                    title="Submit Answer"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                  <span>Shift + Enter for new line &bull; Press Enter to submit</span>
                  <span>{inputAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

