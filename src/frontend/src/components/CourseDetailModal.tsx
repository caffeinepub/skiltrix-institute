import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart2,
  Briefcase,
  CheckCircle2,
  Clock,
  Code2,
  Megaphone,
  Palette,
  ShieldCheck,
  Tag,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Course } from "../backend.d";

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

const CATEGORY_COLORS: Record<string, string> = {
  Technology: "bg-blue-100 text-blue-700",
  Marketing: "bg-orange-100 text-orange-700",
  Design: "bg-purple-100 text-purple-700",
  Business: "bg-emerald-100 text-emerald-700",
};

interface CourseDetailModalProps {
  course: Course | null;
  open: boolean;
  onClose: () => void;
  onApply: (course: string) => void;
}

export function CourseDetailModal({
  course,
  open,
  onClose,
  onApply,
}: CourseDetailModalProps) {
  if (!course) return null;
  const Icon = getCourseIcon(course.icon);
  const categoryColor =
    CATEGORY_COLORS[course.category] ?? "bg-gray-100 text-gray-700";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            data-ocid="course_detail.dialog"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-br from-brand-blue to-[oklch(0.52_0.19_252)] p-6 text-white relative">
                <button
                  type="button"
                  onClick={onClose}
                  data-ocid="course_detail.close_button"
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${categoryColor}`}
                    >
                      {course.category}
                    </span>
                    <h2 className="text-xl font-extrabold leading-tight">
                      {course.title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <ScrollArea className="flex-1 max-h-[55vh]">
                <div className="p-6 space-y-6">
                  {/* Description */}
                  <div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Duration + Fees */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4.5 h-4.5 text-brand-blue" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                          Duration
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {course.duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                        <Tag className="w-4.5 h-4.5 text-brand-blue" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                          Fees
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {course.fees}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {course.skills && course.skills.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 rounded-full bg-brand-blue inline-block" />
                        Skills You'll Learn
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {course.skills.map((skill) => (
                          <Badge
                            key={skill}
                            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-medium text-xs px-3 py-1 rounded-full"
                            variant="outline"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Career Opportunities */}
                  {course.careerOpportunities &&
                    course.careerOpportunities.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                          <span className="w-1 h-4 rounded-full bg-emerald-500 inline-block" />
                          <Briefcase className="w-4 h-4 text-emerald-600" />
                          Career Opportunities
                        </h3>
                        <ul className="space-y-2">
                          {course.careerOpportunities.map((opp) => (
                            <li
                              key={opp}
                              className="flex items-center gap-2.5 text-sm text-foreground"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              {opp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="p-5 border-t border-border bg-white">
                <Button
                  onClick={() => {
                    onApply(course.title);
                    onClose();
                  }}
                  data-ocid="course_detail.primary_button"
                  className="w-full bg-brand-blue hover:bg-[oklch(0.52_0.19_252)] text-white font-bold rounded-xl h-12 text-base shadow-md"
                >
                  Apply Now
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
