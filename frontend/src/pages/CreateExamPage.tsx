import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Plus, Trash2, FileText, CheckCircle, AlertCircle, PenTool, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { examService } from "../services/examService";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { useToastStore } from "../stores/toastStore";

const questionSchema = z.object({
  prompt: z.string().min(3),
  imageUrl: z.string().optional().default(""),
  options: z.array(z.string().min(1)).length(4),
  correctAnswer: z.coerce.number().min(0).max(3),
  explanation: z.string().default(""),
  difficulty: z.enum(["easy", "medium", "hard"]),
  marks: z.coerce.number().min(1),
  negativeMarks: z.coerce.number().min(0)
});

const subjectSchema = z.object({
  title: z.string().min(2),
  instructions: z.string().default(""),
  durationMinutes: z.coerce.number().min(1),
  passingMarks: z.coerce.number().min(0),
  totalMarks: z.coerce.number().min(1),
  quizSections: z.array(z.string()).default([]),
  startDate: z.string().optional().default(""),
  startTime: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  endTime: z.string().optional().default(""),
  questions: z.array(questionSchema).min(1)
});

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  instructions: z.string().default(""),
  banner: z.string().default(""),
  thumbnail: z.string().default(""),
  category: z.string().min(2),
  visibility: z.enum(["public", "private"]),
  organization: z.string().default(""),
  tags: z.string().default(""),
  schedule: z.object({
    examDate: z.string().default(""),
    startTime: z.string().default(""),
    endTime: z.string().default(""),
    resultReleaseDate: z.string().default(""),
    resultReleaseTime: z.string().default(""),
    releaseMode: z.enum(["instant", "scheduled", "manual"])
  }),
  security: z.object({
    fullscreenEnforced: z.boolean(),
    detectTabSwitching: z.boolean(),
    detectMinimize: z.boolean(),
    disableCopy: z.boolean(),
    disablePaste: z.boolean(),
    disableRightClick: z.boolean(),
    autoSubmitAfterViolations: z.boolean(),
    violationLimit: z.coerce.number().min(1).max(10)
  }),
  resultConfig: z.object({
    resultType: z.enum(["percentage", "grade", "gpa", "ranking", "pass_fail"]),
    themeName: z.string(),
    showRanks: z.boolean(),
    showPercentage: z.boolean(),
    showAnswers: z.boolean(),
    showExplanations: z.boolean(),
    downloadPdf: z.boolean(),
    printable: z.boolean(),
    theme: z.object({
      primary: z.string(),
      secondary: z.string(),
      surface: z.string(),
      text: z.string(),
      typography: z.string(),
      layout: z.string()
    })
  }),
  subjects: z.array(subjectSchema).min(1)
});

type Values = z.infer<typeof schema>;

interface ParsedQuestion {
  prompt: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  negativeMarks: number;
  error?: string;
}

