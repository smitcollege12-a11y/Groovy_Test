"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  position: number;
}

interface Course {
  id: string;
  title: string;
}

export default function LessonsPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const [module, setModule] = useState<Module | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadLessons() {
      try {
        const moduleData = await apiFetch<Module>(`/api/v1/modules/${moduleId}`);
        setModule(moduleData);

        const [courseData, lessonsData] = await Promise.all([
          apiFetch<Course>(`/api/v1/courses/${moduleData.course_id}`),
          apiFetch<Lesson[]>(`/api/v1/modules/${moduleId}/lessons`),
        ]);
        if (!cancelled) {
          setCourse(courseData);
          setLessons(lessonsData.sort((a, b) => a.position - b.position));
        }
      } catch (err) {
        console.error("Failed to load lessons:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadLessons();
    return () => { cancelled = true; };
  }, [moduleId]);

  const refetchLessons = async () => {
    try {
      const moduleData = await apiFetch<Module>(`/api/v1/modules/${moduleId}`);
      setModule(moduleData);

      const [courseData, lessonsData] = await Promise.all([
        apiFetch<Course>(`/api/v1/courses/${moduleData.course_id}`),
        apiFetch<Lesson[]>(`/api/v1/modules/${moduleId}/lessons`),
      ]);
      setCourse(courseData);
      setLessons(lessonsData.sort((a, b) => a.position - b.position));
    } catch (err) {
      console.error("Failed to load lessons:", err);
    }
  };

  const [ingesting, setIngesting] = useState<string | null>(null);

  const handleIngestLesson = async (lesson: Lesson) => {
    if (!course) return;
    setIngesting(lesson.id);
    try {
      await apiFetch(`/api/v1/courses/${course.id}/ingest`, {
        method: "POST",
        body: JSON.stringify({
          lesson_id: lesson.id,
          module_id: moduleId,
          title: lesson.title,
          content: lesson.content,
        }),
      });
      toast.success("Content ingested", {
        description: `"${lesson.title}" is now available to the AI tutor.`,
      });
    } catch (err) {
      toast.error("Ingestion failed", {
        description: err instanceof Error ? err.message : "Could not ingest content",
      });
    } finally {
      setIngesting(null);
    }
  };

  const [ingestingAll, setIngestingAll] = useState(false);

  const handleIngestAll = async () => {
    if (!course) return;
    setIngestingAll(true);
    let successCount = 0;
    for (const lesson of lessons) {
      try {
        await apiFetch(`/api/v1/courses/${course.id}/ingest`, {
          method: "POST",
          body: JSON.stringify({
            lesson_id: lesson.id,
            module_id: moduleId,
            title: lesson.title,
            content: lesson.content,
          }),
        });
        successCount++;
      } catch {
        // Continue with other lessons
      }
    }
    setIngestingAll(false);
    toast.success("Batch ingestion complete", {
      description: `${successCount}/${lessons.length} lessons ingested.`,
    });
  };

  const handleLessonSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    try {
      if (editingLesson) {
        await apiFetch(`/api/v1/lessons/${editingLesson.id}`, {
          method: "PUT",
          body: JSON.stringify({ title, content }),
        });
        toast.success("Lesson updated");
      } else {
        await apiFetch(`/api/v1/modules/${moduleId}/lessons`, {
          method: "POST",
          body: JSON.stringify({
            title,
            content,
            position: lessons.length,
          }),
        });
        toast.success("Lesson added");
      }
      setDialogOpen(false);
      setEditingLesson(null);
      await refetchLessons();
    } catch (err) {
      toast.error("Failed to save lesson", {
        description: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await apiFetch(`/api/v1/lessons/${lessonId}`, { method: "DELETE" });
      toast.success("Lesson deleted");
      await refetchLessons();
    } catch (err) {
      toast.error("Failed to delete lesson", {
        description: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-48 rounded bg-muted" />
          <div className="h-8 w-96 rounded bg-muted" />
          <div className="space-y-3 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-muted" />
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
          <Button render={<Link href="/instructor" />} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/instructor" className="hover:underline">Dashboard</Link>
        <span>/</span>
        <Link href={`/instructor/courses/${course.id}/edit`} className="hover:underline">{course.title}</Link>
        <span>/</span>
        <span className="text-foreground">{module.title}</span>
      </nav>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold font-[var(--font-heading)]">Lessons</h1>
          <p className="mt-1 text-muted-foreground">{module.title}</p>
        </div>
        <div className="flex gap-2">
          {lessons.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleIngestAll}
              disabled={ingestingAll}
            >
              {ingestingAll ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Ingesting...
                </span>
              ) : (
                "Ingest All to AI"
              )}
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button size="sm" onClick={() => setEditingLesson(null)} />}>
              Add Lesson
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLesson ? "Edit Lesson" : "Add Lesson"}</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleLessonSubmit}>
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Title</Label>
                <Input id="lesson-title" name="title" defaultValue={editingLesson?.title || ""} required minLength={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-content">Content</Label>
                <Textarea
                  id="lesson-content"
                  name="content"
                  defaultValue={editingLesson?.content || ""}
                  rows={12}
                  required
                  minLength={10}
                  placeholder="Write the lesson content here..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingLesson ? "Save" : "Add"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {lessons.length === 0 ? (
        <Card className="mt-6 p-8 text-center">
          <p className="text-muted-foreground">No lessons yet. Add your first lesson to get started.</p>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {lessons.map((lesson, idx) => (
            <Card key={lesson.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-medium">{lesson.title}</h3>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {lesson.content.slice(0, 100)}...
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleIngestLesson(lesson)}
                    disabled={ingesting === lesson.id}
                  >
                    {ingesting === lesson.id ? (
                      <Spinner size="sm" />
                    ) : (
                      "Ingest"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingLesson(lesson);
                      setDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
                      Delete
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this lesson.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel render={<Button variant="outline" />}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          render={<Button variant="destructive" />}
                          onClick={() => handleDeleteLesson(lesson.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}