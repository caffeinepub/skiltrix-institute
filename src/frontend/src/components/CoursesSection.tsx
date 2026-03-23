import { CourseDetailModal } from "@/components/CourseDetailModal";
import { useGetCourses } from "@/hooks/useQueries";
import {
  BarChart2,
  Clock,
  Code2,
  Eye,
  Megaphone,
  Palette,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Course } from "../backend.d";

const COURSE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  code: Code2,
  chart: BarChart2,
  megaphone: Megaphone,
  palette: Palette,
  trend: TrendingUp,
  shield: ShieldCheck,
};

const COURSE_COLORS: Record<string, string> = {
  Technology: "bg-blue-50 text-blue-700",
  Marketing: "bg-orange-50 text-orange-700",
  Design: "bg-purple-50 text-purple-700",
  Business: "bg-green-50 text-green-700",
  Security: "bg-red-50 text-red-700",
};

function CourseCard({
  course,
  onViewDetails,
  onApply,
  index,
}: {
  course: Course;
  onViewDetails: (course: Course) => void;
  onApply: (title: string) => void;
  index: number;
}) {
  const Icon = COURSE_ICONS[course.icon] ?? Code2;
  const colorClass =
    COURSE_COLORS[course.category] ?? "bg-blue-50 text-blue-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.4) }}
      data-ocid={
        `courses.item.${index + 1}` as `courses.item.${1 | 2 | 3 | 4 | 5 | 6}`
      }
      className="group relative bg-white rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden"
    >
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-brand-blue" />
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}
          >
            {course.category}
          </span>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2">
          {course.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-4 line-clamp-3">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.duration}
          </span>
          <span className="font-semibold text-brand-blue">{course.fees}</span>
        </div>

        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            onClick={() => onViewDetails(course)}
            data-ocid="courses.secondary_button"
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-brand-blue/30 text-brand-blue text-sm font-semibold hover:bg-brand-blue/5 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button
            type="button"
            onClick={() => onApply(course.title)}
            data-ocid="courses.primary_button"
            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-[oklch(0.52_0.19_252)] transition-colors"
          >
            Apply Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function CoursesSection({
  onApplyClick,
}: {
  onApplyClick: (course?: string) => void;
}) {
  const { data: backendCourses } = useGetCourses();
  const courses = backendCourses ?? [];
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  return (
    <section id="courses" className="py-20 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mb-12 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-primary">
            Our Programs
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Explore Our Courses
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Industry-aligned programs built to launch and accelerate your
            career.
          </p>
        </motion.div>

        {/* Empty state */}
        {courses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            data-ocid="courses.empty_state"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-blue/10">
              <Clock className="h-8 w-8 text-brand-blue" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Courses Coming Soon!
            </h3>
            <p className="mt-2 max-w-sm text-muted-foreground">
              We&apos;re adding exciting programs. Check back shortly or contact
              us to learn more.
            </p>
          </motion.div>
        )}

        {/* Grid */}
        {courses.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <CourseCard
                key={course.title}
                course={course}
                index={i}
                onViewDetails={setSelectedCourse}
                onApply={(title) => onApplyClick(title)}
              />
            ))}
          </div>
        )}
      </div>

      <CourseDetailModal
        course={selectedCourse}
        open={selectedCourse !== null}
        onClose={() => setSelectedCourse(null)}
        onApply={(title) => {
          setSelectedCourse(null);
          onApplyClick(title);
        }}
      />
    </section>
  );
}
