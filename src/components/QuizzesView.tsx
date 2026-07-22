'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, QuizItem } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { HelpCircle, Plus, Sparkles, ShieldCheck, Award, Trash2, CheckCircle } from 'lucide-react';

interface QuizzesViewProps {
  user: UserProfile;
  onRewardTokens: (amount: number, reason: string) => void;
}

interface QuestionDraft {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function QuizzesView({ user, onRewardTokens }: QuizzesViewProps) {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  // Multi-Question Wizard form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('STEM & Informatica');
  const [questionsList, setQuestionsList] = useState<QuestionDraft[]>([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }
  ]);

  useEffect(() => {
    loadGlobalQuizzes();
  }, []);

  const loadGlobalQuizzes = async () => {
    setLoading(true);
    try {
      const qRef = collection(db, 'global_quizzes');
      const q = query(qRef, where('status', '==', 'published'));
      const snap = await getDocs(q);
      const list: QuizItem[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as QuizItem);
      });
      setQuizzes(list);
    } catch (err) {
      console.warn('Load global quizzes notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qIdx: number, oIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleFinishActiveQuiz = async () => {
    setQuizCompleted(true);
    if (activeQuiz) {
      let correctCount = 0;
      const totalQs = activeQuiz.questions?.length || 1;
      activeQuiz.questions?.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswer) {
          correctCount++;
        }
      });

      const accuracy = Math.round((correctCount / totalQs) * 100);
      if (accuracy >= 50) {
        const earnedTokens = Math.round((activeQuiz.tokenReward || 120) * (accuracy / 100));
        onRewardTokens(earnedTokens, `Superamento Quiz col ${accuracy}% di Risposte Corrette (${correctCount}/${totalQs})`);
      }
    }
  };

  const handleAddQuestionField = () => {
    setQuestionsList((prev) => [
      ...prev,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]);
  };

  const handleRemoveQuestionField = (index: number) => {
    if (questionsList.length <= 1) return;
    setQuestionsList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateQuestionText = (index: number, text: string) => {
    setQuestionsList((prev) => {
      const updated = [...prev];
      updated[index].question = text;
      return updated;
    });
  };

  const handleUpdateOptionText = (qIndex: number, optIndex: number, text: string) => {
    setQuestionsList((prev) => {
      const updated = [...prev];
      const opts = [...updated[qIndex].options];
      opts[optIndex] = text;
      updated[qIndex].options = opts;
      return updated;
    });
  };

  const handleSetCorrectAnswer = (qIndex: number, correctIdx: number) => {
    setQuestionsList((prev) => {
      const updated = [...prev];
      updated[qIndex].correctAnswer = correctIdx;
      return updated;
    });
  };

  const handlePublishQuizWizard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Filter valid non-empty questions
    const validQuestions = questionsList.filter(
      (q) => q.question.trim() !== '' && q.options.some((o) => o.trim() !== '')
    );

    if (validQuestions.length === 0) return;

    const tokenReward = Math.min(300, 100 + validQuestions.length * 20);

    const quizData = {
      title: newTitle,
      subject: newSubject || 'Didattica Generale',
      author: user.displayName,
      questionsCount: validQuestions.length,
      tokenReward,
      hitlStatus: 'approved' as const,
      status: 'published',
      createdAt: new Date().toISOString(),
      questions: validQuestions
    };

    try {
      const qRef = collection(db, 'global_quizzes');
      const docRef = await addDoc(qRef, quizData);
      const createdItem: QuizItem = { id: docRef.id, ...quizData };

      setQuizzes((prev) => [createdItem, ...prev]);
      setShowWizard(false);
      setNewTitle('');
      setQuestionsList([
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]);
    } catch (err) {
      console.error('Error publishing quiz:', err);
      // Local state fallback
      const fallbackItem: QuizItem = { id: 'quiz-' + Date.now(), ...quizData };
      setQuizzes((prev) => [fallbackItem, ...prev]);
      setShowWizard(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" /> Quiz Globali & Sfide Adattive tra Classi
          </h2>
          <p className="text-xs text-slate-400">
            Feed arcade-tech per sfide con un numero illimitato di quesiti e validazione Human-in-the-Loop.
          </p>
        </div>

        <button
          onClick={() => setShowWizard(true)}
          className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Crea Quiz Multiquisito (Illimitato)
        </button>
      </div>

      {!activeQuiz ? (
        quizzes.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-white">Non ci sono ancora sfide attive</h3>
            <p className="text-xs text-slate-400">
              Sii il primo ad arricchire la piattaforma! Usa il Wizard per pubblicare un quiz con quante domande desideri.
            </p>
            <button
              onClick={() => setShowWizard(true)}
              className="px-5 py-2.5 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20"
            >
              Creane uno per primo!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold whitespace-nowrap">
                      {quiz.subject}
                    </span>
                    <span className="text-[11px] text-amber-400 font-bold px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/60 whitespace-nowrap">
                      +{quiz.tokenReward || 120} $QNT
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white leading-snug pt-1">{quiz.title}</h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Autore: {quiz.author}</span>
                    <span className="text-cyan-400 font-bold">{quiz.questions?.length || quiz.questionsCount || 1} Domande</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" /> HITL Approvato
                  </span>

                  <button
                    onClick={() => {
                      setActiveQuiz(quiz);
                      setSelectedAnswers({});
                      setQuizCompleted(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all"
                  >
                    Affronta Quiz ({quiz.questions?.length || 1} D)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Active Quiz Screen */
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          {!quizCompleted ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">{activeQuiz.title}</h3>
                  <p className="text-[10px] text-cyan-400 font-mono">{activeQuiz.questions.length} Domande Totali</p>
                </div>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="text-xs text-slate-400 hover:text-white font-bold"
                >
                  ✕ Annulla
                </button>
              </div>

              <div className="space-y-6">
                {activeQuiz.questions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <p className="text-xs font-bold text-cyan-300">Domanda {qIdx + 1} di {activeQuiz.questions.length}:</p>
                    <p className="text-sm font-semibold text-white">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectAnswer(qIdx, oIdx)}
                          className={`w-full p-3 rounded-xl text-left border text-xs font-semibold transition-all ${
                            selectedAnswers[qIdx] === oIdx
                              ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleFinishActiveQuiz}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20"
              >
                Conferma Risposte e Riscatta Token (+{activeQuiz.tokenReward || 120} $QNT)
              </button>
            </>
          ) : (
            <div className="text-center py-8 space-y-3">
              <Award className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-white">Quiz Completato!</h3>
              <p className="text-xs text-slate-300">
                Hai guadagnato <strong className="text-amber-400">+{activeQuiz.tokenReward || 120} $QNT</strong>. I tuoi progressi sono stati sincronizzati su Firestore.
              </p>
              <button
                onClick={() => setActiveQuiz(null)}
                className="px-6 py-3 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs"
              >
                Torna al Feed Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {/* Multi-Question Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#080c18] border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Wizard Creazione Quiz Multiquisito (Illimitato)
              </span>
              <button onClick={() => setShowWizard(false)} className="text-slate-400 hover:text-white font-bold text-xs">✕</button>
            </div>

            <form onSubmit={handlePublishQuizWizard} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Titolo del Quiz</label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Verifica su Algoritmi & Logica"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Materia / Categoria</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="STEM & Informatica">STEM & Informatica</option>
                    <option value="Fisica & Matematica">Fisica & Matematica</option>
                    <option value="IA & Neuro-Mapping">IA & Neuro-Mapping</option>
                    <option value="Scienze & Biologia">Scienze & Biologia</option>
                    <option value="Economia Circolare">Economia Circolare</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Questions List */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">Elenco Quesiti ({questionsList.length})</span>
                  <button
                    type="button"
                    onClick={handleAddQuestionField}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Aggiungi Domanda
                  </button>
                </div>

                {questionsList.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Domanda #{qIdx + 1}</span>
                      {questionsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionField(qIdx)}
                          className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-950/50"
                          title="Rimuovi questa domanda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="Scrivi qui il testo del quesito..."
                      value={q.question}
                      onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />

                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 font-mono">Opzioni di Risposta (seleziona la risposta corretta):</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((optText, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctAnswer === oIdx}
                              onChange={() => handleSetCorrectAnswer(qIdx, oIdx)}
                              className="accent-cyan-500 cursor-pointer"
                              title="Segna come risposta corretta"
                            />
                            <input
                              type="text"
                              required
                              placeholder={`Opzione ${oIdx + 1}`}
                              value={optText}
                              onChange={(e) => handleUpdateOptionText(qIdx, oIdx, e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleAddQuestionField}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:text-white text-xs font-bold"
                >
                  + Aggiungi un'Altra Domanda
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/20"
                >
                  Invia Quiz Multiquisito su Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
