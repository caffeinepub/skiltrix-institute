import { Button } from "@/components/ui/button";
import { ArrowRight, Info } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onApplyClick: () => void;
}

export function HeroSection({ onApplyClick }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        backgroundImage:
          "url(/assets/generated/hero-premium-bg.dim_1920x1080.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(11,42,74,0.97) 0%, rgba(11,42,74,0.90) 45%, rgba(11,42,74,0.45) 75%, rgba(11,42,74,0.15) 100%)",
        }}
      />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-block bg-brand-blue/20 text-[oklch(0.78_0.12_252)] text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-5 border border-brand-blue/30">
              🎓 World-Class Education, Redefined
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.75rem] font-extrabold text-white leading-[1.1] tracking-tight mb-5">
              Empower Your Future
              <br />
              <span className="text-[oklch(0.72_0.18_252)]">with SKILTRIX</span>
            </h1>

            <p className="text-white/80 text-base sm:text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              Discover industry-leading programs designed to accelerate your
              career. Learn from expert mentors, build real-world skills, and
              join a community of innovators shaping tomorrow.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                data-ocid="hero.primary_button"
                asChild
                className="bg-brand-blue hover:bg-[oklch(0.52_0.19_252)] text-white font-semibold px-8 py-6 text-base rounded-full shadow-lg w-full sm:w-auto"
              >
                <a href="#courses">
                  Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                data-ocid="hero.secondary_button"
                variant="outline"
                onClick={onApplyClick}
                className="border-2 border-white/60 text-white bg-white/10 hover:bg-white/20 font-semibold px-8 py-6 text-base rounded-full backdrop-blur-sm w-full sm:w-auto"
              >
                <Info className="mr-2 h-4 w-4" /> Request Info
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { label: "Students Enrolled", value: "10,000+" },
              { label: "Expert Instructors", value: "50+" },
              { label: "Courses Offered", value: "20+" },
              { label: "Placement Rate", value: "95%" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-4 text-center"
              >
                <p className="text-xl sm:text-2xl font-extrabold text-white">
                  {value}
                </p>
                <p className="text-xs text-white/70 mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
