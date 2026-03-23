import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { motion } from "motion/react";
import { useGetContactInfo } from "../hooks/useQueries";

export function ContactSection() {
  const { data: info } = useGetContactInfo();

  const phone = info?.phone || "+91 7023628763";
  const email = info?.email || "skiltrixsupport@gmail.com";
  const address =
    info?.address || "Sector 10, Malviya Nagar, Jaipur, Rajasthan";

  const contactCards = [
    {
      icon: Phone,
      title: "Phone",
      value: phone,
      href: `tel:${phone.replace(/\s/g, "")}`,
      desc: "Call us anytime, Mon–Sat 9am–6pm",
    },
    {
      icon: Mail,
      title: "Email",
      value: email,
      href: `mailto:${email}`,
      desc: "We reply within 24 hours",
    },
    {
      icon: MapPin,
      title: "Address",
      value: address,
      href: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
      desc: "Come visit us anytime",
    },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      href: info?.facebook,
      label: "Facebook",
      color: "text-blue-600",
    },
    {
      icon: Instagram,
      href: info?.instagram,
      label: "Instagram",
      color: "text-pink-500",
    },
    {
      icon: Twitter,
      href: info?.twitter,
      label: "Twitter",
      color: "text-sky-500",
    },
    {
      icon: Youtube,
      href: info?.youtube,
      label: "YouTube",
      color: "text-red-500",
    },
  ].filter((s) => s.href && s.href.trim() !== "");

  return (
    <section
      id="contact"
      className="py-16 sm:py-20 bg-[oklch(0.975_0.008_252)]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-blue mb-3">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Contact Us
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Have questions about admissions, courses, or anything else?
            We&apos;d love to hear from you.
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
          {contactCards.map(({ icon: Icon, title, value, href, desc }, i) => (
            <motion.a
              key={title}
              href={href}
              target={title === "Address" ? "_blank" : undefined}
              rel={title === "Address" ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              data-ocid={`contact.card.${i + 1}` as `contact.card.${1 | 2 | 3}`}
              className="group flex flex-col items-center text-center bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md border border-border transition-all duration-200 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-4 group-hover:bg-brand-blue/20 transition-colors">
                <Icon className="w-7 h-7 text-brand-blue" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                {title}
              </h3>
              <p className="text-brand-blue font-medium text-sm break-all">
                {value}
              </p>
              <p className="text-muted-foreground text-xs mt-1">{desc}</p>
            </motion.a>
          ))}
        </div>

        {/* Social Media Links */}
        {socialLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center justify-center gap-4 mb-10"
          >
            <span className="text-sm text-muted-foreground">Follow us:</span>
            {socialLinks.map(({ icon: Icon, href, label, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${color}`}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </motion.div>
        )}

        {/* Google Map */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="overflow-hidden rounded-2xl border border-border shadow-sm"
          data-ocid="contact.map_marker"
        >
          <iframe
            title="SKILTRIX Location – Malviya Nagar, Jaipur"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.123!2d75.8267!3d26.8505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db5e3a8b64b9d%3A0x1!2sMalviya+Nagar%2C+Jaipur%2C+Rajasthan!5e0!3m2!1sen!2sin!4v1!5m2!1sen!2sin"
            width="100%"
            height="380"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </div>
    </section>
  );
}
