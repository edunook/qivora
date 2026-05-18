import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { GlassCard } from '../components/ui/GlassCard'
import { PremiumButton } from '../components/ui/PremiumButton'
import { 
  Plus, CheckCircle2, Trash2, Loader2, 
  AlertCircle, Layers, ArrowLeft, FileText, Check
} from 'lucide-react'
import { useExamStore } from '../store/examStore'

interface ParsedQuestionLegacy {
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
  difficulty: string;
  marks: number;
  negativeMarks: number;
  error?: string;
}

export function parseBulkQuestionsTextLegacy(text: string): ParsedQuestionLegacy[] {
  const parsedList: ParsedQuestionLegacy[] = [];
  if (!text.trim()) return parsedList;

  const lines = text.split(/\r?\n/);
  let currentPrompt = "";
  let currentOptions: string[] = [];
  let currentAnswerText = "";

  const commitQuestion = () => {
    if (currentPrompt.trim()) {
      let cleanPrompt = currentPrompt.trim().replace(/^\d+[\.\)\:]\s*/i, "");
      
      const cleanOptions = currentOptions.map(opt => 
        opt.trim().replace(/^[A-D](?:\s*[\)\.\:\-]\s*|\s+)/i, "").replace(/^\([A-D]\)\s*/i, "")
      );

      while (cleanOptions.length < 4) {
        cleanOptions.push("");
      }
      const finalOptions = cleanOptions.slice(0, 4);

      let correctIndex = 0;
      let errorMsg = "";
      if (currentAnswerText) {
        const match = currentAnswerText.match(/\b([A-D])\b/i);
        if (match) {
          const letter = match[1].toUpperCase();
          correctIndex = letter.charCodeAt(0) - 65;
        } else {
          errorMsg = "Answer indicator (A, B, C, or D) not found";
        }
      } else {
        errorMsg = "Answer statement not found";
      }

      if (cleanOptions.filter(o => o.trim()).length < 4) {
        errorMsg = errorMsg ? `${errorMsg}, Missing options` : "Missing options (need exactly 4 options)";
      }

      parsedList.push({
        text: cleanPrompt,
        options: finalOptions,
        correctOption: correctIndex,
        explanation: "",
        difficulty: "Intermediate",
        marks: 1,
        negativeMarks: 0,
        ...(errorMsg ? { error: errorMsg } : {})
      });
    }

    currentPrompt = "";
    currentOptions = [];
    currentAnswerText = "";
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (/^(?:correct\s+)?answer\s*[\:\-]/i.test(line) || /^correct\s*[\:\-]/i.test(line) || /^ans\s*[\:\-]/i.test(line)) {
      currentAnswerText = line;
      commitQuestion();
      continue;
    }

    const isOption = /^[A-D](?:\s*[\)\.\:\-]\s*|\s+)/i.test(line) || /^\([A-D]\)/i.test(line);
    if (isOption) {
      currentOptions.push(line);
    } else {
      if (currentOptions.length > 0 && /^\d+[\.\)\:]\s*/i.test(line)) {
        commitQuestion();
        currentPrompt = line;
      } else if (currentOptions.length === 0) {
        currentPrompt = currentPrompt ? `${currentPrompt} ${line}` : line;
      } else {
        const lastOptIdx = currentOptions.length - 1;
        currentOptions[lastOptIdx] = `${currentOptions[lastOptIdx]} ${line}`;
      }
    }
  }

  commitQuestion();
  return parsedList;
}

