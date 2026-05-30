"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sidebar } from "@/components/sidebar";

interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string;
  created_at: string;
}

interface Enrollment {
  id: string;
  course_id: string;
  created_at: string;
}

interface ModuleMastery {
  module_id: string;
  module_title: string;
  course_id: string;
  course_title: string;
  mastery: string;
  score: number | null;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [adaptivePath, setAdaptivePath] = useState<ModuleMastery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [enrollmentsData, coursesData] = await Promise.all([
          apiFetch<Enrollment[]>("/api/v1/enrollments"),
          apiFetch<Course[]>("/api/v1/courses/"),
        ]);
        setEnrollments(enrollmentsData);
        setCourses(coursesData);

        const adaptiveData: ModuleMastery[] = [];
        for (const enrollment of enrollmentsData) {
          try {
            const path = await apiFetch<{ modules: ModuleMastery[] }>(
              `/api/v1/courses/${enrollment.course_id}/adaptive-path`
            );
            adaptiveData.push(...path.modules);
          } catch {
            // Skip if adaptive path fails
          }
        }
        setAdaptivePath(adaptiveData);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const enrolledCourses = courses.filter((c) =>
    enrollments.some((e) => e.course_id === c.id)
  );

  const masteryColors: Record<string, string> = {
    mastered: "bg-green-500/10 text-green-500",
    needs_review: "bg-yellow-500/10 text-yellow-500",
    remedial: "bg-red-500/10 text-red-500",
    unattempted: "bg-muted text-muted-foreground",
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-4 w-96 rounded bg-muted" />
          <div className="grid gap-4 pt-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader role="student" />
      <div className="flex flex-1">
        <Sidebar role="student" />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-6 py-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold font-[var(--font-heading)]">
                  Welcome back{user?.name ? `, ${user.name}` : ""}
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Your personalized path and course progress.
                </p>
          </div>
          <Button render={<Link href="/courses" />}>Browse Courses</Button>
        </div>

      {enrolledCourses.length === 0 ? (
        <Card className="mt-8 p-12 text-center">
          <h2 className="text-xl font-semibold font-[var(--font-heading)]">No courses yet</h2>
          <p className="mt-2 text-muted-foreground">
            Browse our catalog to find courses that match your learning goals.
          </p>
          <Button render={<Link href="/courses" />} className="mt-4">
            Explore Courses
          </Button>
        </Card>
      ) : (
        <>
          <h2 className="mt-10 text-xl font-semibold font-[var(--font-heading)]">My Courses</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <div className="p-5">
                    <h3 className="font-semibold font-[var(--font-heading)]">{course.title}</h3>
                    {course.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {course.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary">Enrolled</Badge>
                      <Button
                        render={<Link href={`/courses/${course.id}/tutor`} />}
                        variant="ghost"
                        size="sm"
                      >
                        AI Tutor
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {adaptivePath.length > 0 && (
            <>
              <Separator className="my-8" />
              <h2 className="text-xl font-semibold font-[var(--font-heading)]">Adaptive Path</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your recommended learning sequence based on quiz performance.
              </p>
              <div className="mt-4 space-y-2">
                {adaptivePath.map((module, idx) => (
                  <Card key={module.module_id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-medium">{module.module_title}</p>
                          <p className="text-xs text-muted-foreground">{module.course_title}</p>
                        </div>
                      </div>
                      <Badge className={masteryColors[module.mastery] || ""}>
                        {module.mastery.replace("_", " ")}
                        {module.score != null && ` · ${module.score}%`}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
          </div>
        </main>
      </div>
    </div>
  );
}