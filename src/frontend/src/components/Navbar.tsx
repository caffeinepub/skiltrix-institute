import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface NavbarProps {
  onApplyClick: () => void;
}

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Courses", href: "#courses" },
  { label: "Admissions", href: "#cta" },
  { label: "Contact Us", href: "#footer" },
];

export function Navbar({ onApplyClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const goToAdmin = () => {
    window.location.hash = "admin";
  };
  const goToDashboard = () => {
    window.location.hash = "dashboard";
  };
  const goToTrack = () => {
    window.location.hash = "track";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          <a
            href="#home"
            className="flex items-center gap-2"
            data-ocid="nav.link"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">SK</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-foreground">SKIL</span>
              <span className="text-brand-blue">TRIX</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-ocid="nav.link"
                className="text-sm font-medium text-muted-foreground hover:text-brand-blue transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={goToTrack}
              data-ocid="nav.link"
              className="text-xs font-medium text-muted-foreground hover:text-brand-blue transition-colors px-2 py-1 rounded border border-transparent hover:border-brand-blue/30"
            >
              Track Application
            </button>
            <button
              type="button"
              onClick={goToDashboard}
              data-ocid="nav.link"
              className="text-xs font-medium text-muted-foreground hover:text-brand-blue transition-colors px-2 py-1 rounded border border-transparent hover:border-brand-blue/30"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={goToAdmin}
              data-ocid="nav.link"
              className="text-xs font-medium text-muted-foreground hover:text-brand-blue transition-colors px-2 py-1 rounded border border-transparent hover:border-brand-blue/30"
            >
              Admin
            </button>
            <Button
              data-ocid="nav.primary_button"
              onClick={onApplyClick}
              className="bg-brand-blue hover:bg-[oklch(0.52_0.19_252)] text-white rounded-full px-6 font-semibold"
            >
              Apply Now
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-md text-foreground"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            data-ocid="nav.toggle"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-border px-6 pb-4"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.link"
                className="block py-3 text-sm font-medium text-foreground hover:text-brand-blue border-b border-border/50 last:border-0"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                goToTrack();
                setMobileOpen(false);
              }}
              data-ocid="nav.link"
              className="block w-full text-left py-3 text-sm font-medium text-muted-foreground hover:text-brand-blue border-b border-border/50"
            >
              Track Application
            </button>
            <button
              type="button"
              onClick={() => {
                goToDashboard();
                setMobileOpen(false);
              }}
              data-ocid="nav.link"
              className="block w-full text-left py-3 text-sm font-medium text-muted-foreground hover:text-brand-blue border-b border-border/50"
            >
              Student Dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                goToAdmin();
                setMobileOpen(false);
              }}
              data-ocid="nav.link"
              className="block w-full text-left py-3 text-sm font-medium text-muted-foreground hover:text-brand-blue border-b border-border/50"
            >
              Admin Panel
            </button>
            <Button
              onClick={() => {
                setMobileOpen(false);
                onApplyClick();
              }}
              data-ocid="nav.primary_button"
              className="w-full mt-3 bg-brand-blue hover:bg-[oklch(0.52_0.19_252)] text-white rounded-full font-semibold"
            >
              Apply Now
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
