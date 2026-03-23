import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { motion } from "motion/react";

interface CTABandProps {
  onApplyClick: () => void;
}

export function CTABand({ onApplyClick }: CTABandProps) {
  return (
    <section id="cta" className="py-20 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-navy rounded-3xl px-10 py-16 md:py-20 text-center relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.07 252) 0%, oklch(0.25 0.09 250) 100%)",
          }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand-blue/10 pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-brand-blue/10 pointer-events-none" />

          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-brand-blue/20 flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-7 h-7 text-[oklch(0.78_0.14_252)]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Ready to Start Your Journey?
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
              Join thousands of students who transformed their careers with
              SKILTRIX. Applications are open — take the first step today.
            </p>
            <Button
              data-ocid="cta.primary_button"
              onClick={onApplyClick}
              className="bg-white text-navy hover:bg-white/90 font-bold px-10 py-6 text-base rounded-full shadow-xl"
            >
              Apply Now — It's Free
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