export const ManageSubjects = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getExamById, currentExam, updateExam, isLoading, isSuccess, reset } = useExamStore()

  const [subjectsList, setSubjectsList] = useState<any[]>([])
  const [bulkModes, setBulkModes] = useState<{[subjId: number]: 'manual' | 'bulk'}>({})
  const [bulkTexts, setBulkTexts] = useState<{[subjId: number]: string}>({})
  const [showGuides, setShowGuides] = useState<{[subjId: number]: boolean}>({})

  useEffect(() => {
    if (id) {
      getExamById(id)
    }
  }, [id, getExamById])

  useEffect(() => {
    if (currentExam && currentExam.subjects && currentExam.subjects.length > 0) {
      setSubjectsList(currentExam.subjects.map((s, idx) => ({
        id: idx + 1,
        name: s.name || '',
        description: s.description || '',
        duration: s.duration || 15,
        totalMarks: s.totalMarks || 10,
        passingMarks: s.passingMarks || 5,
        instructions: s.instructions || '',
        startDate: s.startDate || '',
        startTime: s.startTime || '',
        endDate: s.endDate || '',
        endTime: s.endTime || '',
        questions: s.questions?.map((q: any, qIdx: number) => ({
          id: qIdx + 1,
          text: q.text || '',
          options: q.options || ['', '', '', ''],
          correctOption: q.correctOption || 0,
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'Intermediate',
          marks: q.marks || 1,
          negativeMarks: q.negativeMarks || 0,
          questionImage: q.questionImage || '',
          randomization: !!q.randomization
        })) || []
      })))
    } else if (currentExam) {
      // Default structure if empty
      setSubjectsList([{
        id: Date.now(),
        name: 'General Assessment',
        description: 'Main module',
        duration: 30,
        totalMarks: 10,
        passingMarks: 5,
        instructions: 'Please answer all questions carefully.',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        questions: [{
          id: Date.now() + 1,
          text: '',
          options: ['', '', '', ''],
          correctOption: 0,
          explanation: '',
          difficulty: 'Intermediate',
          marks: 1,
          negativeMarks: 0,
          questionImage: '',
          randomization: false
        }]
      }])
    }
  }, [currentExam])

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        reset()
        navigate('/dashboard')
      }, 1500)
    }
  }, [isSuccess, reset, navigate])

  const isResultDatePassed = currentExam?.resultsReleaseType === 'scheduled' && 
                             currentExam?.resultsReleaseDate && 
                             new Date(`${currentExam.resultsReleaseDate}T${currentExam.resultsReleaseTime || '00:00'}`) < new Date()

  // Subject Management Helpers
  const addSubject = () => {
    const newSubj = {
      id: Date.now(),
      name: `Subject ${subjectsList.length + 1}`,
      description: 'Add description here',
      duration: 15,
      totalMarks: 10,
      passingMarks: 5,
      instructions: 'Instructions here...',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      questions: [
        {
          id: Date.now() + 1,
          text: '',
          options: ['', '', '', ''],
          correctOption: 0,
          explanation: '',
          difficulty: 'Intermediate',
          marks: 1,
          negativeMarks: 0,
          questionImage: '',
          randomization: false
        }
      ]
    }
    setSubjectsList([...subjectsList, newSubj])
  }

  const updateSubjectField = (subId: number, field: string, val: any) => {
    setSubjectsList(subjectsList.map(s => s.id === subId ? { ...s, [field]: val } : s))
  }

  const removeSubject = (subId: number) => {
    if (subjectsList.length > 1) {
      setSubjectsList(subjectsList.filter(s => s.id !== subId))
    }
  }

  // Question Management Helpers
  const addQuestion = (subId: number) => {
    setSubjectsList(subjectsList.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          questions: [
            ...s.questions,
            {
              id: Date.now() + Math.random(),
              text: '',
              options: ['', '', '', ''],
              correctOption: 0,
              explanation: '',
              difficulty: 'Intermediate',
              marks: 1,
              negativeMarks: 0,
              questionImage: '',
              randomization: false
            }
          ]
        }
      }
      return s
    }))
  }

  const removeQuestion = (subId: number, qId: number) => {
    setSubjectsList(subjectsList.map(s => {
      if (s.id === subId && s.questions.length > 1) {
        return { ...s, questions: s.questions.filter((q: any) => q.id !== qId) }
      }
      return s
    }))
  }

  const updateQuestionField = (subId: number, qId: number, field: string, val: any) => {
    setSubjectsList(subjectsList.map(s => {
      if (s.id === subId) {
        const updatedQs = s.questions.map((q: any) => q.id === qId ? { ...q, [field]: val } : q)
        return { ...s, questions: updatedQs }
      }
      return s
    }))
  }

  const updateQuestionOption = (subId: number, qId: number, optIndex: number, val: string) => {
    setSubjectsList(subjectsList.map(s => {
      if (s.id === subId) {
        const updatedQs = s.questions.map((q: any) => {
          if (q.id === qId) {
            const newOptions = [...q.options]
            newOptions[optIndex] = val
            return { ...q, options: newOptions }
          }
          return q
        })
        return { ...s, questions: updatedQs }
      }
      return s
    }))
  }

  const commitBulkImport = (subId: number) => {
    const text = bulkTexts[subId] || "";
    if (!text.trim()) return;

    const parsed = parseBulkQuestionsTextLegacy(text);
    const validQuestions = parsed.filter(q => !q.error);

    if (validQuestions.length === 0) {
      alert("No valid questions found to import.");
      return;
    }

    setSubjectsList(subjectsList.map(s => {
      if (s.id === subId) {
        const newQs = validQuestions.map((q, idx) => ({
          id: Date.now() + Math.random() + idx,
          text: q.text,
          options: q.options,
          correctOption: q.correctOption,
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'Intermediate',
          marks: q.marks || 1,
          negativeMarks: q.negativeMarks || 0,
          questionImage: '',
          randomization: false
        }));
        return {
          ...s,
          questions: [...s.questions, ...newQs]
        };
      }
      return s;
    }));

    setBulkTexts({ ...bulkTexts, [subId]: "" });
    setBulkModes({ ...bulkModes, [subId]: "manual" });
  };

  const handleSave = async () => {
    if (!currentExam) return

    const formattedSubjects = subjectsList.map(s => ({
      name: s.name,
      description: s.description,
      duration: s.duration,
      totalMarks: s.totalMarks,
      passingMarks: s.passingMarks,
      instructions: s.instructions,
      startDate: s.startDate,
      startTime: s.startTime,
      endDate: s.endDate,
      endTime: s.endTime,
      questions: s.questions.map((q: any) => ({
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        difficulty: q.difficulty,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        questionImage: q.questionImage,
        randomization: q.randomization,
        subject: s.name
      }))
    }))

    const flatQuestions = formattedSubjects.flatMap(s => s.questions)
    const computedDuration = formattedSubjects.reduce((acc, curr) => acc + (curr.duration || 0), 0)

    const payload = {
      subjects: formattedSubjects,
      questions: flatQuestions,
      duration: computedDuration
    }

    await updateExam(currentExam._id, payload)
  }

  if (!currentExam) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl mb-32">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Layers className="text-indigo-400 w-6 h-6" /> Manage Subjects
          </h1>
          <p className="text-sm text-gray-400 mt-1">Configuring subjects for: <span className="text-indigo-300 font-bold">{currentExam.title}</span></p>
        </div>
      </div>

      {isSuccess && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="font-semibold text-sm">Subjects saved successfully! Returning to dashboard...</span>
        </motion.div>
      )}

      {isResultDatePassed && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>
            <strong>Subject Management Locked:</strong> The results release date has already passed. You can no longer add, edit, or delete subjects or questions to protect integrity.
          </span>
        </div>
      )}

      <div className="border-b border-white/10 pb-4 flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">Subject Architect</h3>
        <button
          type="button"
          disabled={isResultDatePassed || isLoading}
          onClick={addSubject}
          className="px-4 py-2 bg-indigo-600/50 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Subject Section
        </button>
      </div>

      <div className="space-y-8">
        {subjectsList.map((subj) => (
          <GlassCard key={subj.id} className="p-6 border-white/15 bg-white/[0.02]">
            {/* Subject Metadata Settings */}
            <div className="flex justify-between items-start gap-4 mb-4 border-b border-white/10 pb-4">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-indigo-300">Subject Name</label>
                    <input
                      type="text"
                      disabled={isResultDatePassed || isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50"
                      value={subj.name}
                      onChange={(e) => updateSubjectField(subj.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-indigo-300">Section Timer (Mins)</label>
                    <input
                      type="number"
                      disabled={isResultDatePassed || isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50"
                      value={subj.duration}
                      onChange={(e) => updateSubjectField(subj.id, 'duration', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-indigo-300">Total Marks</label>
                    <input
                      type="number"
                      disabled={isResultDatePassed || isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50"
                      value={subj.totalMarks}
                      onChange={(e) => updateSubjectField(subj.id, 'totalMarks', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-indigo-300">Passing Marks</label>
                    <input
                      type="number"
                      disabled={isResultDatePassed || isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50"
                      value={subj.passingMarks}
                      onChange={(e) => updateSubjectField(subj.id, 'passingMarks', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-indigo-300">Start Date</label>
                    <input
                      type="date"
                      disabled={isResultDatePassed || isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50"
                      value={subj.startDate || ''}
                      onChange={(e) => updateSubjectField(subj.id, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-indigo-300">Start Time</label>
                    <input
                      type="time"
                      disabled={isResultDatePassed || isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50"
                      value={subj.startTime || ''}
                      onChange={(e) => updateSubjectField(subj.id, 'startTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-indigo-300">End Date</label>
                    <input
                      type="date"
                      disabled={isResultDatePassed || isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50"
                      value={subj.endDate || ''}
                      onChange={(e) => updateSubjectField(subj.id, 'endDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-indigo-300">End Time</label>
                    <input
                      type="time"
                      disabled={isResultDatePassed || isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50"
                      value={subj.endTime || ''}
                      onChange={(e) => updateSubjectField(subj.id, 'endTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {subjectsList.length > 1 && (
                <button
                  type="button"
                  disabled={isResultDatePassed || isLoading}
                  onClick={() => removeSubject(subj.id)}
                  className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-white/10 self-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Subject Instructions */}
            <div className="space-y-1 text-left mb-6">
              <label className="text-[10px] uppercase font-bold text-indigo-300">Subject-Specific instructions</label>
              <input
                type="text"
                disabled={isResultDatePassed || isLoading}
                placeholder="e.g. This section covers Algebra and has no negative marking..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50"
                value={subj.instructions}
                onChange={(e) => updateSubjectField(subj.id, 'instructions', e.target.value)}
              />
            </div>

            {/* Question Builder inside Subject */}
            <div className="space-y-4">
              {/* Segmented Mode Selector Toggle */}
              <div className="flex items-center justify-between gap-4 flex-wrap bg-white/5 p-1.5 rounded-xl border border-white/10 mb-4">
                <div className="flex p-0.5 bg-black/40 rounded-lg border border-white/5 w-full max-w-[280px]">
                  <button
                    type="button"
                    onClick={() => setBulkModes({ ...bulkModes, [subj.id]: 'manual' })}
                    className={`flex items-center justify-center gap-2 flex-1 py-1 text-[11px] font-bold rounded-md transition-all duration-300 ${
                      (bulkModes[subj.id] || 'manual') === 'manual'
                        ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Manual Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkModes({ ...bulkModes, [subj.id]: 'bulk' })}
                    className={`flex items-center justify-center gap-2 flex-1 py-1 text-[11px] font-bold rounded-md transition-all duration-300 ${
                      bulkModes[subj.id] === 'bulk'
                        ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Bulk Import
                  </button>
                </div>
                <div className="text-[10px] uppercase font-bold text-gray-400">
                  {(bulkModes[subj.id] || 'manual') === 'manual'
                    ? `📝 ${subj.questions.length} questions`
                    : `⚡ Instantly parse bulk text`}
                </div>
              </div>

              {(bulkModes[subj.id] || 'manual') === 'manual' ? (
                <>
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Question List ({subj.questions.length})</h4>
                    <button
                      type="button"
                      disabled={isResultDatePassed || isLoading}
                      onClick={() => addQuestion(subj.id)}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] border border-white/10 font-bold transition-all flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-3 w-3" /> Add Question
                    </button>
                  </div>

                  {subj.questions.map((q: any, qIdx: number) => (
                    <div key={q.id} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2 text-left">
                          <label className="text-[10px] font-bold text-gray-400">Question {qIdx + 1}</label>
                          <textarea
                            disabled={isResultDatePassed || isLoading}
                            placeholder="Type question text..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none min-h-[60px] resize-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50"
                            value={q.text}
                            onChange={(e) => updateQuestionField(subj.id, q.id, 'text', e.target.value)}
                          />
                        </div>
                        {subj.questions.length > 1 && (
                          <button
                            type="button"
                            disabled={isResultDatePassed || isLoading}
                            onClick={() => removeQuestion(subj.id, q.id)}
                            className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-md border border-white/10 transition-all mt-6 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 text-left">
                          <label className="text-[10px] font-bold text-gray-400">Answer Options</label>
                          {q.options.map((opt: string, oIdx: number) => (
                            <div key={oIdx} className="flex items-center gap-3">
                              <input
                                type="radio"
                                disabled={isResultDatePassed || isLoading}
                                name={`correct-${subj.id}-${q.id}`}
                                checked={q.correctOption === oIdx}
                                onChange={() => updateQuestionField(subj.id, q.id, 'correctOption', oIdx)}
                                className="text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <input
                                type="text"
                                disabled={isResultDatePassed || isLoading}
                                placeholder={`Option ${oIdx + 1}`}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50"
                                value={opt}
                                onChange={(e) => updateQuestionOption(subj.id, q.id, oIdx, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] font-bold text-gray-400">Explanation (Optional)</label>
                            <textarea
                              disabled={isResultDatePassed || isLoading}
                              placeholder="Why is this answer correct?"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none min-h-[60px] resize-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50"
                              value={q.explanation}
                              onChange={(e) => updateQuestionField(subj.id, q.id, 'explanation', e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="space-y-1 flex-1 text-left">
                              <label className="text-[10px] font-bold text-gray-400">Difficulty</label>
                              <select
                                disabled={isResultDatePassed || isLoading}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50"
                                value={q.difficulty}
                                onChange={(e) => updateQuestionField(subj.id, q.id, 'difficulty', e.target.value)}
                              >
                                <option value="Beginner" className="bg-slate-900">Beginner</option>
                                <option value="Intermediate" className="bg-slate-900">Intermediate</option>
                                <option value="Advanced" className="bg-slate-900">Advanced</option>
                              </select>
                            </div>
                            <div className="space-y-1 flex-1 text-left">
                              <label className="text-[10px] font-bold text-gray-400">Marks</label>
                              <input
                                type="number"
                                disabled={isResultDatePassed || isLoading}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50"
                                value={q.marks}
                                onChange={(e) => updateQuestionField(subj.id, q.id, 'marks', Number(e.target.value))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 space-y-2 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-indigo-300 flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        Format Reference Guide
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowGuides({ ...showGuides, [subj.id]: !showGuides[subj.id] })}
                        className="text-[10px] text-gray-400 hover:text-white underline transition"
                      >
                        {showGuides[subj.id] ? 'Hide Template' : 'Show Template'}
                      </button>
                    </div>
                    {showGuides[subj.id] && (
                      <pre className="text-[10px] text-emerald-300 bg-black/40 p-3 rounded-lg border border-white/5 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`Which animal is the tallest in the world?
A) Elephant
B) Giraffe
C) Horse
D) Camel
Answer: B

What does "AI" stand for in technology?
A. Automated Internet
B. Artificial Intelligence
C. Advanced Interface
D. Automatic Information
Correct Answer: B`}
                      </pre>
                    )}
                  </div>

                  <div className="space-y-1 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] uppercase font-bold text-indigo-300">Paste Question Set:</label>
                      {(bulkTexts[subj.id] || "").trim() && (
                        <button
                          type="button"
                          onClick={() => setBulkTexts({ ...bulkTexts, [subj.id]: "" })}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={6}
                      value={bulkTexts[subj.id] || ""}
                      onChange={(e) => setBulkTexts({ ...bulkTexts, [subj.id]: e.target.value })}
                      placeholder="Paste questions here... Live parsing computes instantly below!"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none min-h-[120px] font-mono"
                    />
                  </div>

                  {/* Live Parsing Preview */}
                  {parseBulkQuestionsTextLegacy(bulkTexts[subj.id] || "").length > 0 && (() => {
                    const parsedList = parseBulkQuestionsTextLegacy(bulkTexts[subj.id] || "");
                    const validCount = parsedList.filter(q => !q.error).length;
                    const errorCount = parsedList.filter(q => q.error).length;

                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1 text-left">
                          <span className="text-[10px] font-bold text-white uppercase flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            Live Parsing Preview ({parsedList.length} items)
                          </span>
                          <span className="text-[10px] font-bold text-rose-400">
                            {errorCount} parsing errors
                          </span>
                        </div>

                        <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 text-left">
                          {parsedList.map((pq, pqIdx) => (
                            <div
                              key={pqIdx}
                              className={`p-3 rounded-lg border text-[11px] ${
                                pq.error 
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
                                  : 'bg-white/[0.02] border-white/10 text-gray-300'
                              }`}
                            >
                              <p className="font-semibold text-white">Q{pqIdx + 1}: {pq.text || '[No prompt detected]'}</p>
                              <div className="mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-1 pl-2">
                                {pq.options.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className={`px-1.5 py-0.5 rounded ${
                                      pq.correctOption === optIdx
                                        ? 'bg-indigo-600/30 text-indigo-300 font-bold'
                                        : 'text-gray-400'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIdx)}: {opt || '[Empty]'}
                                  </div>
                                ))}
                              </div>
                              {pq.error && (
                                <p className="mt-1 text-rose-400 text-[10px] font-semibold">
                                  ⚠️ {pq.error}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBulkTexts({ ...bulkTexts, [subj.id]: "" });
                              setBulkModes({ ...bulkModes, [subj.id]: "manual" });
                            }}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-all border border-white/10"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => commitBulkImport(subj.id)}
                            disabled={validCount === 0}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Confirm Import ({validCount} items)
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <PremiumButton 
          onClick={handleSave} 
          disabled={isLoading || isResultDatePassed}
          className="px-8 py-3 w-full sm:w-auto text-sm"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Subjects...</>
          ) : (
            'Save Subject Configurations'
          )}
        </PremiumButton>
      </div>
    </div>
  )
}
