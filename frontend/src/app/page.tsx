import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-end px-6 py-4 sm:px-10">
        <ThemeToggle />
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 pb-24 pt-16 sm:px-10">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="w-fit rounded-full border border-border/60 bg-card/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Adaptive learning platform
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl font-[var(--font-heading)]">
              EduPath blends mastery-driven paths with an AI tutor grounded in your course content.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Deliver modern learning journeys that respond to real quiz scores, personalize next steps, and keep students on track with confident guidance.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button render={<Link href="/register" />} className="h-12 px-6">
                Start learning
              </Button>
              <Button render={<Link href="/login" />} variant="secondary" className="h-12 px-6">
                Sign in
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            <Card className="border-border/60 bg-card/70 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Adaptive mastery</span>
                <span className="rounded-full bg-accent/20 px-3 py-1 text-xs text-accent-foreground">Live</span>
              </div>
              <p className="mt-4 text-2xl font-semibold font-[var(--font-heading)]">87% mastery surge</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Students move ahead only when they own the concepts.
              </p>
            </Card>
            <Card className="border-border/60 bg-card/70 p-6 shadow-lg">
              <p className="text-sm text-muted-foreground">AI tutor focus</p>
              <p className="mt-4 text-2xl font-semibold font-[var(--font-heading)]">Grounded answers</p>
              <p className="mt-2 text-sm text-muted-foreground">
                RAG keeps every response aligned with your lessons.
              </p>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Adaptive pathing",
              body: "Quiz outcomes reroute learners to reinforce weak topics before advancing.",
            },
            {
              title: "Instructor insights",
              body: "Heatmaps and completion data help instructors act fast.",
            },
            {
              title: "Fresh quizzes",
              body: "Every attempt generates new questions for honest mastery checks.",
            },
          ].map((item) => (
            <Card key={item.title} className="border-border/60 bg-card/60 p-5">
              <h3 className="text-lg font-semibold font-[var(--font-heading)]">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
