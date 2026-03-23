import { Card, CardContent } from "@/components/ui/card";
import { useGetReviews } from "@/hooks/useQueries";
import { MessageSquare, Star } from "lucide-react";
import { motion } from "motion/react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const { data: reviews = [], isLoading } = useGetReviews();

  return (
    <section className="bg-secondary py-20 px-4" id="testimonials">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mb-14 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-primary">
            Student Stories
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            What Our Students Say
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Real experiences from learners who chose SKILTRIX to build their
            futures.
          </p>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && reviews.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            data-ocid="testimonials.empty_state"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Be the first to share your experience!
            </h3>
            <p className="mt-2 max-w-sm text-muted-foreground">
              Students who complete a course are invited to leave a review. Your
              story could inspire the next SKILTRIX learner.
            </p>
          </motion.div>
        )}

        {/* Grid */}
        {!isLoading && reviews.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => {
              const initials = review.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const rating = Number(review.rating);
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.1, 0.5) }}
                  data-ocid={
                    `testimonials.item.${i + 1}` as `testimonials.item.${1 | 2 | 3 | 4 | 5 | 6}`
                  }
                >
                  <Card className="h-full bg-white border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="mb-4">
                        <StarRating rating={rating} />
                      </div>
                      <p className="flex-1 text-sm leading-relaxed text-muted-foreground mb-6 italic">
                        &ldquo;{review.feedback}&rdquo;
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-border">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-sm text-white">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {review.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {review.course}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
