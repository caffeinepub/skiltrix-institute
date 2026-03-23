import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddCourse,
  useAddReviewByAdmin,
  useApproveApplication,
  useCreateSubAdmin,
  useDeleteCourse,
  useDeleteReview,
  useDeleteSubAdmin,
  useGetAllApplications,
  useGetAnalytics,
  useGetApplicationStages,
  useGetCourses,
  useGetReviews,
  useGetSubAdmins,
  useIssueCertificate,
  useIssueIdCard,
  useRejectApplication,
  useSetAdminCredentials,
  useUpdateApplicationStage,
  useUpdateCourse,
  useUpdateReview,
  useVerifyAdminCredentials,
} from "@/hooks/useQueries";
import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit2,
  Eye,
  FileText,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
  X as XIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Course } from "../backend.d";
import { Status } from "../backend.d";

const BRAND_BLUE = "#0B5ED7";
const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

const TRACKING_STAGES = [
  "Application Received",
  "Documents Under Review",
  "Interview Scheduled",
  "Enrolled",
  "Completed",
  "Rejected",
];

type FilterTab = "all" | Status;
type AdminTab = "dashboard" | "courses" | "reviews" | "settings";

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Status }) {
  if (status === Status.approved) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
      </Badge>
    );
  }
  if (status === Status.rejected) {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        <XCircle className="h-3 w-3 mr-1" /> Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
      <Clock className="h-3 w-3 mr-1" /> Pending
    </Badge>
  );
}

function StatCard({
  label,
  value,
  icon,
  accentColor,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-2xl bg-white p-5 flex items-center gap-4 shadow-sm border border-border"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <div className="text-3xl font-extrabold text-foreground">{value}</div>
      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide">
          {label}
        </div>
        <div className="text-muted-foreground mt-0.5">{icon}</div>
      </div>
    </div>
  );
}

