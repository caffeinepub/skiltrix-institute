import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCheckoutSession,
  useIsStripeConfigured,
  useSubmitApplication,
} from "@/hooks/useQueries";
import {
  CheckCircle2,
  CreditCard,
  Download,
  Loader2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PaymentStatus, Status } from "../backend.d";

const PROGRAMS = [
  "Web Development",
  "Data Science",
  "Digital Marketing",
  "UI/UX Design",
  "Business Analytics",
  "Cybersecurity",
];

interface ApplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedCourse?: string;
  onApplicationSubmitted?: (
    name: string,
    email: string,
    course: string,
  ) => void;
}

interface ReceiptData {
  name: string;
  course: string;
  applicationId: string;
  date: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  address?: string;
}

function generateReceiptHTML(data: ReceiptData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admission Receipt - ${data.applicationId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #f0f4ff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
    }
    .receipt {
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 12px 48px rgba(11, 94, 215, 0.18);
      max-width: 520px;
      width: 100%;
      overflow: hidden;
      border: 2px solid #dbeafe;
    }
    .receipt-header {
      background: linear-gradient(135deg, #0B2952 0%, #0B5ED7 100%);
      padding: 2.25rem 2.5rem 1.75rem;
      text-align: center;
      color: white;
      position: relative;
    }
    .header-badge {
      display: inline-block;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 999px;
      padding: 4px 14px;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #93c5fd;
      margin-bottom: 0.75rem;
    }
    .logo { font-size: 2.25rem; font-weight: 800; letter-spacing: 0.1em; line-height: 1; margin-bottom: 0.35rem; color: white; }
    .logo span { color: #93c5fd; }
    .institute-name { font-size: 0.8rem; letter-spacing: 0.06em; opacity: 0.85; margin-bottom: 0; }
    .gold-divider { height: 3px; background: linear-gradient(90deg, transparent, #f59e0b, #fbbf24, #f59e0b, transparent); margin: 0; }
    .receipt-body { padding: 2rem 2.5rem; }
    .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem 2rem; margin-bottom: 1.5rem; }
    .field-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 0.3rem; font-weight: 600; }
    .field-value { font-size: 0.95rem; font-weight: 700; color: #111827; }
    .app-id-pill { font-family: 'Courier New', monospace; background: #eff6ff; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 999px; color: #1d4ed8; font-size: 0.85rem; font-weight: 700; display: inline-block; }
    .notice-box { border: 1.5px dashed #93c5fd; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1rem; }
    .notice-text { font-size: 0.8rem; color: #1d4ed8; font-style: italic; line-height: 1.6; text-align: center; }
    .receipt-footer { text-align: center; padding: 1rem 2.5rem 1.25rem; font-size: 0.7rem; color: #d1d5db; border-top: 1px solid #f3f4f6; letter-spacing: 0.04em; }
    @media print {
      body { background: white; padding: 0; }
      .receipt { box-shadow: none; max-width: 100%; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="receipt-header">
      <div class="header-badge">Official Document</div>
      <div class="logo">SKIL<span>TRIX</span></div>
      <div class="institute-name">SKILTRIX Institute of Technology</div>
    </div>
    <div class="gold-divider"></div>
    <div class="receipt-body">
      <div class="fields-grid">
        <div class="field">
          <div class="field-label">Student Name</div>
          <div class="field-value">${data.name}</div>
        </div>
        <div class="field">
          <div class="field-label">Course / Program</div>
          <div class="field-value">${data.course}</div>
        </div>
        <div class="field">
          <div class="field-label">Application ID</div>
          <div class="field-value"><span class="app-id-pill">${data.applicationId}</span></div>
        </div>
        <div class="field">
          <div class="field-label">Date of Application</div>
          <div class="field-value">${data.date}</div>
        </div>
      </div>
      <div class="notice-box">
        <div class="notice-text">
          ⚠️ Important: Keep this receipt safe. Bring it to the institute for admission verification.
        </div>
      </div>
    </div>
    <div class="receipt-footer">Official Document &mdash; SKILTRIX Institute of Technology</div>
  </div>
</body>
</html>`;
}

export function ApplyModal({
  open,
  onOpenChange,
  preSelectedCourse,
  onApplicationSubmitted,
}: ApplyModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: preSelectedCourse ?? "",
    address: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mutation = useSubmitApplication();
  const createSession = useCreateCheckoutSession();
  const { data: stripeConfigured } = useIsStripeConfigured();

  useEffect(() => {
    if (open && preSelectedCourse) {
      setForm((prev) => ({ ...prev, course: preSelectedCourse }));
    }
  }, [open, preSelectedCourse]);

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (form.phone.replace(/\D/g, "").length < 7) {
      newErrors.phone = "Enter a valid phone number (min 7 digits)";
    }
    if (!form.course) newErrors.course = "Please select a course";
    if (!form.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const applicationId = `SKX-${Date.now()}`;
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    try {
      await mutation.mutateAsync({
        ...form,
        applicationId,
        date,
        status: Status.pending,
        paymentStatus: PaymentStatus.unpaid,
        certificateIssued: false,
      });
      setReceipt({ name: form.name, course: form.course, applicationId, date });
      onApplicationSubmitted?.(form.name, form.email, form.course);
    } catch {
      // error shown via mutation.isError
    }
  };

  const handleDownloadPDF = () => {
    if (!receipt) return;
    const html = generateReceiptHTML(receipt);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handlePayNow = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const hash = "#dashboard";
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

  const handleClose = (val: boolean) => {
    if (!val) {
      setReceipt(null);
      setErrors({});
      setForm({ name: "", email: "", phone: "", course: "", address: "" });
      setPhotoFile(null);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-ocid="apply.dialog"
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-foreground">
            {receipt
              ? "Application Submitted Successfully!"
              : "Apply to SKILTRIX"}
          </DialogTitle>
          <DialogDescription>
            {receipt
              ? `Your application ID is ${receipt.applicationId}. Save it for tracking.`
              : "Fill out the form below and our admissions team will contact you shortly."}
          </DialogDescription>
        </DialogHeader>

        {receipt ? (
          <div
            data-ocid="apply.success_state"
            className="flex flex-col gap-4 mt-2"
          >
            {/* Success indicator */}
            <div className="flex flex-col items-center gap-2 py-2">
              <CheckCircle2
                className="text-emerald-500"
                style={{ width: 52, height: 52 }}
              />
              <p className="text-base font-bold text-foreground">
                Application Submitted Successfully!
              </p>
            </div>

            {/* Premium Receipt Card */}
            <div className="border-2 border-blue-100 rounded-2xl overflow-hidden shadow-lg">
              {/* Header */}
              <div
                className="px-6 py-5 text-center text-white relative"
                style={{
                  background:
                    "linear-gradient(135deg, #0B2952 0%, #0B5ED7 100%)",
                }}
              >
                <div className="inline-block bg-white/15 border border-white/30 rounded-full px-3 py-0.5 text-[10px] font-bold tracking-[0.15em] uppercase text-blue-200 mb-2">
                  Official Document
                </div>
                <div className="text-2xl font-extrabold tracking-widest text-white">
                  SKIL<span className="text-blue-300">TRIX</span>
                </div>
                <div className="text-[11px] tracking-wide opacity-80 mt-0.5">
                  SKILTRIX Institute of Technology
                </div>
                <div className="text-xs uppercase tracking-[0.15em] text-blue-200 mt-1 font-semibold">
                  Admission Receipt
                </div>
              </div>

              {/* Gold divider */}
              <div
                className="h-[3px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #f59e0b, #fbbf24, #f59e0b, transparent)",
                }}
              />

              {/* Body */}
              <div className="bg-white px-6 py-5">
                {/* 2-col grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                      Student Name
                    </p>
                    <p className="font-bold text-gray-900 text-sm">
                      {receipt.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                      Course / Program
                    </p>
                    <p className="font-bold text-gray-900 text-sm">
                      {receipt.course}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                      Application ID
                    </p>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full text-xs inline-block">
                      {receipt.applicationId}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                      Date of Application
                    </p>
                    <p className="font-bold text-gray-900 text-sm">
                      {receipt.date}
                    </p>
                  </div>
                </div>

                {/* Notice */}
                <div className="border-2 border-dashed border-blue-200 rounded-xl px-4 py-3 mb-2">
                  <p className="text-xs text-blue-700 italic text-center leading-relaxed">
                    ⚠️ Important: Keep this receipt safe. Bring it to the
                    institute for admission verification.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-100 px-6 py-2 text-center">
                <p className="text-[10px] text-gray-400 tracking-wide">
                  Official Document — SKILTRIX Institute of Technology
                </p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                data-ocid="apply.close_button"
                className="flex-1 rounded-full"
              >
                Close
              </Button>
              <Button
                onClick={handleDownloadPDF}
                data-ocid="apply.primary_button"
                className="flex-1 text-white rounded-full font-semibold"
                style={{ backgroundColor: "#0B5ED7" }}
              >
                <Download className="mr-2 h-4 w-4" /> Download as PDF
              </Button>
            </div>

            {stripeConfigured && (
              <Button
                onClick={handlePayNow}
                disabled={createSession.isPending}
                data-ocid="apply.secondary_button"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold gap-2"
              >
                {createSession.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Pay Registration Fee Now
              </Button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                data-ocid="apply.input"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p
                  className="text-destructive text-xs"
                  data-ocid="apply.error_state"
                >
                  {errors.name}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                data-ocid="apply.input"
                placeholder="jane@example.com"
                value={form.email}
                onChange={handleChange("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p
                  className="text-destructive text-xs"
                  data-ocid="apply.error_state"
                >
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                data-ocid="apply.input"
                placeholder="+91 9999999999"
                value={form.phone}
                onChange={handleChange("phone")}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p
                  className="text-destructive text-xs"
                  data-ocid="apply.error_state"
                >
                  {errors.phone}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Course Selection *</Label>
              <Select
                value={form.course}
                onValueChange={(v) => {
                  setForm((prev) => ({ ...prev, course: v }));
                  if (errors.course)
                    setErrors((prev) => ({ ...prev, course: undefined }));
                }}
              >
                <SelectTrigger
                  data-ocid="apply.select"
                  className={errors.course ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.course && (
                <p
                  className="text-destructive text-xs"
                  data-ocid="apply.error_state"
                >
                  {errors.course}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                data-ocid="apply.textarea"
                placeholder="123 Main St, City, State, ZIP"
                value={form.address}
                onChange={handleChange("address")}
                rows={2}
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && (
                <p
                  className="text-destructive text-xs"
                  data-ocid="apply.error_state"
                >
                  {errors.address}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Photo (optional)</Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  data-ocid="apply.upload_button"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:border-brand-blue hover:text-brand-blue transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  {photoFile ? "Change Photo" : "Upload Photo"}
                </button>
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-12 w-12 rounded-lg object-cover border border-border"
                  />
                )}
                {photoFile && (
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {photoFile.name}
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            {mutation.isError && (
              <p
                data-ocid="apply.error_state"
                className="text-destructive text-sm"
              >
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Something went wrong. Please try again."}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                data-ocid="apply.cancel_button"
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                data-ocid="apply.submit_button"
                className="flex-1 text-white rounded-full font-semibold"
                style={{ backgroundColor: "#0B5ED7" }}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Apply Now"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
