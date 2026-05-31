"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { apiFetch, getToken } from "@/lib/api";
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
        localStorage.removeItem("access_token");
        setUser(null);
      }
    }
    if (getToken()) {
      fetchUser();
    } else {
      setUser(null);
    }
  }, [setUser]);

  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

    if (!user && !isPublic) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ user: User; access_token: string }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    const data = await apiFetch<{ user: User; access_token: string }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logoutUser = async () => {
    await apiFetch("/api/v1/auth/logout", { method: "POST" });
    localStorage.removeItem("access_token");
    logout();
    router.push("/login");
  };

  return { user, isLoading, login, register, logout: logoutUser };
}