import {
  faFacebook,
  faInstagram,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import LegalLinks from "@/ui/components/common/legal/LegalLinks.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Footer({
  logo = "/img/ExtendedLogo.svg",
  mail = "unistays@support.it",
  number = "+39 331 993 2488",
  social1 = "Facebook",
  social2 = "Instagram",
  linkSocial1 = "https://www.facebook.com/",
  linkSocial2 = "https://www.instagram.com/",
  linkSocial3 = "https://www.x.com/",
  tagline = "Alloggi, esperienze e supporto pensati per studenti e giovani professionisti.",
  links = [],
}) {
  const currentYear = new Date().getFullYear();
  const parsedLinks = Array.isArray(links) ? links : [];

  const socialLinks = [
    { label: social1, href: linkSocial1, icon: faFacebook },
    { label: social2, href: linkSocial2, icon: faInstagram },
    { label: "X", href: linkSocial3, icon: faXTwitter },
  ].filter(({ href }) => Boolean(href));

  const quickLinks = parsedLinks.filter((link) => link?.label && link?.href);

  return (
    <footer className="relative overflow-hidden bg-[#0d1413] dark:bg-[#050a13] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(34,142,141,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(34,142,141,0.14),transparent_30%)] dark:opacity-5"
        aria-hidden
      />

      <div className="relative mx-auto w-full px-4 py-16 lg:px-8 lg:py-20 mb-10 sm:mb-0">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:grid-cols-[50%_1fr_1fr_1fr]">
          <div className="space-y-4 mr-12">
            <img
              src={logo}
              className="h-12 w-auto"
              alt="UniStays logo"
              loading="lazy"
            />
            <p className="text-sm text-gray-300 max-w-xs leading-relaxed">
              {tagline}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#d4f1ef]">
              Contatti
            </h2>
            <ul className="mt-3 space-y-2 text-gray-200">
              {mail ? (
                <li>
                  <a
                    href={`mailto:${mail}`}
                    className="hover:text-[#d4f1ef] transition-colors"
                  >
                    {mail}
                  </a>
                </li>
              ) : null}
              {number ? (
                <li>
                  <a
                    href={`tel:${number.replace(/\s+/g, "")}`}
                    className="hover:text-[#d4f1ef] transition-colors"
                  >
                    {number}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#d4f1ef]">
              Seguici
            </h2>
            <ul className="mt-3 space-y-2 text-gray-200">
              {socialLinks.map(({ label, href, icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="inline-flex items-center gap-2 hover:text-[#d4f1ef] transition-colors"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FontAwesomeIcon
                      icon={icon}
                      className="h-4 w-4 text-[#228E8D]"
                    />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#d4f1ef]">
              Legal
            </h2>
            <div className="mt-3">
              <LegalLinks />
            </div>
          </div>
        </div>

        {quickLinks.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-200">
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg border border-white/5 bg-white/5 px-3 py-2 hover:border-[#d4f1ef] hover:text-[#d4f1ef] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-gray-400">
            © {currentYear} UniStays. Tutti i diritti riservati.
          </span>
          <div className="flex items-center gap-4">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                key={`icon-${label}`}
                href={href}
                className="text-[#d4f1ef] hover:text-white transition-colors"
                aria-label={label}
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon
                  icon={icon}
                  className="h-4 w-4 text-[#228e8c]"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
