"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";

interface Course {
  id: string;
  title: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function TutorPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const courseData = await apiFetch<Course>(`/api/v1/courses/${courseId}`);
        setCourse(courseData);
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, [courseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const chatHistory = messages.map((m) => ({ role: m.role, content: m.content }));
      const data = await apiFetch<{ response: string }>(
        `/api/v1/courses/${courseId}/tutor/chat`,
        {
          method: "POST",
          body: JSON.stringify({ message: userMessage, chat_history: chatHistory }),
        }
      );
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (pageLoading) {
    return (
      <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="flex-1 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-3/4 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-6 py-12">
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold font-[var(--font-heading)]">Course not found</h2>
          <Button render={<Link href="/student" />} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-6 py-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/student" className="hover:underline">Dashboard</Link>
        <span>/</span>
        <Link href={`/courses/${courseId}`} className="hover:underline">{course.title}</Link>
        <span>/</span>
        <span className="text-foreground">AI Tutor</span>
      </nav>

      <h1 className="mt-3 text-2xl font-semibold font-[var(--font-heading)]">AI Tutor</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ask questions about &quot;{course.title}&quot; and get answers grounded in your course content.
      </p>

      <Card className="mt-4 flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium text-muted-foreground">
                  Ask me anything about this course
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  I&apos;ll answer based on the course materials.
                </p>
              </div>
            </div>
          )}
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <Avatar className="size-8 shrink-0">
                    <div className="flex size-full items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      AI
                    </div>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <Avatar className="size-8 shrink-0">
                    <div className="flex size-full items-center justify-center rounded-full bg-secondary text-xs text-secondary-foreground">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  </Avatar>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <Avatar className="size-8 shrink-0">
                  <div className="flex size-full items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    AI
                  </div>
                </Avatar>
                <div className="rounded-lg bg-muted px-4 py-2 text-sm">
                  <p className="animate-pulse text-muted-foreground">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about this course..."
              rows={2}
              className="resize-none"
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim()} className="shrink-0">
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}