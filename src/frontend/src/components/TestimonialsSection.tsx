import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { motion } from "motion/react";

const testimonials = [
  {
    name: "Priya Sharma",
    course: "Full Stack Web Development",
    feedback:
      "SKILTRIX completely transformed my career. The hands-on projects and mentorship I received gave me the confidence to land my first developer role within three months of completing the course.",
    initials: "PS",
  },
  {
    name: "Arjun Mehta",
    course: "Data Science & Machine Learning",
    feedback:
      "The curriculum is incredibly well-structured. I went from knowing basic Python to building and deploying real ML models. The instructors are world-class and always available to help.",
    initials: "AM",
  },
  {
    name: "Sneha Patel",
    course: "UI/UX Design",
    feedback:
      "I had no design background whatsoever, and SKILTRIX made the entire journey smooth and enjoyable. My portfolio now has five polished projects and I recently got hired as a junior UX designer!",
    initials: "SP",
  },
  {
    name: "Rahul Verma",
    course: "Digital Marketing",
    feedback:
      "The practical approach here is unlike any other institute. We worked on live campaigns and got to see real metrics. My agency clients have noticed a significant improvement in my strategy skills.",
    initials: "RV",
  },
  {
    name: "Kavya Nair",
    course: "Cloud Computing & DevOps",
    feedback:
      "SKILTRIX gave me both the theoretical foundation and hands-on lab experience I needed. I passed my AWS certification on the first attempt and joined a top tech firm shortly after.",
    initials: "KN",
  },
];

export function TestimonialsSection() {
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

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              data-ocid={`testimonials.item.${i + 1}`}
            >
              <Card className="h-full border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  {/* Quote icon */}
                  <Quote className="h-7 w-7 text-primary opacity-70" />

                  {/* Feedback */}
                  <p className="flex-1 text-sm leading-relaxed text-foreground/80">
                    {t.feedback}
                  </p>

                  {/* Divider */}
                  <div className="mt-2 border-t border-border pt-4 flex items-center gap-3">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.course}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
