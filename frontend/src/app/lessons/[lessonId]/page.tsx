"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  position: number;
  created_at: string;
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

interface SiblingLesson {
  id: string;
  title: string;
  position: number;
}

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [siblings, setSiblings] = useState<SiblingLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const lessonData = await apiFetch<Lesson>(`/api/v1/lessons/${lessonId}`);
        setLesson(lessonData);

        const [moduleData, siblingsData] = await Promise.all([
          apiFetch<Module>(`/api/v1/modules/${lessonData.module_id}`),
          apiFetch<SiblingLesson[]>(`/api/v1/modules/${lessonData.module_id}/lessons`),
        ]);
        setModule(moduleData);
        setSiblings(siblingsData.sort((a, b) => a.position - b.position));

        const courseData = await apiFetch<Course>(`/api/v1/courses/${moduleData.course_id}`);
        setCourse(courseData);
      } catch (err) {
        console.error("Failed to load lesson:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-64 rounded bg-muted" />
          <div className="h-8 w-96 rounded bg-muted" />
          <div className="h-64 w-full rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!lesson || !module || !course) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold font-[var(--font-heading)]">Lesson not found</h2>
          <Button render={<Link href="/courses" />} className="mt-4">
            Back to Courses
          </Button>
        </Card>
      </div>
    );
  }

  const currentIdx = siblings.findIndex((s) => s.id === lessonId);
  const prevLesson = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextLesson = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/courses" className="hover:underline">Courses</Link>
        <span>/</span>
        <Link href={`/courses/${course.id}`} className="hover:underline">{course.title}</Link>
        <span>/</span>
        <Link href={`/modules/${module.id}`} className="hover:underline">{module.title}</Link>
        <span>/</span>
        <span className="text-foreground">{lesson.title}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold font-[var(--font-heading)]">{lesson.title}</h1>

      <Separator className="my-6" />

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-base leading-relaxed">{lesson.content}</div>
      </article>

      <Separator className="my-8" />

      <div className="flex items-center justify-between">
        {prevLesson ? (
          <Button render={<Link href={`/lessons/${prevLesson.id}`} />} variant="outline">
            &larr; {prevLesson.title}
          </Button>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Button render={<Link href={`/lessons/${nextLesson.id}`} />}>
            {nextLesson.title} &rarr;
          </Button>
        ) : user?.role === "student" ? (
          <Button render={<Link href={`/modules/${module.id}/quiz`} />}>
            Take Quiz &rarr;
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}