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
  { label: "Contact", href: "#contact" },
];

export function Navbar({ onApplyClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Prevent body scroll when menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const goToAdmin = () => {
    setMobileOpen(false);
    window.location.hash = "admin";
  };
  const goToDashboard = () => {
    setMobileOpen(false);
    window.location.hash = "dashboard";
  };
  const goToTrack = () => {
    setMobileOpen(false);
    window.location.hash = "track";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-2 shrink-0"
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

          {/* Desktop Nav */}
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

          {/* Desktop Actions */}
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
              onClick={onApplyClick}
              data-ocid="nav.primary_button"
              size="sm"
              className="bg-brand-blue hover:bg-[oklch(0.52_0.19_252)] text-white rounded-full px-5 text-sm font-semibold"
            >
              Apply Now
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            data-ocid="nav.toggle"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-border shadow-lg overflow-hidden"
          >
            <nav className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  data-ocid="nav.link"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted hover:text-brand-blue transition-colors min-h-[44px] flex items-center"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-border mt-2 pt-2 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={goToTrack}
                  data-ocid="nav.link"
                  className="px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-brand-blue transition-colors text-left min-h-[44px]"
                >
                  Track Application
                </button>
                <button
                  type="button"
                  onClick={goToDashboard}
                  data-ocid="nav.link"
                  className="px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-brand-blue transition-colors text-left min-h-[44px]"
                >
                  Student Dashboard
                </button>
                <button
                  type="button"
                  onClick={goToAdmin}
                  data-ocid="nav.link"
                  className="px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-brand-blue transition-colors text-left min-h-[44px]"
                >
                  Admin Panel
                </button>
                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    onApplyClick();
                  }}
                  data-ocid="nav.primary_button"
                  className="mt-2 bg-brand-blue hover:bg-[oklch(0.52_0.19_252)] text-white rounded-full font-semibold min-h-[44px]"
                >
                  Apply Now
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
