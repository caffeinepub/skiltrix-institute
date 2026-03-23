import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, Phone, Sparkles, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "career_popup_shown";

export function CareerGuidancePopup() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem(STORAGE_KEY);
    if (!alreadyShown) {
      const timer = setTimeout(() => {
        setOpen(true);
        localStorage.setItem(STORAGE_KEY, "true");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    console.log("Career guidance lead:", { name, phone });
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSubmitted(true);
  };

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
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            data-ocid="career_guidance.modal"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-blue-100">
              {/* Blue gradient header stripe */}
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-400" />

              {/* Close button */}
              <button
                type="button"
                onClick={handleClose}
                data-ocid="career_guidance.close_button"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close popup"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-8">
                {!submitted ? (
                  <>
                    {/* Header */}
                    <div className="mb-6 flex flex-col items-center text-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                        <Sparkles className="h-7 w-7 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Get Free Career Guidance
                      </h2>
                      <p className="mt-1.5 text-sm text-gray-500">
                        Our counselors will call you within 24 hours.
                      </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="cg-name"
                          className="text-sm font-medium text-gray-700"
                        >
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="cg-name"
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            data-ocid="career_guidance.input"
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="cg-phone"
                          className="text-sm font-medium text-gray-700"
                        >
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="cg-phone"
                            type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            data-ocid="career_guidance.input"
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        data-ocid="career_guidance.submit_button"
                        className="mt-2 w-full bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting…
                          </span>
                        ) : (
                          "Get Free Guidance →"
                        )}
                      </Button>
                    </form>

                    <p className="mt-4 text-center text-xs text-gray-400">
                      No spam. Your info is safe with us.
                    </p>
                  </>
                ) : (
                  /* Thank-you state */
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col items-center py-4 text-center"
                    data-ocid="career_guidance.success_state"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                      <CheckCircle2 className="h-9 w-9 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      You're all set!
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Thanks,{" "}
                      <span className="font-medium text-gray-700">{name}</span>!
                      Our counselor will call you on{" "}
                      <span className="font-medium text-gray-700">{phone}</span>{" "}
                      within 24 hours.
                    </p>
                    <Button
                      onClick={handleClose}
                      data-ocid="career_guidance.close_button"
                      className="mt-6 w-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Close
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
