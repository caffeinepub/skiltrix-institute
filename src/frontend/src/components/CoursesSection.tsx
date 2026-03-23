import { useGetCourses } from "@/hooks/useQueries";
import {
  ArrowRight,
  BarChart2,
  Clock,
  Code2,
  Megaphone,
  Palette,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import type { Course } from "../backend.d";

const SAMPLE_COURSES: Course[] = [
  {
    title: "Web Development",
    description:
      "Master full-stack development with React, Node.js, and cloud deployment.",
    duration: "6 Months",
    icon: "code",
    category: "Technology",
  },
  {
    title: "Data Science",
    description:
      "Unlock insights from data with Python, ML algorithms, and visualization.",
    duration: "8 Months",
    icon: "chart",
    category: "Technology",
  },
  {
    title: "Digital Marketing",
    description:
      "Drive growth with SEO, paid ads, social media, and analytics strategies.",
    duration: "4 Months",
    icon: "megaphone",
    category: "Marketing",
  },
  {
    title: "UI/UX Design",
    description:
      "Craft beautiful, user-centered experiences with Figma and design systems.",
    duration: "5 Months",
    icon: "palette",
    category: "Design",
  },
  {
    title: "Business Analytics",
    description:
      "Transform business data into strategic decisions using BI tools.",
    duration: "4 Months",
    icon: "trend",
    category: "Business",
  },
  {
    title: "Cybersecurity",
    description:
      "Protect systems and networks with ethical hacking and security protocols.",
    duration: "7 Months",
    icon: "shield",
    category: "Technology",
  },
];

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4"];

function getCourseIcon(icon: string) {
  switch (icon) {
    case "code":
      return Code2;
    case "chart":
      return BarChart2;
    case "megaphone":
      return Megaphone;
    case "palette":
      return Palette;
    case "trend":
      return TrendingUp;
    case "shield":
      return ShieldCheck;
    default:
      return Code2;
  }
}

function CourseCard({ course, index }: { course: Course; index: number }) {
  const Icon = getCourseIcon(course.icon);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      data-ocid={`courses.item.${index + 1}`}
      className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-6 flex flex-col group"
    >
      <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-brand-blue" />
      </div>
      <div className="flex-1">
        <h3 className="text-base font-bold text-foreground mb-2">
          {course.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {course.description}
        </p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          {course.duration}
        </span>
        <a
          href="#cta"
          className="flex items-center gap-1 text-sm font-semibold text-brand-blue hover:gap-2 transition-all"
        >
          Explore <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}

export function CoursesSection() {
  const { data: backendCourses, isLoading } = useGetCourses();
  const courses =
    backendCourses && backendCourses.length > 0
      ? backendCourses
      : SAMPLE_COURSES;

  return (
    <section id="courses" className="py-24 bg-section-bg">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-brand-blue font-semibold text-sm tracking-widest uppercase">
            What We Offer
          </span>
          <h2 className="text-4xl font-extrabold text-foreground mt-2">
            Our Courses
          </h2>
          <p className="text-muted-foreground text-lg mt-3 max-w-xl mx-auto">
            Industry-aligned programs taught by world-class instructors to
            fast-track your career.
          </p>
        </motion.div>

        {isLoading ? (
          <div
            data-ocid="courses.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {SKELETON_KEYS.map((key) => (
              <div
                key={key}
                className="bg-white rounded-2xl shadow-card p-6 animate-pulse"
              >
                <div className="w-12 h-12 rounded-xl bg-muted mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : (
          <div
            data-ocid="courses.list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {courses.map((course, i) => (
              <CourseCard key={course.title} course={course} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
