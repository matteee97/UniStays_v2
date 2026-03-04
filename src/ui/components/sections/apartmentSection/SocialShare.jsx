import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { useClickOutside } from "@/ui/hooks";

export default function SocialShare({ socialLinks }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef();
  useClickOutside(containerRef, () => setOpen(false), null, open);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Condividi"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full flex items-center"
      >
        <FontAwesomeIcon
          icon={faShareNodes}
          className="w-5 h-5 text-[#228E8D]"
        />
      </button>

      {open && (
        <div
          className="absolute top-10 right-0 p-3 w-48 bg-white border-2 border-[#D4F1EF] shadow-xl z-30 rounded-2xl transition-all duration-200"
          role="menu"
          aria-label="Social share menu"
        >
          <ul className="space-y-3">
            {socialLinks.map((social, i) => (
              <li key={i}>
                {social.url ? (
                  <a
                    href={social.url}
                    target="_blank"
                    role="menuitem"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-md transition text-sm text-gray-600 hover:underline"
                  >
                    <FontAwesomeIcon icon={social.icon} className="w-4 h-4" />
                    {social.label}
                  </a>
                ) : (
                  <button
                    onClick={social.action}
                    role="menuitem"
                    className="flex items-center gap-2 p-2 rounded-md text-sm text-gray-600 w-full text-left hover:underline"
                  >
                    <FontAwesomeIcon icon={social.icon} className="w-4 h-4" />
                    {social.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