export function parseBulkQuestionsText(text: string): ParsedQuestion[] {
  const parsedList: ParsedQuestion[] = [];
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
        prompt: cleanPrompt,
        options: finalOptions,
        correctAnswer: correctIndex,
        explanation: "",
        difficulty: "medium",
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

export function CreateExamPage() {
  const navigate = useNavigate();
  const pushToast = useToastStore((state) => state.push);
  const form = useForm<Values>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      visibility: "public",
      organization: "",
      tags: "engineering, aptitude",
      schedule: {
        examDate: "",
        startTime: "",
        endTime: "",
        resultReleaseDate: "",
        resultReleaseTime: "",
        releaseMode: "instant"
      },
      security: {
        fullscreenEnforced: true,
        detectTabSwitching: true,
        detectMinimize: true,
        disableCopy: true,
        disablePaste: true,
        disableRightClick: true,
        autoSubmitAfterViolations: true,
        violationLimit: 3
      },
      resultConfig: {
        resultType: "percentage",
        themeName: "Aurora",
        showRanks: true,
        showPercentage: true,
        showAnswers: true,
        showExplanations: true,
        downloadPdf: true,
        printable: true,
        theme: {
          primary: "#7c3aed",
          secondary: "#06b6d4",
          surface: "#0f172a",
          text: "#e2e8f0",
          typography: "Space Grotesk",
          layout: "cards"
        }
      },
      subjects: [
        {
          title: "Logical Reasoning",
          instructions: "Answer carefully. Negative marking applies where configured.",
          durationMinutes: 30,
          passingMarks: 15,
          totalMarks: 30,
          quizSections: ["Part A"],
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
          questions: [
            {
              prompt: "Which option best completes the analogy?",
              imageUrl: "",
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: 0,
              explanation: "This is a sample explanation.",
              difficulty: "medium",
              marks: 2,
              negativeMarks: 0.5
            }
          ]
        }
      ]
    }
  });

  const subjectsFieldArray = useFieldArray({ control: form.control, name: "subjects" });

  const mutation = useMutation({
    mutationFn: (values: Values) =>
      examService.create({
        ...values,
        tags: values.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      }),
    onSuccess: (data) => {
      pushToast({ title: "Exam created", description: "Your examination workflow is live." });
      navigate(`/exams/${data.exam._id}`);
    }
  });

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
      <Card className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Exam Builder</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Exam title" {...form.register("title")} />
          <Input placeholder="Category" {...form.register("category")} />
          <Input placeholder="Banner URL" {...form.register("banner")} />
          <Input placeholder="Thumbnail URL" {...form.register("thumbnail")} />
          <Input placeholder="Organization label" {...form.register("organization")} />
          <Input placeholder="Tags (comma separated)" {...form.register("tags")} />
        </div>
        <Textarea rows={4} placeholder="Description" {...form.register("description")} />
        <Textarea rows={4} placeholder="Instructions" {...form.register("instructions")} />
        <div className="grid gap-4 md:grid-cols-3">
          <Select {...form.register("visibility")}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </Select>
          <Input type="date" {...form.register("schedule.examDate")} />
          <Select {...form.register("schedule.releaseMode")}>
            <option value="instant">Instant results</option>
            <option value="scheduled">Scheduled results</option>
            <option value="manual">Manual publishing</option>
          </Select>
          <Input type="time" {...form.register("schedule.startTime")} />
          <Input type="time" {...form.register("schedule.endTime")} />
          <Input type="date" {...form.register("schedule.resultReleaseDate")} />
          <Input type="time" {...form.register("schedule.resultReleaseTime")} />
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Security settings</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["security.fullscreenEnforced", "Fullscreen enforcement"],
            ["security.detectTabSwitching", "Detect tab switching"],
            ["security.detectMinimize", "Detect minimize"],
            ["security.disableCopy", "Disable copy"],
            ["security.disablePaste", "Disable paste"],
            ["security.disableRightClick", "Disable right click"],
            ["security.autoSubmitAfterViolations", "Auto submit after limit"],
            ["resultConfig.showAnswers", "Show answers in result"]
          ].map(([path, label]) => (
            <label key={path} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200">
              <input type="checkbox" className="mr-3" {...form.register(path as any)} />
              {label}
            </label>
          ))}
        </div>
        <Input type="number" min={1} max={10} {...form.register("security.violationLimit")} />
      </Card>

      {subjectsFieldArray.fields.map((subjectField, subjectIndex) => (
        <SubjectEditor
          key={subjectField.id}
          index={subjectIndex}
          remove={() => subjectsFieldArray.remove(subjectIndex)}
          control={form.control}
          register={form.register}
        />
      ))}

      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          subjectsFieldArray.append({
            title: "New Subject",
            instructions: "",
            durationMinutes: 20,
            passingMarks: 10,
            totalMarks: 20,
            quizSections: ["Part A"],
            startDate: "",
            startTime: "",
            endDate: "",
            endTime: "",
            questions: [
              {
                prompt: "",
                imageUrl: "",
                options: ["", "", "", ""],
                correctAnswer: 0,
                explanation: "",
                difficulty: "easy",
                marks: 1,
                negativeMarks: 0
              }
            ]
          })
        }
      >
        <Plus className="mr-2 h-4 w-4" />
        Add subject
      </Button>

      <Button className="w-full" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Publishing exam..." : "Publish exam"}
      </Button>
    </form>
  );
}

