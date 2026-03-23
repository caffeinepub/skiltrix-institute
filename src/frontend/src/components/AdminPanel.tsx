import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useApproveApplication,
  useGetAllApplications,
  useGetAnalytics,
  useIsCallerAdmin,
  useIssueCertificate,
  useRejectApplication,
} from "@/hooks/useQueries";
import {
  ArrowLeft,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Loader2,
  Lock,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Application } from "../backend.d";
import { Status } from "../backend.d";

type FilterTab = "all" | Status;

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];
const BRAND_BLUE = "#0B5ED7";

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

function ApplicationRow({ app, index }: { app: Application; index: number }) {
  const approve = useApproveApplication();
  const reject = useRejectApplication();
  const issueCert = useIssueCertificate();
  const isActing = approve.isPending || reject.isPending || issueCert.isPending;

  const canIssueCert = app.status === Status.approved && !app.certificateIssued;

  return (
    <TableRow data-ocid={`admin.item.${index}`}>
      <TableCell className="font-semibold">{app.name}</TableCell>
      <TableCell className="text-sm">{app.course}</TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {app.phone}
      </TableCell>
      <TableCell>
        <StatusBadge status={app.status} />
      </TableCell>
      <TableCell>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            disabled={app.status === Status.approved || isActing}
            onClick={() => approve.mutate(app.applicationId)}
            data-ocid={`admin.confirm_button.${index}`}
            className="text-white h-7 px-3 text-xs rounded-full disabled:opacity-40"
            style={{ backgroundColor: BRAND_BLUE }}
          >
            {approve.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Approve"
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={app.status === Status.rejected || isActing}
            onClick={() => reject.mutate(app.applicationId)}
            data-ocid={`admin.delete_button.${index}`}
            className="h-7 px-3 text-xs rounded-full disabled:opacity-40"
          >
            {reject.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Reject"
            )}
          </Button>
          {canIssueCert && (
            <Button
              size="sm"
              disabled={isActing}
              onClick={() => issueCert.mutate(app.applicationId)}
              data-ocid={`admin.secondary_button.${index}`}
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
        </div>
      </TableCell>
    </TableRow>
  );
}

function AdminContent() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const { data: applications = [], isLoading } = useGetAllApplications();
  const { data: analytics } = useGetAnalytics();

  const visitors = analytics ? Number(analytics.visitors) : 0;
  const formSubmissions = analytics ? Number(analytics.formSubmissions) : 0;
  const conversionRate =
    visitors > 0 ? ((formSubmissions / visitors) * 100).toFixed(1) : "0.0";

  const filtered =
    filter === "all"
      ? applications
      : applications.filter((a) => a.status === filter);
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

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_257)] font-sans">
      <header className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-foreground">
                SKILTRIX Admin Panel
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage student applications
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.hash = "";
            }}
            data-ocid="admin.secondary_button"
            className="rounded-full gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Site
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Analytics Section */}
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

        {/* Application Stats */}
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
          <div className="px-6 pt-5 pb-0 border-b border-border">
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as FilterTab)}
            >
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
          ) : filtered.length === 0 ? (
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
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((app, i) => (
                    <ApplicationRow
                      key={app.applicationId}
                      app={app}
                      index={i + 1}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export function AdminPanel() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[oklch(0.97_0.01_257)] flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-border shadow-lg p-10 max-w-sm w-full text-center"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "rgba(11,94,215,0.1)" }}
          >
            <Lock className="h-7 w-7" style={{ color: BRAND_BLUE }} />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-2">
            Admin Access
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in to access the SKILTRIX admin panel and manage student
            applications.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="admin.primary_button"
            className="w-full text-white rounded-full font-semibold h-11"
            style={{ backgroundColor: BRAND_BLUE }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              window.location.hash = "";
            }}
            data-ocid="admin.cancel_button"
            className="w-full mt-2 rounded-full text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Site
          </Button>
        </motion.div>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div
        data-ocid="admin.loading_state"
        className="min-h-screen flex items-center justify-center bg-[oklch(0.97_0.01_257)]"
      >
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: BRAND_BLUE }}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[oklch(0.97_0.01_257)] flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-border shadow-lg p-10 max-w-sm w-full text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <XCircle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your account does not have administrator privileges. Contact the
            system administrator for access.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              window.location.hash = "";
            }}
            data-ocid="admin.cancel_button"
            className="w-full rounded-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Site
          </Button>
        </motion.div>
      </div>
    );
  }

  return <AdminContent />;
}
