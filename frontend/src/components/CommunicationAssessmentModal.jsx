import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import API from '../services/api';
import { 
  Sparkles, X, Mic, MicOff, Volume2, Send, CheckCircle2, 
  Award, ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, MessageSquare, Zap, BarChart2, AlertTriangle, RotateCcw
} from 'lucide-react';

export default function CommunicationAssessmentModal({ onClose, onCompleted }) {
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { 1: "answer text", 2: "answer text" }
  const [pastedState, setPastedState] = useState({}); // { 1: true/false }
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [aiError, setAiError] = useState('');

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Refs for current step & questions so recognition handlers always access latest state
  const currentStepRef = useRef(currentStep);
  const questionsRef = useRef(questions);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    // Lock body scrolling
    document.body.style.overflow = 'hidden';

    // Fetch questions
    API.get('/candidate/communication-assessment/questions')
      .then((res) => {
        setQuestions(res.data.questions || []);
      })
      .catch((err) => {
        console.error("Failed to load communication questions", err);
      })
      .finally(() => setLoading(false));

    // Check Web Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      stopListening();
    };
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const startListening = () => {
    stopListening();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        let newFinalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            newFinalText += event.results[i][0].transcript + ' ';
          }
        }
        if (newFinalText.trim()) {
          const currentQId = questionsRef.current[currentStepRef.current]?.id;
          if (currentQId) {
            setUserAnswers((prev) => {
              const existing = (prev[currentQId] || '').trim();
              const added = newFinalText.trim();
              if (existing.endsWith(added)) return prev;
              return {
                ...prev,
                [currentQId]: existing ? `${existing} ${added}` : added
              };
            });
            setAiError('');
          }
        }
      };

      rec.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        stopListening();
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      stopListening();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const checkIsAIGenerated = (text) => {
    if (!text || text.trim().length < 10) return null;
    const lower = text.toLowerCase();
    
    const aiPatterns = [
      "as an ai", "chatgpt", "language model", "certainly!", "in summary", 
      "in conclusion", "furthermore", "delving into", "tapestry", 
      "fostering a culture", "beacon of", "seamlessly",
      "let's dive", "in the realm of", "navigating the complexities",
      "pivotal role", "crucial role", "relentless pursuit",
      "as a passionate software engineer", "as a seasoned software engineer",
      "as a developer", "as a software engineer", "it is worth noting",
      "it is important to note", "leveraging my skills", "robust and scalable",
      "in today's", "here is a brief overview"
    ];

    for (const pat of aiPatterns) {
      if (lower.includes(pat)) {
        return `Detected AI-generated phrasing: "${pat}"`;
      }
    }

    const aiTransitions = ["furthermore", "moreover", "consequently", "nevertheless", "henceforth", "it is imperative", "subsequently"];
    let transitionCount = 0;
    for (const t of aiTransitions) {
      if (lower.includes(t)) transitionCount++;
    }
    if (transitionCount >= 2) {
      return "Overly formal robotic AI transition structure detected.";
    }

    return null;
  };

  const currentQ = questions[currentStep];
  const currentAnswer = currentQ ? (userAnswers[currentQ.id] || "") : "";
  const isPasted = currentQ ? !!pastedState[currentQ.id] : false;
  const wordCount = currentAnswer.trim().split(/\s+/).filter(Boolean).length;

  const detectedAiReason = checkIsAIGenerated(currentAnswer) || (isPasted ? "Copy-pasted text detected" : null);

  const handlePasteAnswer = (e) => {
    const pastedText = e.clipboardData ? e.clipboardData.getData('text') : '';
    if (pastedText && pastedText.trim().length > 25) {
      if (currentQ) {
        setPastedState((prev) => ({ ...prev, [currentQ.id]: true }));
      }
      setAiError('🚨 Copy-pasting text from ChatGPT/External sources is detected! Please click "Re-attempt Question" and respond in your own genuine words.');
    }
  };

  const handleNextQuestion = () => {
    if (detectedAiReason) {
      setAiError(`🚨 AI-Generated / Copy-Pasted Content Detected! (${detectedAiReason}). Please click 'Re-attempt Question' to answer in your own genuine words.`);
      return;
    }

    setAiError('');
    if (currentStep < questions.length - 1) {
      stopListening();
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevQuestion = () => {
    stopListening();
    setAiError('');
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReattempt = () => {
    stopListening();
    if (currentQ) {
      setUserAnswers((prev) => ({ ...prev, [currentQ.id]: "" }));
      setPastedState((prev) => ({ ...prev, [currentQ.id]: false }));
    }
    setAiError('');
  };

  const handleSubmitAssessment = async () => {
    if (detectedAiReason) {
      setAiError(`🚨 AI-Generated / Copy-Pasted Content Detected! (${detectedAiReason}). Please click 'Re-attempt Question' to answer in your own genuine words.`);
      return;
    }

    stopListening();
    setEvaluating(true);

    try {
      const answersPayload = questions.map((q) => ({
        question_id: q.id,
        answer_text: userAnswers[q.id] || "Brief response."
      }));

      const res = await API.post('/candidate/communication-assessment/submit', { answers: answersPayload });
      setResultData(res.data);
      if (onCompleted) {
        onCompleted(res.data);
      }
    } catch (err) {
      console.error("Failed to evaluate communication assessment", err);
      const errorMsg = err.response?.data?.detail || "Evaluation failed. Please try again.";
      setAiError(errorMsg);
    } finally {
      setEvaluating(false);
    }
  };

  const modalContent = (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="glass-card max-w-3xl w-full max-h-[92vh] rounded-3xl border border-blue-500/30 flex flex-col overflow-hidden shadow-2xl bg-slate-950 relative z-[10000]">

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              <MessageSquare className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">AI Communication Skill Test</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Required for 100% Profile
                </span>
              </div>
              <p className="text-xs text-slate-400">Assess your verbal fluency, terminology, and articulation score for recruiters</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-400 animate-spin" />
            <span>Loading 5 Communication Assessment Questions...</span>
          </div>
        ) : resultData ? (
          /* ── RESULT REPORT CARD VIEW ── */
          <div className="p-6 overflow-y-auto space-y-6 flex-grow">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-slate-900 border-2 border-blue-500/40 text-center space-y-4 shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" /> Profile Reached 100% Complete!
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Communication Score</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-black text-white">{resultData.communication_score}</span>
                  <span className="text-xl font-bold text-blue-400">/ 100</span>
                </div>
                <p className="text-base font-bold text-blue-300">{resultData.level_label}</p>
              </div>

              <p className="text-xs text-slate-300 max-w-lg mx-auto bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                {resultData.feedback}
              </p>
            </div>

            {/* Questions Evaluated Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-400" /> Per-Question Performance Breakdown
              </h4>

              <div className="space-y-3">
                {resultData.evaluated_questions?.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-300">Q{idx + 1}: {q.category}</span>
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                        {q.score} / 100 pts
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium">"{q.question}"</p>
                    <div className="p-2.5 rounded-xl bg-slate-950 text-slate-400 italic">
                      Your Response: "{q.answer_text}"
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition"
              >
                Close &amp; View Updated 100% Profile
              </button>
            </div>
          </div>
        ) : evaluating ? (
          /* ── EVALUATING STATE ── */
          <div className="py-24 text-center text-slate-300 flex flex-col items-center gap-4">
            <Sparkles className="w-10 h-10 text-blue-400 animate-spin" />
            <h4 className="text-lg font-bold text-white">Evaluating Verbal Fluency &amp; Communication Level...</h4>
            <p className="text-xs text-slate-400 max-w-sm">Analyzing vocabulary, articulation, sentence structure, and clarity across your 5 responses...</p>
          </div>
        ) : (
          /* ── QUESTION STEP VIEW ── */
          <div className="p-6 overflow-y-auto space-y-6 flex-grow flex flex-col justify-between">
            
            <div className="space-y-5">
              {/* Progress Bar & Step Counter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-400 uppercase tracking-wider">
                    Question {currentStep + 1} of {questions.length}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Category: {currentQ?.category}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
                  Candidate Communication Prompt
                </span>
                <h4 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                  {currentQ?.question}
                </h4>
                <p className="text-[11px] text-slate-400 pt-1">
                  💡 <em>Evaluates: {currentQ?.eval_criteria}</em>
                </p>
              </div>

              {/* AI Content Detection Warning Banner */}
              {(aiError || detectedAiReason) && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-200 text-xs space-y-3 shadow-lg animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-rose-300 text-sm">🚨 AI-Generated / Copy-Paste Detected!</p>
                      <p className="text-rose-200/90 mt-1 leading-relaxed">
                        {aiError || `Detected AI/Copy-Pasted content (${detectedAiReason}). You cannot proceed with AI-generated text. Please click 'Re-attempt Question' to speak or type naturally.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleReattempt}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-md"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> 🔄 Re-attempt Question
                    </button>
                  </div>
                </div>
              )}

              {/* Answer Input Area (Text or Voice) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-blue-400" /> Voice Response Only (Microphone Active)
                  </label>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-center">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2.5 transition shadow-lg ${
                        isListening 
                          ? 'bg-rose-600 hover:bg-rose-500 text-white border-2 border-rose-400 animate-pulse shadow-rose-500/30' 
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-5 h-5 text-white" />
                          <span>🎙️ Listening... Speak Your Answer Now</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5 text-amber-300" />
                          <span>🎤 Start Voice Answer Recording</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Recorded Voice Transcript Display (Read-Only) */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left min-h-[90px]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Live Voice Speech Transcript:
                    </span>
                    {currentAnswer ? (
                      <p className="text-xs sm:text-sm text-slate-100 leading-relaxed italic">
                        "{currentAnswer}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        Click "Start Voice Answer Recording" above and speak clearly into your microphone...
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Aim for 30–60+ spoken words for maximum communication score</span>
                  <span className="font-mono font-bold text-slate-300">{wordCount} words recorded</span>
                </div>
              </div>
            </div>


            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentStep === 0}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 transition disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              {currentStep < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={!currentAnswer.trim() || !!detectedAiReason || !!aiError}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition disabled:opacity-40 shadow-lg shadow-blue-500/20"
                >
                  Next Question <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitAssessment}
                  disabled={!currentAnswer.trim() || !!detectedAiReason || !!aiError || evaluating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 transition disabled:opacity-40 shadow-lg shadow-emerald-500/20"
                >
                  <Award className="w-4 h-4" /> Submit &amp; Complete 100% Profile
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
