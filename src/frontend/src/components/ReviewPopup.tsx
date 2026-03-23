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
import { Textarea } from "@/components/ui/textarea";
import { useSubmitReview } from "@/hooks/useQueries";
import { Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface ReviewPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantName?: string;
  applicantEmail?: string;
  applicantCourse?: string;
}

export function ReviewPopup({
  open,
  onOpenChange,
  applicantName = "",
  applicantEmail = "",
  applicantCourse = "",
}: ReviewPopupProps) {
  const [name, setName] = useState(applicantName);
  const [email, setEmail] = useState(applicantEmail);
  const [course, setCourse] = useState(applicantCourse);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [dupError, setDupError] = useState(false);

  const submitReview = useSubmitReview();

  // Sync pre-fills when props change
  useEffect(() => {
    setName(applicantName);
    setEmail(applicantEmail);
    setCourse(applicantCourse);
  }, [applicantName, applicantEmail, applicantCourse]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setFeedback("");
      setRating(5);
      setHoverRating(0);
      setSubmitted(false);
      setDupError(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    try {
      const result = await submitReview.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        course: course.trim(),
        feedback: feedback.trim(),
        rating: BigInt(rating),
      });

      if (result.__kind__ === "err") {
        setDupError(true);
        return;
      }

      setSubmitted(true);
      setTimeout(() => onOpenChange(false), 2000);
    } catch {
      // ignore
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md w-full max-h-[90vh] overflow-y-auto"
        data-ocid="review.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {submitted ? "Thank you! 🎉" : "Share Your Experience"}
          </DialogTitle>
          <DialogDescription>
            {submitted
              ? "Your review has been submitted successfully."
              : "Help future students by sharing your SKILTRIX journey."}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl">🎉</span>
            </div>
            <p className="text-lg font-semibold text-green-700">
              Thank you for your review!
            </p>
            <p className="text-sm text-muted-foreground">
              Your experience will inspire future learners.
            </p>
          </div>
        ) : dupError ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-base font-semibold text-amber-700">
              You&apos;ve already submitted a review. Thank you!
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              data-ocid="review.close_button"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Star Rating */}
            <div>
              <Label className="text-sm font-medium">Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    data-ocid={
                      `review.radio.${star}` as `review.radio.${1 | 2 | 3 | 4 | 5}`
                    }
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= displayRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="review-name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="review-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="mt-1"
                data-ocid="review.input"
              />
            </div>

            <div>
              <Label htmlFor="review-email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="review-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="mt-1"
                data-ocid="review.input"
              />
            </div>

            <div>
              <Label htmlFor="review-course" className="text-sm font-medium">
                Course
              </Label>
              <Input
                id="review-course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Course name"
                required
                className="mt-1"
                data-ocid="review.input"
              />
            </div>

            <div>
              <Label htmlFor="review-feedback" className="text-sm font-medium">
                Your Feedback <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="review-feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience at SKILTRIX..."
                rows={4}
                required
                className="mt-1 resize-none"
                data-ocid="review.textarea"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                data-ocid="review.cancel_button"
              >
                Skip for now
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-brand-blue hover:bg-[oklch(0.52_0.19_252)]"
                disabled={submitReview.isPending || !feedback.trim()}
                data-ocid="review.submit_button"
              >
                {submitReview.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {submitReview.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
