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
import { CreditCard, Download, Loader2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
      box-shadow: 0 8px 40px rgba(37, 99, 235, 0.15);
      max-width: 480px;
      width: 100%;
      overflow: hidden;
    }
    .receipt-header {
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
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
    .divider { border: none; border-top: 1px dashed #e5e7eb; margin: 1.5rem 0; }
    .notice { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 1rem 1.25rem; font-size: 0.875rem; font-weight: 700; color: #1d4ed8; text-align: center; line-height: 1.5; }
    .receipt-footer { text-align: center; padding: 1.25rem 2rem; font-size: 0.75rem; color: #9ca3af; border-top: 1px solid #f3f4f6; }
    @media print { body { background: white; padding: 0; } .receipt { box-shadow: none; max-width: 100%; border-radius: 0; } }
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
      <div class="field"><div class="field-label">Application ID</div><div class="field-value">${data.applicationId}</div></div>
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mutation = useSubmitApplication();
  const createSession = useCreateCheckoutSession();
  const { data: stripeConfigured } = useIsStripeConfigured();

  // When modal opens with a pre-selected course, apply it
  useEffect(() => {
    if (open && preSelectedCourse) {
      setForm((prev) => ({ ...prev, course: preSelectedCourse }));
    }
  }, [open, preSelectedCourse]);

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const applicationId = `SKX-${Date.now()}`;
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    try {
      await mutation.mutateAsync({ ...form, applicationId, date });
      setReceipt({ name: form.name, course: form.course, applicationId, date });
    } catch {
      // error shown via mutation.isError
    }
  };

  const handleDownload = () => {
    if (!receipt) return;
    const html = generateReceiptHTML(receipt);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SKILTRIX-Receipt-${receipt.applicationId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            {receipt ? "Application Received!" : "Apply to SKILTRIX"}
          </DialogTitle>
          <DialogDescription>
            {receipt
              ? "Your application has been submitted successfully."
              : "Fill out the form below and our admissions team will contact you shortly."}
          </DialogDescription>
        </DialogHeader>

        {receipt ? (
          <div
            data-ocid="apply.success_state"
            className="flex flex-col gap-4 mt-2"
          >
            <div className="rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="bg-brand-blue px-6 py-4 text-center text-white">
                <div className="text-xl font-extrabold tracking-widest">
                  SKIL<span className="opacity-70">TRIX</span>
                </div>
                <div className="text-xs uppercase tracking-widest opacity-80 mt-0.5">
                  Admission Receipt
                </div>
              </div>
              <div className="bg-card px-6 py-5 space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Student Name
                  </p>
                  <p className="font-semibold text-foreground">
                    {receipt.name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Course / Program
                  </p>
                  <p className="font-semibold text-foreground">
                    {receipt.course}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Application ID
                  </p>
                  <p className="font-semibold text-foreground font-mono">
                    {receipt.applicationId}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Date of Application
                  </p>
                  <p className="font-semibold text-foreground">
                    {receipt.date}
                  </p>
                </div>
                <div className="pt-2">
                  <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-center text-sm font-bold text-brand-blue leading-snug">
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
                onClick={handleDownload}
                data-ocid="apply.primary_button"
                className="flex-1 bg-brand-blue hover:bg-[oklch(0.52_0.19_252)] text-white rounded-full font-semibold"
              >
                <Download className="mr-2 h-4 w-4" /> Download Receipt
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
                required
              />
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
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                data-ocid="apply.input"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={handleChange("phone")}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Course Selection *</Label>
              <Select
                value={form.course}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, course: v }))
                }
                required
              >
                <SelectTrigger data-ocid="apply.select">
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
                required
              />
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
                Something went wrong. Please try again.
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
                className="flex-1 bg-brand-blue hover:bg-[oklch(0.52_0.19_252)] text-white rounded-full font-semibold"
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