function SubjectEditor({ index, remove, control, register }: any) {
  const questions = useFieldArray({ control, name: `subjects.${index}.questions` });
  const [mode, setMode] = useState<"manual" | "bulk">("manual");
  const [bulkText, setBulkText] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  const handleTextChange = (text: string) => {
    setBulkText(text);
    const parsed = parseBulkQuestionsText(text);
    setParsedQuestions(parsed);
  };

  const removeParsedQuestion = (parsedIdx: number) => {
    setParsedQuestions(prev => prev.filter((_, idx) => idx !== parsedIdx));
  };

  const commitImport = () => {
    if (parsedQuestions.length === 0) return;
    const hasErrors = parsedQuestions.some(q => q.error);
    const validQuestions = parsedQuestions.filter(q => !q.error);

    if (validQuestions.length === 0) {
      alert("No valid questions found to import.");
      return;
    }

    validQuestions.forEach(q => {
      questions.append({
        prompt: q.prompt,
        imageUrl: "",
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
        difficulty: q.difficulty,
        marks: q.marks,
        negativeMarks: q.negativeMarks
      });
    });

    setBulkText("");
    setParsedQuestions([]);
    setMode("manual");
  };

  const clearAllParsed = () => {
    setBulkText("");
    setParsedQuestions([]);
  };

  return (
    <Card className="space-y-6 border border-white/10 bg-slate-900/50 p-6 rounded-[32px] backdrop-blur-md shadow-2xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-wide">Subject {index + 1}</h3>
          <p className="text-xs text-slate-400 mt-1">Configure subjects, schedules, and MCQ papers</p>
        </div>
        <Button variant="ghost" onClick={remove} type="button" className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Input placeholder="Subject title" {...register(`subjects.${index}.title`)} />
        <Input type="number" placeholder="Duration (minutes)" {...register(`subjects.${index}.durationMinutes`)} />
        <Input type="number" placeholder="Passing marks" {...register(`subjects.${index}.passingMarks`)} />
        <Input type="number" placeholder="Total marks" {...register(`subjects.${index}.totalMarks`)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
        <div>
          <label className="text-xs text-slate-400 block mb-1 font-medium">Start Date</label>
          <Input type="date" {...register(`subjects.${index}.startDate`)} />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1 font-medium">Start Time</label>
          <Input type="time" {...register(`subjects.${index}.startTime`)} />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1 font-medium">End Date</label>
          <Input type="date" {...register(`subjects.${index}.endDate`)} />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1 font-medium">End Time</label>
          <Input type="time" {...register(`subjects.${index}.endTime`)} />
        </div>
      </div>

      <Textarea rows={2} placeholder="Subject instructions (shown in lobby)" {...register(`subjects.${index}.instructions`)} />

      {/* Segmented Mode Selector Toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-950/60 p-2 rounded-2xl border border-white/10">
        <div className="flex p-1 bg-slate-950 rounded-xl border border-white/5 w-full max-w-[280px]">
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex items-center justify-center gap-2 flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
              mode === "manual"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <PenTool className="h-3.5 w-3.5" />
            Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setMode("bulk")}
            className={`flex items-center justify-center gap-2 flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
              mode === "bulk"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Bulk Import
          </button>
        </div>
        <div className="text-xs text-slate-400">
          {mode === "manual" 
            ? `📝 ${questions.fields.length} questions in subject` 
            : `⚡ Instantly parse hundreds of questions`}
        </div>
      </div>

      {mode === "manual" ? (
        <div className="space-y-4">
          <div className="space-y-4">
            {questions.fields.map((questionField, questionIndex) => (
              <div key={questionField.id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 relative group hover:border-white/20 transition-all duration-300">
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => questions.remove(questionIndex)}
                    className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-4">
                  <div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Question {questionIndex + 1}</span>
                    <Input placeholder="Question prompt" className="mt-2" {...register(`subjects.${index}.questions.${questionIndex}.prompt`)} />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[0, 1, 2, 3].map((optionIndex) => (
                      <div key={optionIndex} className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-bold text-slate-500">{String.fromCharCode(65 + optionIndex)}</span>
                        <Input
                          placeholder={`Option ${optionIndex + 1}`}
                          className="pl-8"
                          {...register(`subjects.${index}.questions.${questionIndex}.options.${optionIndex}`)}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-3 md:grid-cols-4 bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-medium">Correct Index (0-3)</label>
                      <Input type="number" min={0} max={3} {...register(`subjects.${index}.questions.${questionIndex}.correctAnswer`)} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-medium">Difficulty</label>
                      <Select {...register(`subjects.${index}.questions.${questionIndex}.difficulty`)}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-medium">Marks</label>
                      <Input type="number" {...register(`subjects.${index}.questions.${questionIndex}.marks`)} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-medium">Negative Marks</label>
                      <Input type="number" step="0.25" {...register(`subjects.${index}.questions.${questionIndex}.negativeMarks`)} />
                    </div>
                  </div>
                  <Textarea rows={2} placeholder="Explanation/Hint for correct answer" {...register(`subjects.${index}.questions.${questionIndex}.explanation`)} />
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full border-dashed border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-slate-300 hover:text-cyan-300 py-6"
            onClick={() =>
              questions.append({
                prompt: "",
                imageUrl: "",
                options: ["", "", "", ""],
                correctAnswer: 0,
                explanation: "",
                difficulty: "easy",
                marks: 1,
                negativeMarks: 0
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Question manually
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                Format Guide & supported options
              </span>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-xs text-slate-400 hover:text-white underline transition"
              >
                {showGuide ? "Hide example" : "Show example"}
              </button>
            </div>
            {showGuide && (
              <pre className="text-xs text-emerald-300 bg-slate-950 p-4 rounded-xl border border-white/5 overflow-x-auto whitespace-pre-wrap leading-relaxed">
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

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-slate-300 font-semibold">Paste raw questions text here:</label>
              {bulkText && (
                <button
                  type="button"
                  onClick={clearAllParsed}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <textarea
              rows={8}
              value={bulkText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste questions here... The parser runs live instantly!"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none font-mono scrollbar-thin"
            />
          </div>

          {/* Live parsing status */}
          {parsedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  Live Preview ({parsedQuestions.length} parsed)
                </h4>
                <span className="text-xs text-slate-400">
                  {parsedQuestions.filter(q => q.error).length} errors found
                </span>
              </div>

              <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {parsedQuestions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className={`rounded-2xl border p-4 text-xs relative ${
                      q.error 
                        ? "border-rose-500/20 bg-rose-500/5" 
                        : "border-white/5 bg-slate-950/40"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => removeParsedQuestion(qIdx)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    
                    <div className="flex items-start gap-2 max-w-[90%]">
                      {q.error ? (
                        <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      )}
                      <div className="w-full">
                        <p className="font-semibold text-white">Q{qIdx + 1}: {q.prompt || "[Empty Prompt]"}</p>
                        <div className="mt-2 grid gap-1.5 md:grid-cols-2 pl-2">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = q.correctAnswer === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={`px-2 py-1 rounded-lg ${
                                  isCorrect 
                                    ? "bg-cyan-500/10 text-cyan-300 font-medium border border-cyan-500/20" 
                                    : "text-slate-400"
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}: {opt || "[Empty option]"}
                              </div>
                            );
                          })}
                        </div>
                        {q.error && (
                          <p className="mt-2 text-rose-400 font-medium flex items-center gap-1">
                            ⚠️ {q.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={clearAllParsed}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={commitImport}
                  disabled={parsedQuestions.length === 0}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Import ({parsedQuestions.filter(q => !q.error).length} items)
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
