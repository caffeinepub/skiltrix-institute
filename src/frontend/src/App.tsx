import { AboutSection } from "@/components/AboutSection";
import { AdminPanel } from "@/components/AdminPanel";
import { ApplyModal } from "@/components/ApplyModal";
import { CTABand } from "@/components/CTABand";
import { CoursesSection } from "@/components/CoursesSection";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

function AppContent() {
  const [applyOpen, setApplyOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(window.location.hash === "#admin");

  useEffect(() => {
    const handleHash = () => setIsAdmin(window.location.hash === "#admin");
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  if (isAdmin) {
    return (
      <>
        <AdminPanel />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <Navbar onApplyClick={() => setApplyOpen(true)} />
      <main>
        <HeroSection onApplyClick={() => setApplyOpen(true)} />
        <AboutSection />
        <CoursesSection />
        <CTABand onApplyClick={() => setApplyOpen(true)} />
      </main>
      <Footer />
      <ApplyModal open={applyOpen} onOpenChange={setApplyOpen} />
      <Toaster />
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
