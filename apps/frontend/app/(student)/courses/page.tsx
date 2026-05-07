"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import type { Course, CourseCategory } from "@/lib/types";
import { Search, Filter, Star, Clock, Users, BookOpen, ChevronRight } from "lucide-react";

const CATEGORIES: { value: CourseCategory | ""; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "quran", label: "Quran" },
  { value: "arabic", label: "Arabic" },
  { value: "fiqh", label: "Fiqh" },
  { value: "seerah", label: "Seerah" },
  { value: "hadith", label: "Hadith" },
  { value: "tajweed", label: "Tajweed" },
  { value: "memorization", label: "Memorization" },
];

const DIFFICULTIES = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "beginner":
      return "bg-green-100 text-green-800";
    case "intermediate":
      return "bg-yellow-100 text-yellow-800";
    case "advanced":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [category, setCategory] = React.useState<CourseCategory | "">("");
  const [difficulty, setDifficulty] = React.useState("");

  React.useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await api.get<Course[]>("/courses");
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

  const filteredCourses = React.useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = search
        ? course.title.toLowerCase().includes(search.toLowerCase()) ||
          course.description.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesCategory = category ? course.language.toLowerCase() === category.toLowerCase() : true;
      const matchesDifficulty = difficulty ? course.difficulty === difficulty : true;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [courses, search, category, difficulty]);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white p-8">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Course Catalog</h1>
          <p className="mt-2 text-white/90 max-w-xl">
            Explore our comprehensive Islamic courses taught by expert scholars. Build your knowledge at your own pace.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4">
          <Select value={category} onChange={(e) => setCategory(e.target.value as CourseCategory | "")}>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>
          <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {DIFFICULTIES.map((diff) => (
              <option key={diff.value} value={diff.value}>
                {diff.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No courses found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary/50" />
                </div>
                <CardHeader className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                    <Badge variant="outline">{course.language}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(course.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.totalLessons} lessons
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.enrollmentCount}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <Star className="h-4 w-4 fill-current" />
                      {course.rating}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium">{course.instructor}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
