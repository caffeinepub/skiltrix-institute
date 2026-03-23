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
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(11, 94, 215, 0.15);
      max-width: 480px;
      width: 100%;
      overflow: hidden;
    }
    .receipt-header {
      background: linear-gradient(135deg, #0B5ED7 0%, #1a6ee8 100%);
      padding: 2rem 2rem 1.5rem;
      text-align: center;
      color: white;
    }
    .logo { font-size: 1.75rem; font-weight: 800; letter-spacing: 0.08em; margin-bottom: 0.25rem; }
    .logo span { color: #93c5fd; }
    .receipt-title { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.85; }
    .receipt-body { padding: 2rem; }
    .field { margin-bottom: 1.25rem; }
    .field-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin-bottom: 0.25rem; }
    .field-value { font-size: 1rem; font-weight: 600; color: #111827; }
    .app-id { font-family: monospace; background: #eff6ff; padding: 4px 8px; border-radius: 6px; color: #0B5ED7; font-size: 1.05rem; }
    .divider { border: none; border-top: 1px dashed #e5e7eb; margin: 1.5rem 0; }
    .notice { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 1rem 1.25rem; font-size: 0.875rem; font-weight: 700; color: #0B5ED7; text-align: center; line-height: 1.5; }
    .receipt-footer { text-align: center; padding: 1.25rem 2rem; font-size: 0.75rem; color: #9ca3af; border-top: 1px solid #f3f4f6; }
    @media print {
      body { background: white; padding: 0; }
      .receipt { box-shadow: none; max-width: 100%; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="receipt-header">
      <div class="logo">SKIL<span>TRIX</span></div>
      <div class="receipt-title">Admission Receipt</div>
    </div>
    <div class="receipt-body">
      <div class="field"><div class="field-label">Student Name</div><div class="field-value">${data.name}</div></div>
      <div class="field"><div class="field-label">Course / Program</div><div class="field-value">${data.course}</div></div>
      <div class="field"><div class="field-label">Application ID</div><div class="field-value"><span class="app-id">${data.applicationId}</span></div></div>
      <div class="field"><div class="field-label">Date of Application</div><div class="field-value">${data.date}</div></div>
      <hr class="divider" />
      <div class="notice">Bring this receipt to office for admission confirmation</div>
    </div>
    <div class="receipt-footer">SKILTRIX Institute &mdash; Official Admission Receipt</div>
  </div>
</body>
</html>`;
}

export function ApplyModal({
  open,
  onOpenChange,
  preSelectedCourse,
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
                style={{ width: 56, height: 56 }}
              />
              <p className="text-lg font-bold text-foreground">
                Application Submitted Successfully!
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Your application ID is{" "}
                <span className="font-mono font-semibold text-brand-blue bg-blue-50 px-2 py-0.5 rounded">
                  {receipt.applicationId}
                </span>
                . Save it for tracking.
              </p>
            </div>

            {/* Receipt card */}
            <div className="rounded-2xl border border-border overflow-hidden shadow-md">
              <div
                className="px-6 py-4 text-center text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #0B5ED7 0%, #1a6ee8 100%)",
                }}
              >
                <div className="text-xl font-extrabold tracking-widest">
                  SKIL<span className="opacity-70">TRIX</span>
                </div>
                <div className="text-xs uppercase tracking-widest opacity-80 mt-0.5">
                  Admission Receipt
                </div>
              </div>
              <div className="bg-card px-6 py-5 space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    Student Name
                  </p>
                  <p className="font-semibold text-foreground">
                    {receipt.name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    Course / Program
                  </p>
                  <p className="font-semibold text-foreground">
                    {receipt.course}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    Application ID
                  </p>
                  <p className="font-semibold font-mono text-brand-blue bg-blue-50 inline-block px-2 py-0.5 rounded text-sm">
                    {receipt.applicationId}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    Date of Application
                  </p>
                  <p className="font-semibold text-foreground">
                    {receipt.date}
                  </p>
                </div>
                <div className="pt-1">
                  <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-center text-sm font-bold text-brand-blue leading-snug">
                    Bring this receipt to office for admission confirmation
                  </div>
                </div>
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
