"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { useAuthStore, type User } from "@/stores/auth";

const PUBLIC_PATHS = ["/login", "/register", "/"];

export function useAuth() {
  const { user, isLoading, setUser, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiFetch<{ id: string; email: string; name: string; role: string; created_at: string }>("/api/v1/auth/me");
        setUser(data as User);
      } catch {
        setUser(null);
      }
    }
    fetchUser();
  }, [setUser]);

  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

    if (!user && !isPublic) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ user: User }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
    return data.user;
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    await apiFetch<User>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
    // After register, auto-login
    return login(email, password);
  };

  const logoutUser = async () => {
    await apiFetch("/api/v1/auth/logout", { method: "POST" });
    logout();
    router.push("/login");
  };

  return { user, isLoading, login, register, logout: logoutUser };
}