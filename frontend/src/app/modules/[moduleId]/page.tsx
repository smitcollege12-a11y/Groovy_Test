"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  position: number;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
}

interface AdaptivePathResponse {
  course_id: string;
  next_module_id: string | null;
  modules: { module_id: string; status: string; average_score: number | null }[];
}

export default function ModuleDetailPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const { user } = useAuth();
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [mastery, setMastery] = useState<{ status: string; score: number | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const moduleData = await apiFetch<Module>(`/api/v1/modules/${moduleId}`);
        setModule(moduleData);

        const [lessonsData, courseData] = await Promise.all([
          apiFetch<Lesson[]>(`/api/v1/modules/${moduleId}/lessons`),
          apiFetch<Course>(`/api/v1/courses/${moduleData.course_id}`),
        ]);
        setLessons(lessonsData);
        setCourse(courseData);

        if (user?.role === "student") {
          try {
            const path = await apiFetch<AdaptivePathResponse>(
              `/api/v1/courses/${moduleData.course_id}/adaptive-path`
            );
            const moduleMastery = path.modules.find((m) => m.module_id === moduleId);
            if (moduleMastery) {
              setMastery({ status: moduleMastery.status, score: moduleMastery.average_score });
            }
          } catch {
            // Skip
          }
        }
      } catch (err) {
        console.error("Failed to load module:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [moduleId, user]);

  const masteryColors: Record<string, string> = {
    mastered: "bg-green-500/10 text-green-500",
    needs_review: "bg-yellow-500/10 text-yellow-500",
    remedial: "bg-red-500/10 text-red-500",
    unattempted: "bg-muted text-muted-foreground",
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-48 rounded bg-muted" />
          <div className="h-8 w-96 rounded bg-muted" />
          <div className="space-y-3 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted" />
            ))}
          </div>
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

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/courses" className="hover:underline">Courses</Link>
        <span>/</span>
        <Link href={`/courses/${course.id}`} className="hover:underline">{course.title}</Link>
        <span>/</span>
        <span className="text-foreground">{module.title}</span>
      </nav>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold font-[var(--font-heading)]">{module.title}</h1>
          {module.description && (
            <p className="mt-2 text-muted-foreground">{module.description}</p>
          )}
        </div>
        {mastery && (
          <Badge className={masteryColors[mastery.status] || ""}>
            {mastery.status.replace("_", " ")}
            {mastery.score != null && ` · ${mastery.score}%`}
          </Badge>
        )}
      </div>

      <Separator className="my-6" />

      <h2 className="text-xl font-semibold font-[var(--font-heading)]">Lessons</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} in this module
      </p>

      {lessons.length === 0 ? (
        <Card className="mt-4 p-8 text-center">
          <p className="text-muted-foreground">No lessons available yet.</p>
        </Card>
      ) : (
        <div className="mt-4 space-y-2">
          {lessons
            .sort((a, b) => a.position - b.position)
            .map((lesson, idx) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-4 p-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium">{lesson.title}</h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
        </div>
      )}

      {user?.role === "student" && (
        <>
          <Separator className="my-6" />
          <div className="flex gap-3">
            <Button render={<Link href={`/modules/${moduleId}/quiz`} />}>
              Take Quiz
            </Button>
            {lessons.length > 0 && (
              <Button
                render={<Link href={`/lessons/${lessons.sort((a, b) => a.position - b.position)[0].id}`} />}
                variant="outline"
              >
                Start First Lesson
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}