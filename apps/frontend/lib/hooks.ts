"use client";

import { useState, useEffect, useCallback } from "react";
import { api, ApiResponse } from "./api";
import type { User, Organization, ScheduledClass, Course, Notification, TeacherEarnings, AdminStats, EnrollmentTrend, RevenueByMonth, TopCourse, RecentActivity } from "./types";

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

  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await api.get<ScheduledClass[]>("/classes/upcoming");
        if (response.success && response.data) {
          setClasses(response.data);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchClasses();
  }, []);

  return { classes, isLoading };
}

export function useEnrolledCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await api.get<Course[]>("/courses/enrolled");
        if (response.success && response.data) {
          setCourses(response.data);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return { courses, isLoading };
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

export function useTeacherSchedule() {
  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await api.get<ScheduledClass[]>("/teacher/schedule");
        if (response.success && response.data) {
          setClasses(response.data);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchSchedule();
  }, []);

  return { classes, isLoading };
}

export function useTeacherEarnings() {
  const [earnings, setEarnings] = useState<TeacherEarnings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEarnings() {
      try {
        const response = await api.get<TeacherEarnings[]>("/teacher/earnings");
        if (response.success && response.data) {
          setEarnings(response.data);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchEarnings();
  }, []);

  return { earnings, isLoading };
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get<AdminStats>("/admin/stats");
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, isLoading };
}

export function useAdminEnrollmentTrends() {
  const [trends, setTrends] = useState<EnrollmentTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      try {
        const response = await api.get<EnrollmentTrend[]>("/admin/enrollment-trends");
        if (response.success && response.data) {
          setTrends(response.data);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrends();
  }, []);

  return { trends, isLoading };
}

export function useAdminRevenueByMonth() {
  const [revenue, setRevenue] = useState<RevenueByMonth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const response = await api.get<RevenueByMonth[]>("/admin/revenue-by-month");
        if (response.success && response.data) {
          setRevenue(response.data);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchRevenue();
  }, []);

  return { revenue, isLoading };
}

export function useAdminTopCourses() {
  const [courses, setCourses] = useState<TopCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTopCourses() {
      try {
        const response = await api.get<TopCourse[]>("/admin/top-courses");
        if (response.success && response.data) {
          setCourses(response.data);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopCourses();
  }, []);

  return { courses, isLoading };
}

export function useAdminRecentActivity() {
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const response = await api.get<RecentActivity[]>("/admin/recent-activity");
        if (response.success && response.data) {
          setActivity(response.data);
        }
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivity();
  }, []);

  return { activity, isLoading };
}
