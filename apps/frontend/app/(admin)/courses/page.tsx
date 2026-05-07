"use client";

import * as React from "react";
import { BookOpen, Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CourseData {
  id: string;
  title: string;
  instructor: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "published" | "draft" | "archived";
  enrolledCount: number;
  rating: number;
  createdAt: string;
}

const MOCK_COURSES: CourseData[] = [
  {
    id: "1",
    title: "Quran Memorization Basics",
    instructor: "Sheikh Ibrahim",
    difficulty: "beginner",
    status: "published",
    enrolledCount: 156,
    rating: 4.8,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Arabic Grammar Fundamentals",
    instructor: "Sheikh Abdullah",
    difficulty: "intermediate",
    status: "published",
    enrolledCount: 89,
    rating: 4.6,
    createdAt: "2024-02-01",
  },
  {
    id: "3",
    title: "Tajweed Rules Mastery",
    instructor: "Sheikh Muhammad",
    difficulty: "advanced",
    status: "published",
    enrolledCount: 234,
    rating: 4.95,
    createdAt: "2023-11-20",
  },
  {
    id: "4",
    title: "Islamic Studies for Beginners",
    instructor: "Ustadha Fatima",
    difficulty: "beginner",
    status: "draft",
    enrolledCount: 0,
    rating: 0,
    createdAt: "2024-03-01",
  },
  {
    id: "5",
    title: "Advanced Tafsir",
    instructor: "Sheikh Ibrahim",
    difficulty: "advanced",
    status: "archived",
    enrolledCount: 45,
    rating: 4.9,
    createdAt: "2023-06-15",
  },
];

const difficultyColors = {
  beginner: "bg-emerald-100 text-emerald-800",
  intermediate: "bg-amber-100 text-amber-800",
  advanced: "bg-red-100 text-red-800",
};

const statusColors = {
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-slate-100 text-slate-800",
  archived: "bg-red-100 text-red-800",
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = React.useState<CourseData[]>(MOCK_COURSES);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<CourseData | null>(null);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCourse = (course: CourseData) => {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCourse) {
      setCourses((prev) => prev.filter((c) => c.id !== selectedCourse.id));
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage all courses on the platform</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-4 font-semibold">Course</th>
                  <th className="text-left p-4 font-semibold">Instructor</th>
                  <th className="text-left p-4 font-semibold">Difficulty</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Enrolled</th>
                  <th className="text-left p-4 font-semibold">Rating</th>
                  <th className="text-left p-4 font-semibold">Created</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <p className="font-medium">{course.title}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">{course.instructor}</td>
                    <td className="p-4">
                      <Badge className={difficultyColors[course.difficulty]}>
                        {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={statusColors[course.status]}>
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-500">{course.enrolledCount}</td>
                    <td className="p-4">
                      {course.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-amber-500">★</span>
                          <span>{course.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(course.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCourse(course)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No courses found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Course Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Course Title</label>
              <Input placeholder="Enter course title..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Instructor</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">Select instructor...</option>
                <option value="1">Sheikh Ibrahim</option>
                <option value="2">Sheikh Abdullah</option>
                <option value="3">Sheikh Muhammad</option>
                <option value="4">Ustadha Fatima</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={3}
                placeholder="Course description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCreateDialogOpen(false)}>Create Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <strong>{selectedCourse?.title}</strong>? All enrolled
            students will lose access. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}