"use client";

import { useState, useEffect, useCallback } from "react";
import { api, ApiResponse } from "./api";
import type { User, Organization, ScheduledClass, Course, Notification } from "./types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const token = api.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await api.get<User>("/auth/me");
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch {
      api.clearToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string) => {
    const response = await api.post<{ message: string }>("/auth/magic-link", { email });
    return response;
  };

  const verifyToken = async (token: string) => {
    const response = await api.post<{ token: string; user: User }>("/auth/verify", { token });
    if (response.success && response.data) {
      api.setToken(response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
    }
    return response;
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    verifyToken,
    logout,
  };
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get<User>("/users/me");
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, isLoading };
}

export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrganization() {
      try {
        const response = await api.get<Organization>("/organizations/current");
        if (response.success && response.data) {
          setOrganization(response.data);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrganization();
  }, []);

  return { organization, isLoading };
}

export function useUpcomingClasses() {
  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<ScheduledClass[]>("/classes/upcoming");
      if (response.success && response.data) {
        setClasses(response.data);
      } else {
        setError("Failed to load classes");
      }
    } catch {
      setError("Failed to load classes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { classes, isLoading, error, refetch: fetchClasses };
}

export function useEnrolledCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Course[]>("/courses/enrolled");
      if (response.success && response.data) {
        setCourses(response.data);
      } else {
        setError("Failed to load courses");
      }
    } catch {
      setError("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, isLoading, error, refetch: fetchCourses };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await api.get<Notification[]>("/notifications");
        if (response.success && response.data) {
          setNotifications(response.data);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return { notifications, isLoading, markAsRead };
}

export { useTeacherSchedule } from "./hooks/useTeacherSchedule";
export { useToast } from "./hooks/useToast";