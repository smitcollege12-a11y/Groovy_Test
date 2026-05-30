"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
}

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadCourse() {
      try {
        const [courseData, modulesData] = await Promise.all([
          apiFetch<Course>(`/api/v1/courses/${courseId}`),
          apiFetch<Module[]>(`/api/v1/courses/${courseId}/modules`),
        ]);
        if (!cancelled) {
          setCourse(courseData);
          setModules(modulesData.sort((a, b) => a.position - b.position));
        }
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCourse();
    return () => { cancelled = true; };
  }, [courseId]);

  const refetchCourse = async () => {
    try {
      const [courseData, modulesData] = await Promise.all([
        apiFetch<Course>(`/api/v1/courses/${courseId}`),
        apiFetch<Module[]>(`/api/v1/courses/${courseId}/modules`),
      ]);
      setCourse(courseData);
      setModules(modulesData.sort((a, b) => a.position - b.position));
    } catch (err) {
      console.error("Failed to load course:", err);
    }
  };

  const handleCourseUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    try {
      const updated = await apiFetch<Course>(`/api/v1/courses/${courseId}`, {
        method: "PUT",
        body: JSON.stringify({ title, description: description || undefined }),
      });
      setCourse(updated);
      toast.success("Course updated", { description: "Your changes have been saved." });
    } catch (err) {
      toast.error("Failed to update course", {
        description: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await apiFetch(`/api/v1/courses/${courseId}`, { method: "DELETE" });
      toast.success("Course deleted");
      router.push("/instructor");
    } catch (err) {
      toast.error("Failed to delete course", {
        description: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  const handleModuleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    try {
      if (editingModule) {
        await apiFetch(`/api/v1/modules/${editingModule.id}`, {
          method: "PUT",
          body: JSON.stringify({ title, description: description || undefined }),
        });
        toast.success("Module updated");
      } else {
        await apiFetch(`/api/v1/courses/${courseId}/modules`, {
          method: "POST",
          body: JSON.stringify({
            title,
            description: description || undefined,
            position: modules.length,
          }),
        });
        toast.success("Module added");
      }
      setModuleDialogOpen(false);
      setEditingModule(null);
      await refetchCourse();
    } catch (err) {
      toast.error("Failed to save module", {
        description: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await apiFetch(`/api/v1/modules/${moduleId}`, { method: "DELETE" });
      toast.success("Module deleted");
      await refetchCourse();
    } catch (err) {
      toast.error("Failed to delete module", {
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
          <div className="h-48 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold font-[var(--font-heading)]">Course not found</h2>
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
        <span className="text-foreground">{course.title}</span>
      </nav>

      <div className="mt-4 flex items-start justify-between">
        <h1 className="text-3xl font-semibold font-[var(--font-heading)]">Edit Course</h1>
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
            Delete Course
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this course and all its modules and lessons.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel render={<Button variant="outline" />}>Cancel</AlertDialogCancel>
              <AlertDialogAction render={<Button variant="destructive" />} onClick={handleDeleteCourse}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="mt-6 p-6">
        <form className="space-y-5" onSubmit={handleCourseUpdate}>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" name="title" defaultValue={course.title} required minLength={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={course.description || ""}
              rows={4}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>

      <Separator className="my-8" />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold font-[var(--font-heading)]">Modules</h2>
        <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
          <DialogTrigger render={<Button size="sm" onClick={() => setEditingModule(null)} />}>
            Add Module
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingModule ? "Edit Module" : "Add Module"}</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleModuleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="module-title">Title</Label>
                <Input id="module-title" name="title" defaultValue={editingModule?.title || ""} required minLength={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-description">Description</Label>
                <Textarea id="module-description" name="description" defaultValue={editingModule?.description || ""} rows={3} />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setModuleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingModule ? "Save" : "Add"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {modules.length === 0 ? (
        <Card className="mt-4 p-8 text-center">
          <p className="text-muted-foreground">No modules yet. Add your first module to get started.</p>
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {modules.map((module, idx) => (
            <Card key={module.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-medium">{module.title}</h3>
                    {module.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {module.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    render={<Link href={`/instructor/modules/${module.id}/lessons`} />}
                    variant="outline"
                    size="sm"
                  >
                    Lessons
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingModule(module);
                      setModuleDialogOpen(true);
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
                        <AlertDialogTitle>Delete module?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this module and all its lessons.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel render={<Button variant="outline" />}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          render={<Button variant="destructive" />}
                          onClick={() => handleDeleteModule(module.id)}
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