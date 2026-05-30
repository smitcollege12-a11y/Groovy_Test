"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string;
  created_at: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<Course[]>("/api/v1/courses/");
        setCourses(data);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold font-[var(--font-heading)]">Course Catalog</h1>
      <p className="mt-1 text-muted-foreground">
        Explore courses and start your adaptive learning journey.
      </p>

      <Input
        className="mt-6 max-w-md"
        placeholder="Search courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <Card className="mt-8 p-12 text-center">
          <h2 className="text-xl font-semibold font-[var(--font-heading)]">
            {courses.length === 0 ? "No courses available" : "No courses match your search"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {courses.length === 0
              ? "Check back later for new courses."
              : "Try a different search term."}
          </p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <div className="flex flex-col p-5">
                  <h3 className="font-semibold font-[var(--font-heading)]">{course.title}</h3>
                  {course.description && (
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                      {course.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <Badge variant="outline">View Details</Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}