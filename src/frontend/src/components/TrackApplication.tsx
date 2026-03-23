import type { Application } from "@/backend";
import { Status } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import {
  CalendarDays,
  GraduationCap,
  Loader2,
  Search,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

function getStatusLabel(status: Status): "Pending" | "Approved" | "Rejected" {
  if (status === Status.approved) return "Approved";
  if (status === Status.rejected) return "Rejected";
  return "Pending";
}

function StatusBadge({ status }: { status: Status }) {
  const label = getStatusLabel(status);
  const styles = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Approved: "bg-green-100 text-green-800 border-green-200",
    Rejected: "bg-red-100 text-red-800 border-red-200",
  };
  const dots = {
    Pending: "bg-yellow-500",
    Approved: "bg-green-500",
    Rejected: "bg-red-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${styles[label]}`}
      data-ocid="track.success_state"
    >
      <span className={`w-2 h-2 rounded-full ${dots[label]}`} />
      {label}
    </span>
  );
}

export function TrackApplication() {
  const { actor, isFetching: actorLoading } = useActor();
  const [applicationId, setApplicationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Application | null | undefined>(
    undefined,
  );

  const goHome = () => {
    window.location.href = window.location.pathname;
  };

  const handleTrack = async () => {
    const trimmedId = applicationId.trim();
    if (!trimmedId || !actor) return;
    setLoading(true);
    setResult(undefined);
    try {
      const applications = await actor.getAllApplications();
      const found = applications.find(
        (app) => app.applicationId.toLowerCase() === trimmedId.toLowerCase(),
      );
      setResult(found ?? null);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white font-sans">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={goHome}
              className="flex items-center gap-2"
              data-ocid="nav.link"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
                <span className="text-white font-bold text-sm">SK</span>
              </div>
              <span className="text-xl font-bold">
                <span className="text-foreground">SKIL</span>
                <span className="text-brand-blue">TRIX</span>
              </span>
            </button>
            <span className="text-sm text-muted-foreground hidden sm:block">
              Track your application status
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goHome}
              data-ocid="nav.link"
              className="text-brand-blue border-brand-blue/40 hover:bg-brand-blue hover:text-white"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-8 py-16 max-w-2xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-blue/10 mb-4">
            <Search className="w-8 h-8 text-brand-blue" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Track Your Application
          </h1>
          <p className="text-muted-foreground text-base">
            Enter your Application ID to check your admission status.
          </p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-lg border-border/60 mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="appId"
                    className="text-sm font-semibold text-foreground"
                  >
                    Application ID
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      id="appId"
                      data-ocid="track.input"
                      placeholder="e.g. APP-2024-001"
                      value={applicationId}
                      onChange={(e) => setApplicationId(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                      className="flex-1 border-border focus-visible:ring-brand-blue"
                    />
                    <Button
                      data-ocid="track.primary_button"
                      onClick={handleTrack}
                      disabled={
                        loading ||
                        actorLoading ||
                        !applicationId.trim() ||
                        !actor
                      }
                      className="bg-brand-blue hover:bg-[oklch(0.52_0.19_252)] text-white px-6 font-semibold shrink-0"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      <span className="ml-2">
                        {loading ? "Searching..." : "Track"}
                      </span>
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your Application ID was provided on your admission receipt
                  after submitting your application.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
              data-ocid="track.loading_state"
            >
              <Loader2 className="w-8 h-8 animate-spin text-brand-blue mx-auto mb-3" />
              <p className="text-muted-foreground">
                Looking up your application...
              </p>
            </motion.div>
          )}

          {/* Not Found */}
          {!loading && result === null && (
            <motion.div
              key="notfound"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              data-ocid="track.error_state"
            >
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-1">
                    Application Not Found
                  </h3>
                  <p className="text-red-600 text-sm">
                    No application found with ID{" "}
                    <strong>{applicationId}</strong>. Please double-check your
                    Application ID from your receipt.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Result Card */}
          {!loading && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="shadow-lg border-border/60 overflow-hidden">
                <div className="h-1.5 bg-brand-blue" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                        Application ID
                      </p>
                      <p
                        className="text-lg font-bold text-brand-blue font-mono"
                        data-ocid="track.card"
                      >
                        {result.applicationId}
                      </p>
                    </div>
                    <StatusBadge status={result.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-border/40">
                      <User className="w-4 h-4 text-brand-blue mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">
                          Applicant Name
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {result.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-border/40">
                      <GraduationCap className="w-4 h-4 text-brand-blue mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">
                          Course
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {result.course}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-border/40">
                      <CalendarDays className="w-4 h-4 text-brand-blue mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">
                          Date Applied
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {result.date}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-lg border border-border/40 bg-slate-50">
                    <p className="text-xs text-muted-foreground">
                      {result.status === Status.approved &&
                        "🎉 Congratulations! Your application has been approved. Please visit the Student Dashboard for next steps."}
                      {result.status === Status.rejected &&
                        "We regret to inform you that your application was not successful at this time. Please contact admissions for more information."}
                      {result.status === Status.pending &&
                        "⏳ Your application is currently under review. We will notify you once a decision has been made. Please check back later."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
