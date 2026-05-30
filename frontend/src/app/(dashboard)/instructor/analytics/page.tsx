"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  position: number;
}

interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
}

interface QuizAttempt {
  id: string;
  student_id: string;
  module_id: string;
  raw_score: number;
  total_questions: number;
  score: number;
  created_at: string;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<Record<string, Enrollment[]>>({});
  const [courseModules, setCourseModules] = useState<Record<string, Module[]>>({});
  const [moduleAttempts, setModuleAttempts] = useState<Record<string, QuizAttempt[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const allCourses = await apiFetch<Course[]>("/api/v1/courses/");
        const myCourses = allCourses.filter((c) => c.instructor_id === user?.id);
        setCourses(myCourses);

        for (const course of myCourses) {
          try {
            const [enrollments, modules] = await Promise.all([
              apiFetch<Enrollment[]>(`/api/v1/enrollments?course_id=${course.id}`).catch(() => []),
              apiFetch<Module[]>(`/api/v1/courses/${course.id}/modules`),
            ]);
            setCourseEnrollments((prev) => ({ ...prev, [course.id]: enrollments }));
            setCourseModules((prev) => ({ ...prev, [course.id]: modules }));

            for (const mod of modules) {
              try {
                const attempts = await apiFetch<QuizAttempt[]>(
                  `/api/v1/modules/${mod.id}/quiz-attempts`
                ).catch(() => []);
                setModuleAttempts((prev) => ({ ...prev, [mod.id]: attempts }));
              } catch {
                // Skip
              }
            }
          } catch {
            // Skip
          }
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  const getAverageScore = (moduleId: string): number | null => {
    const attempts = moduleAttempts[moduleId] || [];
    if (attempts.length === 0) return null;
    const sum = attempts.reduce((acc, a) => acc + a.score, 0);
    return Math.round(sum / attempts.length);
  };

  const getMasteryColor = (score: number | null): string => {
    if (score === null) return "bg-muted text-muted-foreground";
    if (score >= 85) return "bg-green-500/10 text-green-500";
    if (score >= 60) return "bg-yellow-500/10 text-yellow-500";
    return "bg-red-500/10 text-red-500";
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-4 w-96 rounded bg-muted" />
          <div className="space-y-4 pt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/instructor" className="hover:underline">Dashboard</Link>
        <span>/</span>
        <span className="text-foreground">Analytics</span>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold font-[var(--font-heading)]">Analytics</h1>
      <p className="mt-1 text-muted-foreground">Student performance across your courses.</p>

      {courses.length === 0 ? (
        <Card className="mt-8 p-12 text-center">
          <h2 className="text-xl font-semibold font-[var(--font-heading)]">No courses yet</h2>
          <p className="mt-2 text-muted-foreground">Create a course to start tracking analytics.</p>
          <Button render={<Link href="/instructor/courses/new" />} className="mt-4">
            Create Course
          </Button>
        </Card>
      ) : (
        <div className="mt-8 space-y-8">
          {courses.map((course) => {
            const enrollments = courseEnrollments[course.id] || [];
            const modules = (courseModules[course.id] || []).sort((a, b) => a.position - b.position);

            return (
              <Card key={course.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold font-[var(--font-heading)]">{course.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {enrollments.length} enrolled student{enrollments.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Button render={<Link href={`/courses/${course.id}`} />} variant="outline" size="sm">
                    View Course
                  </Button>
                </div>

                {modules.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">No modules yet.</p>
                ) : (
                  <div className="mt-4 space-y-2">
                    {modules.map((mod) => {
                      const avgScore = getAverageScore(mod.id);
                      const attempts = moduleAttempts[mod.id] || [];
                      return (
                        <div key={mod.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{mod.title}</span>
                            <Badge variant="secondary" className="text-xs">
                              {attempts.length} attempt{attempts.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <Badge className={getMasteryColor(avgScore)}>
                            {avgScore !== null ? `${avgScore}% avg` : "No data"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}