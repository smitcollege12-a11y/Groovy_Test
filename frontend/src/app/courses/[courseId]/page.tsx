"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
  description: string | null;
  position: number;
  created_at: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [courseData, modulesData] = await Promise.all([
          apiFetch<Course>(`/api/v1/courses/${courseId}`),
          apiFetch<Module[]>(`/api/v1/courses/${courseId}/modules`),
        ]);
        setCourse(courseData);
        setModules(modulesData);

        if (user?.role === "student") {
          try {
            const status = await apiFetch<{ enrolled: boolean }>(
              `/api/v1/courses/${courseId}/enrollment-status`
            );
            setEnrolled(status.enrolled);
          } catch {
            // Not enrolled or error
          }
        }
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, user]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await apiFetch(`/api/v1/courses/${courseId}/enroll`, { method: "POST" });
      setEnrolled(true);
      toast.success("Enrolled!", { description: "You've been enrolled in this course." });
    } catch (err) {
      toast.error("Enrollment failed", {
        description: err instanceof Error ? err.message : "Could not enroll in course",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    setEnrolling(true);
    try {
      await apiFetch(`/api/v1/courses/${courseId}/enroll`, { method: "DELETE" });
      setEnrolled(false);
      toast.success("Unenrolled", { description: "You've been removed from this course." });
    } catch (err) {
      toast.error("Unenroll failed", {
        description: err instanceof Error ? err.message : "Could not unenroll from course",
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-96 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-10 w-32 rounded bg-muted" />
          <div className="space-y-3 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold font-[var(--font-heading)]">Course not found</h2>
          <Button render={<Link href="/courses" />} className="mt-4">
            Back to Catalog
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link href="/courses" className="text-sm text-muted-foreground hover:underline">
        &larr; Back to Catalog
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold font-[var(--font-heading)]">{course.title}</h1>
          {course.description && (
            <p className="mt-2 text-muted-foreground">{course.description}</p>
          )}
        </div>
        {user?.role === "student" && (
          <div className="shrink-0">
            {enrolled ? (
              <div className="flex gap-2">
                <Badge>Enrolled</Badge>
                <Button render={<Link href={`/courses/${courseId}/tutor`} />} variant="outline" size="sm">
                  AI Tutor
                </Button>
                <Button variant="outline" size="sm" onClick={handleUnenroll} disabled={enrolling}>
                  Unenroll
                </Button>
              </div>
            ) : (
              <Button onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? "Enrolling..." : "Enroll Now"}
              </Button>
            )}
          </div>
        )}
      </div>

      <Separator className="my-6" />

      <h2 className="text-xl font-semibold font-[var(--font-heading)]">Modules</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {modules.length} module{modules.length !== 1 ? "s" : ""} in this course
      </p>

      {modules.length === 0 ? (
        <Card className="mt-4 p-8 text-center">
          <p className="text-muted-foreground">No modules available yet.</p>
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {modules
            .sort((a, b) => a.position - b.position)
            .map((module, idx) => (
              <Link key={module.id} href={`/modules/${module.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-4 p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium">{module.title}</h3>
                      {module.description && (
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                          {module.description}
                        </p>
                      )}
                    </div>
                    {enrolled && (
                      <Badge variant="outline" className="shrink-0">
                        Start
                      </Badge>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}