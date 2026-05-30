"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Lesson {
  id: string;
  title: string;
  content: string;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
}

interface Course {
  id: string;
  title: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export default function QuizPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const [module, setModule] = useState<Module | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const moduleData = await apiFetch<Module>(`/api/v1/modules/${moduleId}`);
        setModule(moduleData);

        const courseData = await apiFetch<Course>(`/api/v1/courses/${moduleData.course_id}`);
        setCourse(courseData);
      } catch (err) {
        console.error("Failed to load quiz:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [moduleId]);

  const generateQuestions = async () => {
    if (!module || !course) return;

    setGenerating(true);
    try {
      const lessons = await apiFetch<Lesson[]>(`/api/v1/modules/${moduleId}/lessons`);
      if (lessons.length === 0) return;

      const allQuestions: QuizQuestion[] = [];

      for (const lesson of lessons) {
        try {
          const data = await apiFetch<{ questions: { question: string; options: string[]; correctIndex: number }[] }>(
            `/api/v1/courses/${course.id}/quiz/generate`,
            {
              method: "POST",
              body: JSON.stringify({
                lesson_id: lesson.id,
                lesson_title: lesson.title,
                lesson_content: lesson.content,
                num_questions: 3,
              }),
            }
          );

          data.questions.forEach((q) => {
            allQuestions.push({
              id: allQuestions.length + 1,
              question: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
            });
          });
        } catch {
          // Skip failed lesson quiz generation
        }
      }

      setQuestions(allQuestions);
    } catch (err) {
      console.error("Failed to generate questions:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (questions.length === 0) return;

    setSubmitting(true);
    const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length;
    const total = questions.length;

    try {
      const result = await apiFetch<{ score: number }>(
        `/api/v1/modules/${moduleId}/quiz-attempts`,
        {
          method: "POST",
          body: JSON.stringify({ raw_score: correct, total_questions: total }),
        }
      );
      setScore(result.score);
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit quiz:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-48 rounded bg-muted" />
          <div className="h-8 w-96 rounded bg-muted" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!module || !course) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold font-[var(--font-heading)]">Module not found</h2>
          <Button render={<Link href="/courses" />} className="mt-4">
            Back to Courses
          </Button>
        </Card>
      </div>
    );
  }

  if (questions.length === 0 && !generating) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/courses" className="hover:underline">Courses</Link>
          <span>/</span>
          <Link href={`/courses/${course.id}`} className="hover:underline">{course.title}</Link>
          <span>/</span>
          <Link href={`/modules/${module.id}`} className="hover:underline">{module.title}</Link>
          <span>/</span>
          <span className="text-foreground">Quiz</span>
        </nav>

        <Card className="mt-6 p-12 text-center">
          <h2 className="text-xl font-semibold font-[var(--font-heading)]">Generate Quiz</h2>
          <p className="mt-2 text-muted-foreground">
            AI will generate questions based on the lesson content in this module.
          </p>
          <Button onClick={generateQuestions} className="mt-4">
            Generate Questions
          </Button>
        </Card>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-48 rounded bg-muted" />
          <div className="h-8 w-96 rounded bg-muted" />
          <Card className="p-12 text-center">
            <p className="animate-pulse text-muted-foreground">Generating questions with AI...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (submitted && score !== null) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-semibold font-[var(--font-heading)]">Quiz Complete!</h2>
          <div className="mt-6">
            <span className="text-5xl font-bold">{Math.round(score)}%</span>
            <p className="mt-2 text-muted-foreground">
              {score >= 85
                ? "Excellent! You've mastered this module."
                : score >= 60
                  ? "Good effort! A review is recommended."
                  : "Keep studying and try again."}
            </p>
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <Button render={<Link href={`/modules/${moduleId}`} />}>
              Back to Module
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setScore(null);
                setAnswers({});
                setQuestions([]);
              }}
            >
              Retake Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/courses" className="hover:underline">Courses</Link>
        <span>/</span>
        <Link href={`/courses/${course.id}`} className="hover:underline">{course.title}</Link>
        <span>/</span>
        <Link href={`/modules/${module.id}`} className="hover:underline">{module.title}</Link>
        <span>/</span>
        <span className="text-foreground">Quiz</span>
      </nav>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold font-[var(--font-heading)]">Module Quiz</h1>
        <Badge variant="outline">
          {answeredCount}/{questions.length} answered
        </Badge>
      </div>

      <Separator className="my-6" />

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <Card key={q.id} className="p-5">
            <p className="font-medium">
              {idx + 1}. {q.question}
            </p>
            <RadioGroup
              className="mt-3 space-y-2"
              value={answers[q.id]?.toString()}
              onValueChange={(val) => handleAnswer(q.id, parseInt(val))}
            >
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <RadioGroupItem value={optIdx.toString()} id={`q${q.id}-o${optIdx}`} />
                  <Label htmlFor={`q${q.id}-o${optIdx}`} className="cursor-pointer text-sm">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSubmit} disabled={submitting || answeredCount < questions.length}>
          {submitting ? "Submitting..." : "Submit Quiz"}
        </Button>
      </div>
    </div>
  );
}