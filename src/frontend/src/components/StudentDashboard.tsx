import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useCreateCheckoutSession,
  useGetApplicationByEmail,
  useGetIdCardByEmail,
  useGetStripeSessionStatus,
  useIsStripeConfigured,
  useUpdatePaymentStatus,
} from "@/hooks/useQueries";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Printer,
  Search,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Application, IdCardData } from "../backend.d";
import { PaymentStatus, Status } from "../backend.d";
import { CertificateModal } from "./CertificateModal";

function StatusBadge({ status }: { status: Status }) {
  if (status === Status.approved) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-sm px-3 py-1">
        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approved
      </Badge>
    );
  }
  if (status === Status.rejected) {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 text-sm px-3 py-1">
        <XCircle className="h-3.5 w-3.5 mr-1.5" /> Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-sm px-3 py-1">
      <Clock className="h-3.5 w-3.5 mr-1.5" /> Pending Review
    </Badge>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  if (status === PaymentStatus.paid) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-sm px-3 py-1">
        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Paid
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100 text-sm px-3 py-1">
      <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Unpaid
    </Badge>
  );
}

function StudentIdCard({ idCard }: { idCard: IdCardData }) {
  const [pinVisible, setPinVisible] = useState(false);

  const handlePrint = () => {
    const printContent = document.getElementById("skiltrix-id-card");
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SKILTRIX ID Card - ${idCard.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          body { margin: 0; padding: 20px; background: #f0f4ff; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; }
          .card { width: 380px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(11,41,82,0.25); }
          .card-header { background: linear-gradient(135deg, #0B2952 0%, #0B5ED7 100%); padding: 20px 24px 16px; color: white; display: flex; align-items: center; gap: 12px; }
          .academy-title { font-size: 18px; font-weight: 800; letter-spacing: 0.06em; line-height: 1.1; }
          .card-subtitle { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.8; margin-top: 2px; }
          .shield { width: 36px; height: 36px; background: rgba(255,255,255,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
          .card-body { background: white; padding: 20px 24px; }
          .photo-area { width: 68px; height: 68px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 28px; color: #9ca3af; }
          .field { margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
          .field-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; font-weight: 600; }
          .field-value { font-size: 13px; font-weight: 700; color: #111827; text-align: right; }
          .name-display { text-align: center; font-size: 18px; font-weight: 800; color: #0B2952; margin-bottom: 16px; }
          .pin-field { background: #eff6ff; border: 1px dashed #93c5fd; border-radius: 8px; padding: 8px 12px; text-align: center; margin-top: 8px; }
          .pin-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; }
          .pin-value { font-size: 16px; font-weight: 800; color: #0B5ED7; font-family: monospace; letter-spacing: 0.2em; }
          .card-footer { background: linear-gradient(135deg, #0B2952 0%, #1e40af 100%); padding: 10px 24px; }
          .validity { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.8); text-align: center; margin-bottom: 4px; }
          .barcode { display: flex; gap: 2px; justify-content: center; }
          .bar { width: 2px; background: rgba(255,255,255,0.6); }
          .divider { border: none; border-top: 1px solid #f3f4f6; margin: 10px 0; }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const barHeights = [
    20, 28, 16, 32, 20, 12, 28, 20, 16, 28, 12, 24, 20, 28, 16, 20, 32, 12, 24,
    28,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      data-ocid="dashboard.id_card"
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-blue-600" />
        <h3 className="text-base font-bold text-foreground">
          Your Student ID Card
        </h3>
      </div>

      {/* The printable card */}
      <div id="skiltrix-id-card" className="max-w-[380px] mx-auto">
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ boxShadow: "0 16px 48px rgba(11,41,82,0.22)" }}
        >
          {/* Header */}
          <div
            className="px-6 py-5 text-white"
            style={{
              background: "linear-gradient(135deg, #0B2952 0%, #0B5ED7 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-extrabold tracking-wide leading-tight">
                  SKILTRIX ACADEMY
                </div>
                <div className="text-[10px] tracking-[0.14em] uppercase opacity-80 mt-0.5">
                  Student Identity Card
                </div>
              </div>
            </div>
          </div>

          {/* Gold strip */}
          <div
            className="h-1"
            style={{
              background:
                "linear-gradient(90deg, transparent, #f59e0b, #fbbf24, #f59e0b, transparent)",
            }}
          />

          {/* Body */}
          <div className="bg-white px-6 py-5">
            {/* Photo placeholder */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-blue-100 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            {/* Name */}
            <p className="text-center text-[17px] font-extrabold text-[#0B2952] mb-4">
              {idCard.name}
            </p>

            {/* Fields */}
            <div className="space-y-2.5">
              {[
                { label: "Roll No", value: idCard.rollNo },
                { label: "Reg. No", value: idCard.registrationNumber },
                { label: "Course", value: idCard.course },
                { label: "Email", value: idCard.email },
                { label: "Contact", value: idCard.phone },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex justify-between items-center border-b border-gray-100 pb-2"
                >
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                    {f.label}
                  </span>
                  <span className="text-xs font-bold text-gray-800 text-right max-w-[200px] truncate">
                    {f.value}
                  </span>
                </div>
              ))}
            </div>

            {/* PIN */}
            <div className="mt-4 bg-blue-50 border border-dashed border-blue-200 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">
                    Security PIN
                  </p>
                  <p className="font-mono font-extrabold text-blue-700 tracking-[0.2em] text-lg">
                    {pinVisible ? idCard.pin : "••••"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPinVisible((v) => !v)}
                  data-ocid="dashboard.toggle"
                  className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold bg-white border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-50 transition-colors"
                >
                  {pinVisible ? (
                    <>
                      <EyeOff className="h-3 w-3" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" /> Reveal PIN
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer strip */}
          <div
            className="px-6 py-3"
            style={{
              background: "linear-gradient(135deg, #0B2952 0%, #1e40af 100%)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/70 text-center mb-2">
              Valid for Academic Year 2025-26
            </p>
            <div className="flex gap-[3px] justify-center items-end h-6">
              {barHeights.map((h, i) => (
                <div
                  key={String(i)}
                  className="w-[2px] bg-white/50 rounded-sm"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[380px] mx-auto">
        <Button
          onClick={handlePrint}
          data-ocid="dashboard.secondary_button"
          className="w-full gap-2 text-white rounded-full font-semibold"
          style={{ backgroundColor: "#0B5ED7" }}
        >
          <Printer className="h-4 w-4" /> Download / Print ID Card
        </Button>
      </div>
    </motion.div>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  const [certOpen, setCertOpen] = useState(false);
  const createSession = useCreateCheckoutSession();
  const updatePayment = useUpdatePaymentStatus();
  const getSessionStatus = useGetStripeSessionStatus();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const handledPaymentReturn = useRef(false);

  const canPay =
    app.status === Status.approved &&
    app.paymentStatus === PaymentStatus.unpaid &&
    stripeConfigured;
  const canDownloadCert =
    app.status === Status.approved &&
    app.paymentStatus === PaymentStatus.paid &&
    app.certificateIssued;

  useEffect(() => {
    if (handledPaymentReturn.current) return;
    const params = new URLSearchParams(window.location.search);
    const paymentSuccess = params.get("payment_success");
    const sessionId = params.get("session_id");
    if (
      paymentSuccess === "true" &&
      sessionId &&
      app.paymentStatus === PaymentStatus.unpaid
    ) {
      handledPaymentReturn.current = true;
      getSessionStatus.mutate(sessionId, {
        onSuccess: (result) => {
          if (result.__kind__ === "completed") {
            updatePayment.mutate(
              { applicationId: app.applicationId, sessionId, isPaid: true },
              {
                onSuccess: () => {
                  window.history.replaceState(
                    {},
                    "",
                    window.location.pathname + window.location.hash,
                  );
                },
              },
            );
          }
        },
      });
    }
  }, [app.applicationId, app.paymentStatus, getSessionStatus, updatePayment]);

  const handlePay = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const hash = window.location.hash;
    const successUrl = `${baseUrl}?payment_success=true&session_id={CHECKOUT_SESSION_ID}${hash}`;
    const cancelUrl = `${baseUrl}${hash}`;
    createSession.mutate(
      { successUrl, cancelUrl },
      {
        onSuccess: (url) => {
          window.location.href = url;
        },
      },
    );
  };

  const fields = [
    { label: "Application ID", value: app.applicationId },
    { label: "Name", value: app.name },
    { label: "Email", value: app.email },
    { label: "Phone", value: app.phone },
    { label: "Course", value: app.course },
    { label: "Address", value: app.address },
    { label: "Date Applied", value: app.date },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        data-ocid="dashboard.card"
        className="bg-white rounded-2xl border border-border shadow-card overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-navy to-brand-blue px-6 py-5">
          <h2 className="text-lg font-extrabold text-white">
            Application Details
          </h2>
          <p className="text-blue-200 text-sm mt-0.5">Your enrollment status</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Row */}
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Application Status
              </p>
              <StatusBadge status={app.status} />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Payment Status
              </p>
              <PaymentBadge status={app.paymentStatus} />
            </div>
            {app.certificateIssued && (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Certificate
                </p>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-sm px-3 py-1">
                  <Award className="h-3.5 w-3.5 mr-1.5" /> Issued
                </Badge>
              </div>
            )}
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.label} className="space-y-0.5">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </p>
                <p className="font-semibold text-foreground text-sm">
                  {f.value}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
            {canDownloadCert && (
              <Button
                onClick={() => setCertOpen(true)}
                data-ocid="dashboard.primary_button"
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-full font-semibold gap-2"
              >
                <Award className="h-4 w-4" />
                Download Certificate
              </Button>
            )}
            {canPay && (
              <Button
                onClick={handlePay}
                disabled={createSession.isPending}
                data-ocid="dashboard.secondary_button"
                className="bg-brand-blue hover:bg-[oklch(0.52_0.19_252)] text-white rounded-full font-semibold gap-2"
              >
                {createSession.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Pay Registration Fee
              </Button>
            )}
            {updatePayment.isPending && (
              <div
                data-ocid="dashboard.loading_state"
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating payment status...
              </div>
            )}
          </div>

          {app.status === Status.rejected && (
            <div
              data-ocid="dashboard.error_state"
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
            >
              Unfortunately your application was not approved at this time.
              Please contact the admissions office for more information.
            </div>
          )}

          {app.status === Status.pending && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              Your application is under review. You'll receive an update once
              processed.
            </div>
          )}
        </div>
      </motion.div>

      <CertificateModal
        open={certOpen}
        onOpenChange={setCertOpen}
        studentName={app.name}
        courseName={app.course}
        dateIssued={app.date}
        certificateId={app.applicationId}
      />
    </>
  );
}

function DashboardContent() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const lookup = useGetApplicationByEmail();
  const idCardLookup = useGetIdCardByEmail();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    lookup.mutate(email.trim(), {
      onSuccess: (app) => {
        if (app) {
          idCardLookup.mutate(email.trim());
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_252)] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-blue flex items-center justify-center">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-foreground">
                Student Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Track your enrollment & certificate
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.hash = "";
            }}
            data-ocid="dashboard.cancel_button"
            className="rounded-full gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Site
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Search card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-border shadow-card p-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-1">
            Look Up Your Application
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Enter the email address you used when applying to find your
            application.
          </p>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="email-search" className="sr-only">
                Email address
              </Label>
              <Input
                id="email-search"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-ocid="dashboard.input"
                required
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              disabled={lookup.isPending}
              data-ocid="dashboard.submit_button"
              className="bg-brand-blue hover:bg-[oklch(0.52_0.19_252)] text-white rounded-full px-6 font-semibold h-11 gap-2"
            >
              {lookup.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
          </form>
        </motion.div>

        {/* Loading */}
        {lookup.isPending && (
          <div data-ocid="dashboard.loading_state" className="space-y-3">
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        )}

        {/* Result */}
        {submitted &&
          !lookup.isPending &&
          lookup.data !== undefined &&
          (lookup.data ? (
            <div className="space-y-6">
              <ApplicationCard app={lookup.data} />
              {/* ID Card section */}
              {idCardLookup.data && (
                <StudentIdCard idCard={idCardLookup.data} />
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              data-ocid="dashboard.empty_state"
              className="bg-white rounded-2xl border border-border shadow-card p-10 text-center"
            >
              <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-foreground">
                No application found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                We couldn't find an application with that email address. Please
                check and try again.
              </p>
            </motion.div>
          ))}

        {/* Error */}
        {lookup.isError && (
          <div
            data-ocid="dashboard.error_state"
            className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-700 text-center"
          >
            Something went wrong while looking up your application. Please try
            again.
          </div>
        )}
      </main>
    </div>
  );
}

export function StudentDashboard() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[oklch(0.97_0.01_252)] flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-border shadow-lg p-10 max-w-sm w-full text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mx-auto mb-5">
            <Lock className="h-7 w-7 text-brand-blue" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-2">
            Student Dashboard
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in to access your application status, payment details, and
            download your certificate.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="dashboard.primary_button"
            className="w-full bg-brand-blue hover:bg-[oklch(0.52_0.19_252)] text-white rounded-full font-semibold h-11"
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
            data-ocid="dashboard.cancel_button"
            className="w-full mt-2 rounded-full text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Site
          </Button>
        </motion.div>
      </div>
    );
  }

  return <DashboardContent />;
}
