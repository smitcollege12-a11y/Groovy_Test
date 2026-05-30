"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sidebar } from "@/components/sidebar";

interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string;
  created_at: string;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
}

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [moduleCounts, setModuleCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const allCourses = await apiFetch<Course[]>("/api/v1/courses/");
        const myCourses = allCourses.filter((c) => c.instructor_id === user?.id);
        setCourses(myCourses);

        const counts: Record<string, number> = {};
        await Promise.all(
          myCourses.map(async (course) => {
            try {
              const modules = await apiFetch<Module[]>(`/api/v1/courses/${course.id}/modules`);
              counts[course.id] = modules.length;
            } catch {
              counts[course.id] = 0;
            }
          })
        );
        setModuleCounts(counts);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

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
      <DashboardHeader role="instructor" />
      <div className="flex flex-1">
        <Sidebar role="instructor" />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-6 py-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold font-[var(--font-heading)]">Instructor Dashboard</h1>
                <p className="mt-1 text-muted-foreground">
                  Manage your courses and track student progress.
                </p>
              </div>
              <Button render={<Link href="/instructor/courses/new" />}>Create Course</Button>
            </div>

      {courses.length === 0 ? (
        <Card className="mt-8 p-12 text-center">
          <h2 className="text-xl font-semibold font-[var(--font-heading)]">No courses yet</h2>
          <p className="mt-2 text-muted-foreground">
            Create your first course to start teaching.
          </p>
          <Button render={<Link href="/instructor/courses/new" />} className="mt-4">
            Create Course
          </Button>
        </Card>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="mt-1 text-3xl font-bold">{courses.length}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Total Modules</p>
              <p className="mt-1 text-3xl font-bold">
                {Object.values(moduleCounts).reduce((a, b) => a + b, 0)}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Quick Actions</p>
              <div className="mt-2 flex gap-2">
                <Button render={<Link href="/instructor/courses/new" />} size="sm" variant="outline">
                  New Course
                </Button>
                <Button render={<Link href="/instructor/analytics" />} size="sm" variant="outline">
                  Analytics
                </Button>
              </div>
            </Card>
          </div>

          <h2 className="mt-10 text-xl font-semibold font-[var(--font-heading)]">Your Courses</h2>
          <div className="mt-4 space-y-3">
            {courses.map((course) => (
              <Card key={course.id} className="transition-colors hover:bg-muted/50">
                <div className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="font-semibold font-[var(--font-heading)]">{course.title}</h3>
                    {course.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {course.description}
                      </p>
                    )}
                    <div className="mt-2 flex gap-2">
                      <Badge variant="secondary">
                        {moduleCounts[course.id] || 0} module{(moduleCounts[course.id] || 0) !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button render={<Link href={`/courses/${course.id}`} />} variant="outline" size="sm">
                      View
                    </Button>
                    <Button render={<Link href={`/instructor/courses/${course.id}/edit`} />} variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
          </div>
        </main>
      </div>
    </div>
  );
}