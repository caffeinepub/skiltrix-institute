import { AboutSection } from "@/components/AboutSection";
import { AdminPanel } from "@/components/AdminPanel";
import { ApplyModal } from "@/components/ApplyModal";
import { CTABand } from "@/components/CTABand";
import { CoursesSection } from "@/components/CoursesSection";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { StudentDashboard } from "@/components/StudentDashboard";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { TrackApplication } from "@/components/TrackApplication";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

type View = "public" | "admin" | "dashboard" | "track";

function getView(): View {
  const hash = window.location.hash;
  if (hash === "#admin") return "admin";
  if (hash === "#dashboard") return "dashboard";
  if (hash === "#track") return "track";
  return "public";
}

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/917023628763?text=I%20want%20to%20join%20SKILTRIX"
      target="_blank"
      rel="noopener noreferrer"
      data-ocid="whatsapp.button"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-2"
    >
      {/* Tooltip */}
      <span className="pointer-events-none translate-x-2 rounded-full bg-gray-800 px-3 py-1 text-sm font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:-translate-x-0 group-hover:opacity-100">
        Chat with us
      </span>
      {/* Button */}
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-transform duration-200 group-hover:scale-110"
        style={{ backgroundColor: "#25D366" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="28"
          height="28"
          fill="white"
          aria-hidden="true"
        >
          <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.68 4.61 1.857 6.5L4 29l7.742-1.82A11.94 11.94 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10a9.94 9.94 0 01-5.02-1.355l-.36-.213-4.6 1.082 1.044-4.48-.23-.372A9.944 9.944 0 016 15c0-5.523 4.477-10 10-10zm-3.5 5c-.28 0-.735.105-1.12.525C10.995 10.94 10 12.07 10 13.75c0 1.68 1.225 3.305 1.395 3.535.17.23 2.37 3.775 5.835 5.145.815.35 1.45.56 1.945.715.82.26 1.565.224 2.155.136.658-.098 2.025-.828 2.31-1.628.285-.8.285-1.486.2-1.628-.085-.142-.314-.228-.66-.4-.344-.17-2.035-1.003-2.35-1.118-.315-.114-.544-.17-.773.17-.228.342-.884 1.118-1.083 1.347-.2.228-.4.257-.743.086-.342-.17-1.445-.533-2.753-1.698-.017-.015-.034-.03-.05-.046a10.16 10.16 0 01-1.9-2.537c-.2-.342-.022-.527.15-.698.155-.153.343-.4.514-.6.17-.2.228-.342.342-.57.114-.228.057-.428-.028-.6-.086-.17-.773-1.862-1.06-2.547-.17-.413-.342-.42-.514-.428a9.76 9.76 0 00-.457-.007z" />
        </svg>
      </span>
    </a>
  );
}

function AppContent() {
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyCourse, setApplyCourse] = useState<string>("");
  const [view, setView] = useState<View>(getView);

  useEffect(() => {
    const handleHash = () => setView(getView());
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleApplyClick = (course?: string) => {
    setApplyCourse(course ?? "");
    setApplyOpen(true);
  };

  if (view === "admin") {
    return (
      <>
        <AdminPanel />
        <Toaster />
      </>
    );
  }

  if (view === "dashboard") {
    return (
      <>
        <StudentDashboard />
        <Toaster />
      </>
    );
  }

  if (view === "track") {
    return (
      <>
        <TrackApplication />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <Navbar onApplyClick={() => handleApplyClick()} />
      <main>
        <HeroSection onApplyClick={() => handleApplyClick()} />
        <AboutSection />
        <CoursesSection onApplyClick={handleApplyClick} />
        <TestimonialsSection />
        <CTABand onApplyClick={() => handleApplyClick()} />
      </main>
      <Footer />
      <ApplyModal
        open={applyOpen}
        onOpenChange={(val) => {
          setApplyOpen(val);
          if (!val) setApplyCourse("");
        }}
        preSelectedCourse={applyCourse}
      />
      <Toaster />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
