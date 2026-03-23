import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "motion/react";

const contactCards = [
  {
    icon: Phone,
    title: "Phone",
    value: "+91 7023628763",
    href: "tel:+917023628763",
    desc: "Call us anytime, Mon–Sat 9am–6pm",
  },
  {
    icon: Mail,
    title: "Email",
    value: "skiltrixsupport@gmail.com",
    href: "mailto:skiltrixsupport@gmail.com",
    desc: "We reply within 24 hours",
  },
  {
    icon: MapPin,
    title: "Address",
    value: "Sector 10, Malviya Nagar",
    href: "https://maps.google.com/?q=Malviya+Nagar+Jaipur+Rajasthan",
    desc: "Jaipur, Rajasthan 302017",
  },
];

export function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-[oklch(0.975_0.008_252)]">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-blue mb-3">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Contact Us
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Have questions about admissions, courses, or anything else? We'd
            love to hear from you.
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
              className="group flex flex-col items-center text-center bg-white rounded-2xl p-8 shadow-sm hover:shadow-md border border-border transition-all duration-200 hover:-translate-y-1"
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
            height="420"
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
