import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { examService } from "../services/examService";
import { attemptService } from "../services/attemptService";
import { Loader } from "../components/ui/Loader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { formatSeconds } from "../utils/time";
import { AttemptAnswer, Question, Subject } from "../types";

export function getSubjectTimingStatus(subject: any) {
  if (!subject || !subject.startDate || !subject.startTime) {
    return { status: "available" as const, message: "🔓 Available" };
  }

  try {
    const now = new Date();
    const startStr = `${subject.startDate.split("T")[0]}T${subject.startTime}`;
    const start = new Date(startStr);

    if (now < start) {
      const formattedStart = start.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      return { 
        status: "locked" as const, 
        message: `🔒 Locked until ${formattedStart}` 
      };
    }

    if (subject.endDate && subject.endTime) {
      const endStr = `${subject.endDate.split("T")[0]}T${subject.endTime}`;
      const end = new Date(endStr);
      if (now > end) {
        return { status: "expired" as const, message: "❌ Closed / Expired" };
      }
    }

    return { status: "available" as const, message: "🔓 Available" };
  } catch (err) {
    return { status: "available" as const, message: "🔓 Available" };
  }
}

export function AttemptExamPage() {
  const { examId = "" } = useParams();
  const navigate = useNavigate();
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AttemptAnswer>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [subjectRemaining, setSubjectRemaining] = useState<Record<string, number>>({});
  const [violations, setViolations] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);

  const examQuery = useQuery({
    queryKey: ["attempt-exam", examId],
    queryFn: () => examService.getById(examId)
  });

  const startMutation = useMutation({ mutationFn: () => attemptService.start(examId) });
  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => attemptService.save(examId, payload)
  });
  const submitMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => attemptService.submit(examId, payload),
    onSuccess: (data) => navigate(`/results/${data.result._id}`)
  });
  const violationMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => attemptService.violation(examId, payload)
  });

  useEffect(() => {
    if (examId) {
      startMutation.mutate();
    }
    // The mutation instance is stable for the lifecycle of this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const exam = examQuery.data?.exam;
  const attempt = startMutation.data?.attempt;

  useEffect(() => {
    if (!attempt || !exam) return;

    setCurrentSubjectIndex(attempt.snapshot.currentSubjectIndex);
    setCurrentQuestionIndex(attempt.snapshot.currentQuestionIndex);
    setRemainingSeconds(attempt.snapshot.remainingSeconds);
    setSubjectRemaining(attempt.snapshot.subjectRemainingSeconds);

    const mapped = Object.fromEntries(
      attempt.answers.map((answer: AttemptAnswer) => [answer.questionId, answer])
    );
    setAnswers(mapped);
    setViolations(attempt.violationsCount);
  }, [attempt, exam]);

  useEffect(() => {
    if (!exam) return;
    if (remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((value) => value - 1);
      const activeSubject = exam.subjects[currentSubjectIndex];
      if (activeSubject?._id) {
        setSubjectRemaining((state) => ({
          ...state,
          [activeSubject._id!]: Math.max((state[activeSubject._id!] || 0) - 1, 0)
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [exam, remainingSeconds, currentSubjectIndex]);

  useEffect(() => {
    if (!exam?.security.disableRightClick) return;
    const handler = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, [exam?.security.disableRightClick]);

  useEffect(() => {
    if (!exam) return;

    const triggerViolation = (type: string) => {
      const next = violations + 1;
      setViolations(next);
      setWarning(type);
      violationMutation.mutate({ type, meta: { at: new Date().toISOString() } });
      if (next >= exam.security.violationLimit && exam.security.autoSubmitAfterViolations) {
        handleSubmit(true, next);
      }
    };

    const visibility = () => {
      if (document.hidden && exam.security.detectTabSwitching) triggerViolation("tab_switch");
    };
    const blur = () => {
      if (exam.security.detectMinimize) triggerViolation("window_blur");
    };
    const fullscreen = () => {
      if (exam.security.fullscreenEnforced && !document.fullscreenElement) triggerViolation("fullscreen_exit");
    };
    const copy = (event: Event) => {
      event.preventDefault();
      triggerViolation(event.type as "copy" | "paste");
    };

    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", blur);
    document.addEventListener("fullscreenchange", fullscreen);
    document.addEventListener("copy", copy);
    document.addEventListener("paste", copy);

    return () => {
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", blur);
      document.removeEventListener("fullscreenchange", fullscreen);
      document.removeEventListener("copy", copy);
      document.removeEventListener("paste", copy);
    };
    // These handlers intentionally use the latest render state from this session frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, violations]);

  useEffect(() => {
    if (!exam) return;
    const timer = setInterval(() => {
      const payload = buildPayload(false, violations);
      saveMutation.mutate(payload);
    }, 15000);

    return () => clearInterval(timer);
    // Autosave intentionally samples current attempt state on the active timer cadence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, answers, currentQuestionIndex, currentSubjectIndex, remainingSeconds, subjectRemaining, violations]);

  const activeSubject = exam?.subjects[currentSubjectIndex];
  const activeQuestion = activeSubject?.questions[currentQuestionIndex];
  const currentAnswer = activeQuestion ? answers[String(activeQuestion._id)] : undefined;

  const totalQuestions = useMemo(
    () => exam?.subjects.reduce((sum: number, subject: Subject) => sum + subject.questions.length, 0) || 0,
    [exam]
  );

  if (examQuery.isLoading || startMutation.isPending) return <Loader label="Preparing secure session..." />;
  if (!exam || !attempt) return null;

  async function enterFullscreen() {
    if (exam.security.fullscreenEnforced && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen().catch(() => undefined);
    }
  }

  function selectOption(optionIndex: number) {
    if (!activeQuestion || !activeSubject?._id) return;
    const timing = getSubjectTimingStatus(activeSubject);
    if (timing.status !== "available") return;
    setAnswers((state) => ({
      ...state,
      [String(activeQuestion._id)]: {
        subjectId: String(activeSubject._id),
        questionId: String(activeQuestion._id),
        selectedOption: optionIndex,
        markedForReview: state[String(activeQuestion._id)]?.markedForReview || false,
        timeSpentSeconds: state[String(activeQuestion._id)]?.timeSpentSeconds || 0
      }
    }));
  }

  function toggleReview() {
    if (!activeQuestion || !activeSubject?._id) return;
    const timing = getSubjectTimingStatus(activeSubject);
    if (timing.status !== "available") return;
    setAnswers((state) => ({
      ...state,
      [String(activeQuestion._id)]: {
        subjectId: String(activeSubject._id),
        questionId: String(activeQuestion._id),
        selectedOption: state[String(activeQuestion._id)]?.selectedOption,
        markedForReview: !state[String(activeQuestion._id)]?.markedForReview,
        timeSpentSeconds: state[String(activeQuestion._id)]?.timeSpentSeconds || 0
      }
    }));
  }

  function buildPayload(autoSubmitted: boolean, finalViolations: number) {
    return {
      answers: Object.values(answers),
      snapshot: {
        currentSubjectIndex,
        currentQuestionIndex,
        remainingSeconds,
        subjectRemainingSeconds: subjectRemaining
      },
      timeSpentSeconds: attempt.snapshot.remainingSeconds - remainingSeconds,
      violationsCount: finalViolations,
      isCheated: finalViolations > 0,
      autoSubmitted
    };
  }

  function handleSubmit(autoSubmitted = false, finalViolations = violations) {
    submitMutation.mutate(buildPayload(autoSubmitted, finalViolations));
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-cyan-300">Secure attempt</p>
          <h2 className="text-2xl font-bold text-white">{exam.title}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1">
            <Clock3 className="mr-2 inline h-4 w-4" />
            {formatSeconds(remainingSeconds)}
          </span>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1">
            <ShieldAlert className="mr-2 inline h-4 w-4" />
            {violations}/{exam.security.violationLimit}
          </span>
          <Button variant="secondary" onClick={enterFullscreen}>
            Enter fullscreen
          </Button>
          <Button variant="danger" onClick={() => handleSubmit(false, violations)}>
            Submit exam
          </Button>
        </div>
      </Card>

      {warning ? (
        <Card className="border-rose-400/20 bg-rose-500/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-300" />
            <div>
              <p className="font-semibold text-white">Violation detected: {warning.replace("_", " ")}</p>
              <p className="text-sm text-rose-200">
                This event has been logged. Exceeding the limit triggers automatic submission.
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">
                Subject {currentSubjectIndex + 1} of {exam.subjects.length}
              </p>
              <h3 className="text-2xl font-semibold text-white">{activeSubject?.title}</h3>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-300">
              Section time: {formatSeconds(subjectRemaining[String(activeSubject?._id)] || 0)}
            </div>
          </div>

          <p className="text-sm text-slate-300">{activeSubject?.instructions}</p>

          {(() => {
            const timing = getSubjectTimingStatus(activeSubject);
            if (timing.status !== "available") {
              return (
                <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center space-y-4">
                  <ShieldAlert className="mx-auto h-16 w-16 text-rose-400" />
                  <h4 className="text-2xl font-bold text-white">Section Timeline Locked</h4>
                  <p className="mx-auto max-w-md text-sm text-rose-200">
                    This subject section has scheduled timing boundaries and is not currently open for responses. 
                    You are currently {timing.status === "locked" ? "not allowed to start this section" : "past the deadline to answer questions in this section"}.
                  </p>
                  <div className="inline-block rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-slate-300 border border-white/10">
                    {timing.message}
                  </div>
                </div>
              );
            }

            return (
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <p className="text-sm text-slate-400">
                  Question {currentQuestionIndex + 1} of {activeSubject?.questions.length}
                </p>
                <h4 className="mt-3 text-xl font-semibold text-white">{activeQuestion?.prompt}</h4>
                <div className="mt-6 grid gap-3">
                  {activeQuestion?.options.map((option: string, optionIndex: number) => (
                    <button
                      key={optionIndex}
                      type="button"
                      onClick={() => selectOption(optionIndex)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        currentAnswer?.selectedOption === optionIndex
                          ? "border-cyan-400/60 bg-cyan-400/10 text-white"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                      }`}
                    >
                      <span className="font-semibold">{String.fromCharCode(65 + optionIndex)}.</span> {option}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="secondary"
              onClick={() => setCurrentQuestionIndex((value) => Math.max(value - 1, 0))}
            >
              Previous
            </Button>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={toggleReview}
                disabled={activeSubject ? getSubjectTimingStatus(activeSubject).status !== "available" : false}
              >
                {currentAnswer?.markedForReview ? "Unmark review" : "Mark for review"}
              </Button>
              <Button
                onClick={() => {
                  if (currentQuestionIndex < (activeSubject?.questions.length || 0) - 1) {
                    setCurrentQuestionIndex((value) => value + 1);
                    return;
                  }

                  if (currentSubjectIndex < exam.subjects.length - 1) {
                    setCurrentSubjectIndex((value) => value + 1);
                    setCurrentQuestionIndex(0);
                    return;
                  }

                  handleSubmit(false, violations);
                }}
              >
                {currentSubjectIndex === exam.subjects.length - 1 &&
                currentQuestionIndex === (activeSubject?.questions.length || 1) - 1
                  ? "Finish exam"
                  : "Next"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-lg font-semibold text-white">Question palette</p>
          <div className="grid gap-2">
            {exam.subjects.map((subject: Subject, subjectIndex: number) => (
              <div key={subject._id} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{subject.title}</span>
                  <span>{formatSeconds(subjectRemaining[String(subject._id)] || 0)}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {subject.questions.map((question: Question, questionIndex: number) => {
                    const answer = answers[String(question._id)];
                    const active =
                      subjectIndex === currentSubjectIndex && questionIndex === currentQuestionIndex;
                    return (
                      <button
                        key={question._id}
                        type="button"
                        onClick={() => {
                          setCurrentSubjectIndex(subjectIndex);
                          setCurrentQuestionIndex(questionIndex);
                        }}
                        className={`rounded-xl border px-3 py-2 text-xs ${
                          active
                            ? "border-cyan-400/60 bg-cyan-400/10 text-white"
                            : answer?.markedForReview
                              ? "border-amber-400/50 bg-amber-400/10 text-amber-200"
                              : answer?.selectedOption !== undefined
                                ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
                                : "border-white/10 bg-white/5 text-slate-400"
                        }`}
                      >
                        {questionIndex + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
            <p>Total questions: {totalQuestions}</p>
            <p className="mt-2">Answered: {Object.values(answers).filter((answer) => answer.selectedOption !== undefined).length}</p>
            <p className="mt-2">Review: {Object.values(answers).filter((answer) => answer.markedForReview).length}</p>
          </div>
          <Button className="w-full" onClick={() => handleSubmit(false, violations)}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Submit now
          </Button>
        </Card>
      </div>
    </div>
  );
}