function AnalyticsCard({
  label,
  value,
  icon,
  accentColor,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor: string;
  subtitle?: string;
}) {
  return (
    <div
      className="rounded-2xl bg-white p-5 shadow-sm border border-border flex flex-col gap-2"
      style={{ borderTop: `4px solid ${accentColor}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="opacity-60">{icon}</span>
      </div>
      <div className="text-4xl font-extrabold text-foreground leading-none">
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      )}
    </div>
  );
}

// ─── Course Form ─────────────────────────────────────────────────────────────

const EMPTY_COURSE: Course = {
  title: "",
  description: "",
  duration: "",
  fees: "",
  category: "",
  icon: "📚",
  skills: [],
  careerOpportunities: [],
};

function CourseFormDialog({
  initial,
  onSave,
  trigger,
  title,
  isPending,
}: {
  initial?: Course;
  onSave: (c: Course) => void;
  trigger: React.ReactNode;
  title: string;
  isPending?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Course>(initial ?? EMPTY_COURSE);
  const [skillsStr, setSkillsStr] = useState(
    (initial?.skills ?? []).join(", "),
  );
  const [careersStr, setCareersStr] = useState(
    (initial?.careerOpportunities ?? []).join(", "),
  );

  const reset = () => {
    setForm(initial ?? EMPTY_COURSE);
    setSkillsStr((initial?.skills ?? []).join(", "));
    setCareersStr((initial?.careerOpportunities ?? []).join(", "));
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const course: Course = {
      ...form,
      skills: skillsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      careerOpportunities: careersStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    onSave(course);
    setOpen(false);
  };

  const set = (k: keyof Course, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="courses.dialog"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
                placeholder="Web Development"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Duration *</Label>
              <Input
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                required
                placeholder="6 months"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Fees *</Label>
              <Input
                value={form.fees}
                onChange={(e) => set("fees", e.target.value)}
                required
                placeholder="₹15,000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Input
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                required
                placeholder="Technology"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Icon (emoji)</Label>
              <Input
                value={form.icon}
                onChange={(e) => set("icon", e.target.value)}
                placeholder="💻"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
              rows={3}
              placeholder="Course description..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Skills (comma-separated)</Label>
            <Input
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="HTML, CSS, JavaScript"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Career Opportunities (comma-separated)</Label>
            <Input
              value={careersStr}
              onChange={(e) => setCareersStr(e.target.value)}
              placeholder="Web Developer, Freelancer"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="courses.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              style={{ backgroundColor: BRAND_BLUE }}
              className="text-white"
              data-ocid="courses.save_button"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Course
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Courses Tab ─────────────────────────────────────────────────────────────

function CoursesTab() {
  const { data: courses = [], isLoading } = useGetCourses();
  const addCourse = useAddCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Courses</h2>
          <p className="text-sm text-muted-foreground">
            Create, edit, and manage course listings
          </p>
        </div>
        <CourseFormDialog
          title="Add New Course"
          isPending={addCourse.isPending}
          onSave={(c) => addCourse.mutate(c)}
          trigger={
            <Button
              style={{ backgroundColor: BRAND_BLUE }}
              className="text-white rounded-xl gap-2"
              data-ocid="courses.open_modal_button"
            >
              <Plus className="h-4 w-4" /> Add Course
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <div data-ocid="courses.loading_state" className="space-y-3">
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div
          data-ocid="courses.empty_state"
          className="bg-white rounded-2xl border border-border p-12 text-center"
        >
          <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">No courses yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Click "Add Course" to create your first course
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course, i) => (
            <div
              key={course.title}
              data-ocid={`courses.item.${i + 1}`}
              className="bg-white rounded-2xl border border-border p-5 flex items-start justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl mt-0.5">{course.icon || "📚"}</span>
                <div>
                  <div className="font-bold text-foreground">
                    {course.title}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {course.category} · {course.duration} · {course.fees}
                  </div>
                  <p className="text-sm text-muted-foreground/80 mt-1 line-clamp-2">
                    {course.description}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <CourseFormDialog
                  title="Edit Course"
                  initial={course}
                  isPending={updateCourse.isPending}
                  onSave={(c) => updateCourse.mutate(c)}
                  trigger={
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg gap-1.5"
                      data-ocid={`courses.edit_button.${i + 1}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </Button>
                  }
                />
                <Dialog
                  open={deleteTarget === course.title}
                  onOpenChange={(v) => !v && setDeleteTarget(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-lg gap-1.5"
                      data-ocid={`courses.delete_button.${i + 1}`}
                      onClick={() => setDeleteTarget(course.title)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-ocid="courses.dialog">
                    <DialogHeader>
                      <DialogTitle>Delete Course</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground text-sm">
                      Are you sure you want to delete{" "}
                      <strong>{course.title}</strong>? This cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setDeleteTarget(null)}
                        data-ocid="courses.cancel_button"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={deleteCourse.isPending}
                        data-ocid="courses.confirm_button"
                        onClick={() => {
                          deleteCourse.mutate(course.title);
                          setDeleteTarget(null);
                        }}
                      >
                        {deleteCourse.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Delete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({ onLogout }: { onLogout: () => void }) {
  const setCredentials = useSetAdminCredentials();
  const [credForm, setCredForm] = useState({
    oldPassword: "",
    oldMpin: "",
    newEmail: "",
    newPassword: "",
    newMpin: "",
  });
  const [credMsg, setCredMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleCredSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMsg(null);
    try {
      const ok = await setCredentials.mutateAsync(credForm);
      if (ok) {
        setCredMsg({
          type: "success",
          text: "Credentials updated. Please log in again.",
        });
        setTimeout(() => onLogout(), 2000);
      } else {
        setCredMsg({
          type: "error",
          text: "Current password or MPIN is incorrect.",
        });
      }
    } catch {
      setCredMsg({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    }
  };

  // Sub-admin management
  const { data: subAdmins = [], isLoading: loadingSubs } = useGetSubAdmins();
  const createSubAdmin = useCreateSubAdmin();
  const deleteSubAdmin = useDeleteSubAdmin();
  const [subForm, setSubForm] = useState({
    email: "",
    name: "",
    password: "",
    mpin: "",
  });
  const [subMsg, setSubMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteSubTarget, setDeleteSubTarget] = useState<string | null>(null);

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubMsg(null);
    try {
      await createSubAdmin.mutateAsync(subForm);
      setSubMsg({
        type: "success",
        text: `Sub-admin ${subForm.name} created successfully.`,
      });
      setSubForm({ email: "", name: "", password: "", mpin: "" });
    } catch {
      setSubMsg({
        type: "error",
        text: "Failed to create sub-admin. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage credentials and sub-admin accounts
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Change Credentials */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <KeyRound className="h-5 w-5" style={{ color: BRAND_BLUE }} />
            <h3 className="font-bold text-foreground">Change Credentials</h3>
          </div>
          <form onSubmit={handleCredSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={credForm.oldPassword}
                onChange={(e) =>
                  setCredForm((p) => ({ ...p, oldPassword: e.target.value }))
                }
                required
                placeholder="Current password"
                data-ocid="settings.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Current MPIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={credForm.oldMpin}
                onChange={(e) =>
                  setCredForm((p) => ({
                    ...p,
                    oldMpin: e.target.value.replace(/\D/g, "").slice(0, 6),
                  }))
                }
                required
                placeholder="Current MPIN"
                data-ocid="settings.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>New Email</Label>
              <Input
                type="email"
                value={credForm.newEmail}
                onChange={(e) =>
                  setCredForm((p) => ({ ...p, newEmail: e.target.value }))
                }
                required
                placeholder="new@email.com"
                data-ocid="settings.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input
                type="password"
                value={credForm.newPassword}
                onChange={(e) =>
                  setCredForm((p) => ({ ...p, newPassword: e.target.value }))
                }
                required
                placeholder="New password"
                data-ocid="settings.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>New MPIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={credForm.newMpin}
                onChange={(e) =>
                  setCredForm((p) => ({
                    ...p,
                    newMpin: e.target.value.replace(/\D/g, "").slice(0, 6),
                  }))
                }
                required
                placeholder="New MPIN (4-6 digits)"
                data-ocid="settings.input"
              />
            </div>
            {credMsg && (
              <div
                data-ocid={
                  credMsg.type === "success"
                    ? "settings.success_state"
                    : "settings.error_state"
                }
                className={`rounded-xl px-4 py-3 text-sm flex items-start gap-2 ${
                  credMsg.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {credMsg.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                )}
                {credMsg.text}
              </div>
            )}
            <Button
              type="submit"
              disabled={setCredentials.isPending}
              style={{ backgroundColor: BRAND_BLUE }}
              className="w-full text-white rounded-xl"
              data-ocid="settings.submit_button"
            >
              {setCredentials.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Update Credentials
            </Button>
          </form>
        </div>

        {/* Sub-Admin Management */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" style={{ color: BRAND_BLUE }} />
            <h3 className="font-bold text-foreground">Sub-Admin Management</h3>
          </div>

          {/* Existing sub-admins */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Current Sub-Admins
            </p>
            {loadingSubs ? (
              <div data-ocid="subadmins.loading_state" className="space-y-2">
                {["sa-1", "sa-2"].map((k) => (
                  <Skeleton key={k} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : subAdmins.length === 0 ? (
              <div
                data-ocid="subadmins.empty_state"
                className="text-sm text-muted-foreground py-3 text-center bg-muted/30 rounded-xl"
              >
                No sub-admins yet
              </div>
            ) : (
              <div className="space-y-2">
                {subAdmins.map((sa, i) => (
                  <div
                    key={sa.email}
                    data-ocid={`subadmins.item.${i + 1}`}
                    className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-2.5"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {sa.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sa.email}
                      </div>
                    </div>
                    <Dialog
                      open={deleteSubTarget === sa.email}
                      onOpenChange={(v) => !v && setDeleteSubTarget(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          data-ocid={`subadmins.delete_button.${i + 1}`}
                          onClick={() => setDeleteSubTarget(sa.email)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent data-ocid="subadmins.dialog">
                        <DialogHeader>
                          <DialogTitle>Remove Sub-Admin</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                          Remove <strong>{sa.name}</strong> ({sa.email}) from
                          sub-admins?
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="outline"
                            onClick={() => setDeleteSubTarget(null)}
                            data-ocid="subadmins.cancel_button"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            disabled={deleteSubAdmin.isPending}
                            data-ocid="subadmins.confirm_button"
                            onClick={() => {
                              deleteSubAdmin.mutate(sa.email);
                              setDeleteSubTarget(null);
                            }}
                          >
                            {deleteSubAdmin.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Remove
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add sub-admin form */}
          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Add Sub-Admin
            </p>
            <form onSubmit={handleSubSubmit} className="space-y-3">
              <Input
                placeholder="Full Name *"
                value={subForm.name}
                onChange={(e) =>
                  setSubForm((p) => ({ ...p, name: e.target.value }))
                }
                required
                data-ocid="subadmins.input"
              />
              <Input
                type="email"
                placeholder="Email *"
                value={subForm.email}
                onChange={(e) =>
                  setSubForm((p) => ({ ...p, email: e.target.value }))
                }
                required
                data-ocid="subadmins.input"
              />
              <Input
                type="password"
                placeholder="Password *"
                value={subForm.password}
                onChange={(e) =>
                  setSubForm((p) => ({ ...p, password: e.target.value }))
                }
                required
                data-ocid="subadmins.input"
              />
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="MPIN (4-6 digits) *"
                value={subForm.mpin}
                onChange={(e) =>
                  setSubForm((p) => ({
                    ...p,
                    mpin: e.target.value.replace(/\D/g, "").slice(0, 6),
                  }))
                }
                required
                data-ocid="subadmins.input"
              />
              {subMsg && (
                <div
                  data-ocid={
                    subMsg.type === "success"
                      ? "subadmins.success_state"
                      : "subadmins.error_state"
                  }
                  className={`rounded-xl px-4 py-3 text-sm flex items-start gap-2 ${
                    subMsg.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {subMsg.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  )}
                  {subMsg.text}
                </div>
              )}
              <Button
                type="submit"
                disabled={createSubAdmin.isPending}
                style={{ backgroundColor: BRAND_BLUE }}
                className="w-full text-white rounded-xl gap-2"
                data-ocid="subadmins.submit_button"
              >
                {createSubAdmin.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Create Sub-Admin
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: applications = [], isLoading } = useGetAllApplications();
  const { data: stages = [] } = useGetApplicationStages();
  const { data: analytics } = useGetAnalytics();
  const approveApp = useApproveApplication();
  const rejectApp = useRejectApplication();
  const issueCert = useIssueCertificate();
  const issueIdCard = useIssueIdCard();
  const updateStage = useUpdateApplicationStage();

  const stageMap = new Map<string, string>(
    stages.map((s) => [s.applicationId, s.stage]),
  );

  const visitors = analytics ? Number(analytics.visitors) : 0;
  const formSubmissions = analytics ? Number(analytics.formSubmissions) : 0;
  const conversionRate =
    visitors > 0 ? ((formSubmissions / visitors) * 100).toFixed(1) : "0.0";

  const total = applications.length;
  const pending = applications.filter(
    (a) => a.status === Status.pending,
  ).length;
  const approved = applications.filter(
    (a) => a.status === Status.approved,
  ).length;
  const rejected = applications.filter(
    (a) => a.status === Status.rejected,
  ).length;

  const filtered =
    filter === "all"
      ? applications
      : applications.filter((a) => a.status === filter);

  const searchFiltered = searchQuery.trim()
    ? filtered.filter(
        (a) =>
          a.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : filtered;

  return (
    <div className="space-y-8">
      {/* Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5" style={{ color: BRAND_BLUE }} />
          <h2 className="text-base font-bold text-foreground">
            Website Analytics
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AnalyticsCard
            label="Visitors"
            value={visitors.toLocaleString()}
            icon={<Eye className="h-5 w-5" style={{ color: BRAND_BLUE }} />}
            accentColor={BRAND_BLUE}
            subtitle="Total public page visits"
          />
          <AnalyticsCard
            label="Form Submissions"
            value={formSubmissions.toLocaleString()}
            icon={<FileText className="h-5 w-5 text-indigo-500" />}
            accentColor="#6366f1"
            subtitle="Total applications submitted"
          />
          <AnalyticsCard
            label="Conversion Rate"
            value={`${conversionRate}%`}
            icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
            accentColor="#10b981"
            subtitle="Submissions per visitor"
          />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5" style={{ color: BRAND_BLUE }} />
          <h2 className="text-base font-bold text-foreground">
            Application Stats
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total"
            value={total}
            icon={<Users className="h-4 w-4" style={{ color: BRAND_BLUE }} />}
            accentColor={BRAND_BLUE}
          />
          <StatCard
            label="Pending"
            value={pending}
            icon={<Clock className="h-4 w-4 text-amber-500" />}
            accentColor="#f59e0b"
          />
          <StatCard
            label="Approved"
            value={approved}
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            accentColor="#10b981"
          />
          <StatCard
            label="Rejected"
            value={rejected}
            icon={<XCircle className="h-4 w-4 text-red-500" />}
            accentColor="#ef4444"
          />
        </div>
      </motion.div>

      {/* Applications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        <div className="px-6 pt-5 pb-3 border-b border-border space-y-3">
          {/* Search bar */}
          <div className="relative flex items-center gap-2">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Application ID or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-ocid="admin.search_input"
              className="w-full pl-9 pr-10 h-9 rounded-full border border-border bg-muted/40 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {searchQuery.trim() && (
            <p className="text-xs text-muted-foreground px-1">
              Showing {searchFiltered.length} of {filtered.length} applications
            </p>
          )}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
            <TabsList className="bg-muted/60 rounded-full h-9">
              <TabsTrigger
                value="all"
                data-ocid="admin.tab"
                className="rounded-full text-xs px-4"
              >
                All ({total})
              </TabsTrigger>
              <TabsTrigger
                value={Status.pending}
                data-ocid="admin.tab"
                className="rounded-full text-xs px-4"
              >
                Pending ({pending})
              </TabsTrigger>
              <TabsTrigger
                value={Status.approved}
                data-ocid="admin.tab"
                className="rounded-full text-xs px-4"
              >
                Approved ({approved})
              </TabsTrigger>
              <TabsTrigger
                value={Status.rejected}
                data-ocid="admin.tab"
                className="rounded-full text-xs px-4"
              >
                Rejected ({rejected})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div data-ocid="admin.loading_state" className="p-6 space-y-3">
            {SKELETON_KEYS.map((key) => (
              <Skeleton key={key} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : searchFiltered.length === 0 ? (
          <div data-ocid="admin.empty_state" className="py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              No applications found
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Applications will appear here once submitted
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="admin.table">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Course</TableHead>
                  <TableHead className="font-semibold">Phone</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Address</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">
                    Tracking Stage
                  </TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchFiltered.map((app, i) => {
                  const currentStage = stageMap.get(app.applicationId) ?? "";
                  const isActing =
                    approveApp.isPending ||
                    rejectApp.isPending ||
                    issueCert.isPending;
                  const canIssueCert =
                    app.status === Status.approved && !app.certificateIssued;
                  return (
                    <TableRow
                      key={app.applicationId}
                      data-ocid={`admin.item.${i + 1}`}
                    >
                      <TableCell className="font-semibold whitespace-nowrap">
                        {app.name}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {app.course}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {app.phone}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {app.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[120px] truncate">
                        {app.address}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {app.date}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={app.status} />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={currentStage || "none"}
                          onValueChange={(v) => {
                            if (v !== "none")
                              updateStage.mutate({
                                applicationId: app.applicationId,
                                stage: v,
                              });
                          }}
                        >
                          <SelectTrigger
                            className="h-8 text-xs w-44"
                            data-ocid={`admin.select.${i + 1}`}
                          >
                            <SelectValue placeholder="Set stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" disabled>
                              Set stage...
                            </SelectItem>
                            {TRACKING_STAGES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            disabled={
                              app.status === Status.approved || isActing
                            }
                            onClick={() => approveApp.mutate(app.applicationId)}
                            data-ocid={`admin.confirm_button.${i + 1}`}
                            className="text-white h-7 px-3 text-xs rounded-full disabled:opacity-40"
                            style={{ backgroundColor: BRAND_BLUE }}
                          >
                            {approveApp.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={
                              app.status === Status.rejected || isActing
                            }
                            onClick={() => rejectApp.mutate(app.applicationId)}
                            data-ocid={`admin.delete_button.${i + 1}`}
                            className="h-7 px-3 text-xs rounded-full disabled:opacity-40"
                          >
                            {rejectApp.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Reject"
                            )}
                          </Button>
                          {canIssueCert && (
                            <Button
                              size="sm"
                              disabled={isActing}
                              onClick={() =>
                                issueCert.mutate(app.applicationId)
                              }
                              data-ocid={`admin.secondary_button.${i + 1}`}
                              className="bg-amber-500 hover:bg-amber-600 text-white h-7 px-3 text-xs rounded-full disabled:opacity-40 gap-1"
                            >
                              {issueCert.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Award className="h-3 w-3" /> Issue Cert
                                </>
                              )}
                            </Button>
                          )}
                          {app.certificateIssued && (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs px-2 h-7 flex items-center gap-1">
                              <Award className="h-3 w-3" /> Cert Issued
                            </Badge>
                          )}
                          {app.status === Status.approved && (
                            <Button
                              size="sm"
                              disabled={issueIdCard.isPending}
                              onClick={() =>
                                issueIdCard.mutate(app.applicationId, {
                                  onSuccess: () => {
                                    // toast is shown in the UI via success state
                                  },
                                })
                              }
                              data-ocid={`admin.edit_button.${i + 1}`}
                              className="bg-orange-500 hover:bg-orange-600 text-white h-7 px-3 text-xs rounded-full gap-1"
                            >
                              {issueIdCard.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <CreditCard className="h-3 w-3" /> Issue ID
                                  Card
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Reviews Tab ─────────────────────────────────────────────────────────────

import type { Review, ReviewInput } from "../backend.d";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={s <= rating ? "text-amber-400" : "text-gray-200"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function ReviewFormFields({
  value,
  onChange,
}: {
  value: ReviewInput;
  onChange: (v: ReviewInput) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="rv-name">Name</Label>
        <Input
          id="rv-name"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="Reviewer name"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="rv-email">Email</Label>
        <Input
          id="rv-email"
          type="email"
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          placeholder="email@example.com"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="rv-course">Course</Label>
        <Input
          id="rv-course"
          value={value.course}
          onChange={(e) => onChange({ ...value, course: e.target.value })}
          placeholder="Course name"
          className="mt-1"
        />
      </div>
      <div>
        <Label>Rating</Label>
        <div className="flex gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange({ ...value, rating: BigInt(star) })}
              className={`text-2xl transition-colors ${Number(value.rating) >= star ? "text-amber-400" : "text-gray-300"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="rv-feedback">Feedback</Label>
        <Textarea
          id="rv-feedback"
          value={value.feedback}
          onChange={(e) => onChange({ ...value, feedback: e.target.value })}
          rows={3}
          placeholder="Share the student's experience..."
          className="mt-1 resize-none"
        />
      </div>
    </div>
  );
}

const EMPTY_REVIEW_INPUT: ReviewInput = {
  name: "",
  email: "",
  course: "",
  feedback: "",
  rating: BigInt(5),
};

function ReviewsTab() {
  const { data: reviews = [], isLoading } = useGetReviews();
  const addReview = useAddReviewByAdmin();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<ReviewInput>(EMPTY_REVIEW_INPUT);
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [editForm, setEditForm] = useState<ReviewInput>(EMPTY_REVIEW_INPUT);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!addForm.name || !addForm.email || !addForm.feedback) return;
    await addReview.mutateAsync(addForm);
    setAddOpen(false);
    setAddForm(EMPTY_REVIEW_INPUT);
  };

  const handleEdit = async () => {
    if (!editReview) return;
    await updateReview.mutateAsync({ id: editReview.id, input: editForm });
    setEditReview(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteReview.mutateAsync(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Reviews</h2>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-2"
              style={{ backgroundColor: BRAND_BLUE }}
              data-ocid="admin.reviews.open_modal_button"
            >
              <Plus className="h-4 w-4" /> Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" data-ocid="admin.reviews.dialog">
            <DialogHeader>
              <DialogTitle>Add Review</DialogTitle>
            </DialogHeader>
            <ReviewFormFields value={addForm} onChange={setAddForm} />
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setAddOpen(false)}
                data-ocid="admin.reviews.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: BRAND_BLUE }}
                onClick={handleAdd}
                disabled={addReview.isPending}
                data-ocid="admin.reviews.confirm_button"
              >
                {addReview.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Add Review
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div data-ocid="admin.reviews.loading_state" className="space-y-3">
          {SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div
          data-ocid="admin.reviews.empty_state"
          className="py-16 text-center"
        >
          <p className="text-muted-foreground">
            No reviews yet. Add the first one!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Course</TableHead>
                <TableHead className="hidden lg:table-cell">Feedback</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((r) => (
                <TableRow key={r.id} data-ocid={"admin.reviews.row" as const}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {r.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {r.course}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm max-w-48 truncate text-muted-foreground">
                    {r.feedback}
                  </TableCell>
                  <TableCell>
                    <StarDisplay rating={Number(r.rating)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditReview(r);
                          setEditForm({
                            name: r.name,
                            email: r.email,
                            course: r.course,
                            feedback: r.feedback,
                            rating: r.rating,
                          });
                        }}
                        data-ocid="admin.reviews.edit_button"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setDeleteTarget(r.id)}
                        data-ocid="admin.reviews.delete_button"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editReview}
        onOpenChange={(v) => {
          if (!v) setEditReview(null);
        }}
      >
        <DialogContent
          className="max-w-md"
          data-ocid="admin.reviews.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <ReviewFormFields value={editForm} onChange={setEditForm} />
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEditReview(null)}
              data-ocid="admin.reviews.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              style={{ backgroundColor: BRAND_BLUE }}
              onClick={handleEdit}
              disabled={updateReview.isPending}
              data-ocid="admin.reviews.edit.confirm_button"
            >
              {updateReview.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
      >
        <DialogContent
          className="max-w-sm"
          data-ocid="admin.reviews.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Are you sure you want to delete this review? This action cannot be
            undone.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
              data-ocid="admin.reviews.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={deleteReview.isPending}
              data-ocid="admin.reviews.delete.confirm_button"
            >
              {deleteReview.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Admin Content (tabs layout) ─────────────────────────────────────────────

function AdminContent({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_257)] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-extrabold text-foreground leading-none">
                SKILTRIX Admin
              </h1>
              <p className="text-xs text-muted-foreground">Management Panel</p>
            </div>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1">
            {(
              [
                { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                { id: "courses", label: "Courses", icon: BookOpen },
                { id: "reviews", label: "Reviews", icon: FileText },
                { id: "settings", label: "Settings", icon: Settings },
              ] as {
                id: AdminTab;
                label: string;
                icon: React.ComponentType<{ className?: string }>;
              }[]
            ).map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-ocid={`admin.${tab.id}.tab`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                style={
                  activeTab === tab.id ? { backgroundColor: BRAND_BLUE } : {}
                }
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.hash = "";
              }}
              data-ocid="admin.secondary_button"
              className="rounded-full gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Site</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              data-ocid="admin.close_button"
              className="rounded-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "courses" && <CoursesTab />}
        {activeTab === "reviews" && <ReviewsTab />}
        {activeTab === "settings" && <SettingsTab onLogout={onLogout} />}
      </main>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

export function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem("adminSession") === "true",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mpin, setMpin] = useState("");
  const [loginError, setLoginError] = useState("");
  const verify = useVerifyAdminCredentials();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const ok = await verify.mutateAsync({ email, password, mpin });
      if (ok) {
        sessionStorage.setItem("adminSession", "true");
        sessionStorage.setItem("adminEmail", email);
        setIsLoggedIn(true);
      } else {
        setLoginError(
          "Invalid credentials. Please check your email, password, and MPIN.",
        );
      }
    } catch {
      setLoginError("Something went wrong. Please try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminSession");
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    setMpin("");
    setLoginError("");
  };

  if (isLoggedIn) {
    return <AdminContent onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_257)] flex items-center justify-center font-sans px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-border shadow-lg p-8 max-w-sm w-full"
      >
        <div className="text-center mb-7">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(11,94,215,0.1)" }}
          >
            <Lock className="h-7 w-7" style={{ color: BRAND_BLUE }} />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">
            Admin Access
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to manage SKILTRIX
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin-email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@skiltrix.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              data-ocid="admin.input"
              className="rounded-xl h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              data-ocid="admin.input"
              className="rounded-xl h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="admin-mpin"
              className="text-sm font-medium flex items-center gap-1.5"
            >
              <KeyRound className="h-3.5 w-3.5" style={{ color: BRAND_BLUE }} />
              MPIN
            </Label>
            <Input
              id="admin-mpin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="••••••"
              value={mpin}
              onChange={(e) =>
                setMpin(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              autoComplete="off"
              data-ocid="admin.input"
              className="rounded-xl h-10 tracking-[0.4em] font-mono text-center"
            />
            <p className="text-xs text-muted-foreground">
              4-6 digit numeric PIN
            </p>
          </div>

          {loginError && (
            <div
              data-ocid="admin.error_state"
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2"
            >
              <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {loginError}
            </div>
          )}

          <Button
            type="submit"
            disabled={verify.isPending}
            data-ocid="admin.submit_button"
            className="w-full text-white rounded-full font-semibold h-11 mt-1"
            style={{ backgroundColor: BRAND_BLUE }}
          >
            {verify.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <Button
          variant="ghost"
          onClick={() => {
            window.location.hash = "";
          }}
          data-ocid="admin.cancel_button"
          className="w-full mt-3 rounded-full text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Site
        </Button>
      </motion.div>
    </div>
  );
}
