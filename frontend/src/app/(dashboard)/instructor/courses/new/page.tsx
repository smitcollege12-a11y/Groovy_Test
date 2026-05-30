"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewCoursePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    try {
      const course = await apiFetch<{ id: string }>("/api/v1/courses/", {
        method: "POST",
        body: JSON.stringify({ title, description: description || undefined }),
      });
      router.push(`/instructor/courses/${course.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/instructor" className="hover:underline">Dashboard</Link>
        <span>/</span>
        <span className="text-foreground">New Course</span>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold font-[var(--font-heading)]">Create Course</h1>
      <p className="mt-1 text-muted-foreground">Set up a new course for your students.</p>

      <Card className="mt-6 p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" name="title" placeholder="Introduction to Machine Learning" required minLength={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="A brief description of what students will learn..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button render={<Link href="/instructor" />} variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}