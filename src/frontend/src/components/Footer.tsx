import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Courses", href: "#courses" },
  { label: "Admissions", href: "#cta" },
  { label: "Contact", href: "#contact" },
];

const PROGRAMS = [
  "Web Development",
  "Data Science",
  "Digital Marketing",
  "UI/UX Design",
  "Business Analytics",
  "Cybersecurity",
];

const SOCIAL = [
  { Icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { Icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { Icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
  { Icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { Icon: Youtube, label: "YouTube", href: "https://youtube.com" },
];

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer id="footer" className="bg-navy text-white/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
                <span className="text-white font-bold text-sm">SK</span>
              </div>
              <span className="text-xl font-bold text-white">
                SKIL<span className="text-[oklch(0.72_0.18_252)]">TRIX</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              Empowering the next generation of professionals through
              world-class, industry-aligned education.
            </p>
            <div className="flex gap-3 mt-5">
              {SOCIAL.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-blue transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="hover:text-brand-blue transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-bold text-white mb-4">Programs</h4>
            <ul className="space-y-2.5 text-sm">
              {PROGRAMS.map((p) => (
                <li key={p}>
                  <a
                    href="#courses"
                    className="hover:text-brand-blue transition-colors"
                  >
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="text-brand-blue mt-0.5 shrink-0">📍</span>
                <span>Sector 10, Malviya Nagar, Jaipur, Rajasthan 302017</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-blue mt-0.5 shrink-0">📞</span>
                <a
                  href="tel:+917023628763"
                  className="hover:text-brand-blue transition-colors"
                >
                  +91 7023628763
                </a>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-blue mt-0.5 shrink-0">✉️</span>
                <a
                  href="mailto:skiltrixsupport@gmail.com"
                  className="hover:text-brand-blue transition-colors break-all"
                >
                  skiltrixsupport@gmail.com
                </a>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-blue mt-0.5 shrink-0">🕐</span>
                <span>Mon–Sat: 9:00 AM – 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>© {year} SKILTRIX Institute. All rights reserved.</span>
          <span>
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/70 transition-colors"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
