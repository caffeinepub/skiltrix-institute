import { Award, Lightbulb, Users } from "lucide-react";
import { motion } from "motion/react";

export function AboutSection() {
  const pillars = [
    {
      icon: Award,
      title: "Academic Excellence",
      desc: "Rigorous, industry-aligned curriculum designed with top employers.",
    },
    {
      icon: Lightbulb,
      title: "Innovation-First",
      desc: "Hands-on projects, live labs, and cutting-edge technologies.",
    },
    {
      icon: Users,
      title: "Thriving Community",
      desc: "Connect with 10,000+ alumni and professionals worldwide.",
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-section-bg rounded-3xl -z-10" />
            <img
              src="/assets/generated/about-illustration.dim_600x500.png"
              alt="SKILTRIX Education Illustration"
              className="w-full max-w-md mx-auto rounded-2xl"
            />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="text-brand-blue font-semibold text-sm tracking-widest uppercase">
              Who We Are
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mt-2 mb-5 leading-tight">
              About SKILTRIX
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-4">
              SKILTRIX is a premier professional education institute dedicated
              to bridging the gap between academic knowledge and industry
              demands. Founded on the belief that quality education should be
              accessible, we offer meticulously crafted programs in technology,
              business, and design.
            </p>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
              Our faculty comprises seasoned industry professionals and academic
              experts committed to delivering transformative learning
              experiences that prepare students for the challenges of a rapidly
              evolving world.
            </p>

            <div className="space-y-5">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                    <pillar.icon className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {pillar.title}
                    </h4>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
