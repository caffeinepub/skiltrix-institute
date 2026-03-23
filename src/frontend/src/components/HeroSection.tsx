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
        backgroundImage: "url(/assets/generated/hero-campus.dim_1600x800.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(11,42,74,0.95) 0%, rgba(11,42,74,0.88) 45%, rgba(11,42,74,0.35) 75%, rgba(11,42,74,0.1) 100%)",
        }}
      />

      <div className="relative container mx-auto px-6 lg:px-8 pt-16">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-block bg-brand-blue/20 text-[oklch(0.78_0.12_252)] text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-brand-blue/30">
              🎓 World-Class Education, Redefined
            </span>

            <h1 className="text-5xl md:text-6xl lg:text-[3.75rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Empower Your Future
              <br />
              <span className="text-[oklch(0.72_0.18_252)]">with SKILTRIX</span>
            </h1>

            <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              Discover industry-leading programs designed to accelerate your
              career. Learn from expert mentors, build real-world skills, and
              join a community of innovators shaping tomorrow.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                data-ocid="hero.primary_button"
                asChild
                className="bg-brand-blue hover:bg-[oklch(0.52_0.19_252)] text-white font-semibold px-8 py-6 text-base rounded-full shadow-lg"
              >
                <a href="#courses">
                  Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                data-ocid="hero.secondary_button"
                variant="outline"
                onClick={onApplyClick}
                className="border-2 border-white/60 text-white bg-white/10 hover:bg-white/20 font-semibold px-8 py-6 text-base rounded-full backdrop-blur-sm"
              >
                <Info className="mr-2 h-4 w-4" /> Request Info
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="mt-16 grid grid-cols-3 gap-6 max-w-lg"
          >
            {[
              { value: "10K+", label: "Students Enrolled" },
              { value: "50+", label: "Expert Instructors" },
              { value: "95%", label: "Placement Rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-white">
                  {stat.value}
                </div>
                <div className="text-white/60 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
