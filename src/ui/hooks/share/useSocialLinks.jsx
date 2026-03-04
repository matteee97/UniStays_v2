import {
  faWhatsapp,
  faTelegram,
  faXTwitter,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

const SOCIAL_LABELS = Object.freeze({
  WHATSAPP: "WhatsApp",
  TELEGRAM: "Telegram",
  TWITTER: "Twitter",
  FACEBOOK: "Facebook",
  COPY: "Copia link",
});

const SUCCESS_COPY_MESSAGE = "Link copiato negli appunti!";
const ERROR_COPY_MESSAGE =
  "Impossibile copiare il link. Verifica i permessi del browser.";

const sanitizeShareText = (value) =>
  typeof value === "string" ? value.trim() : "";

const sanitizeAbsoluteUrl = (value) => {
  if (typeof value !== "string" || value.trim().length === 0) return "";

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return parsed.href;
  } catch {
    return "";
  }
};

const getCurrentLocationHref = () =>
  sanitizeAbsoluteUrl(globalThis?.location?.href || "");

const copyWithExecCommand = (value) => {
  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    document.body.removeChild(textarea);
  }

  return copied;
};

/**
 * Build share links for social platforms.
 *
 * @param {{ text?: string, url?: string }} [params]
 * @returns {Array<{icon: any, label: string, url?: string}>}
 */
export const buildSocialLinks = ({ text = "", url = "" } = {}) => {
  const safeText = sanitizeShareText(text);
  const safeUrl = sanitizeAbsoluteUrl(url);
  const encodedText = encodeURIComponent(safeText);
  const encodedUrl = encodeURIComponent(safeUrl);
  const whatsappPayload = [safeText, safeUrl].filter(Boolean).join(" ");

  return [
    {
      icon: faWhatsapp,
      label: SOCIAL_LABELS.WHATSAPP,
      url: `https://wa.me/?text=${encodeURIComponent(whatsappPayload)}`,
    },
    {
      icon: faTelegram,
      label: SOCIAL_LABELS.TELEGRAM,
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      icon: faXTwitter,
      label: SOCIAL_LABELS.TWITTER,
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      icon: faFacebook,
      label: SOCIAL_LABELS.FACEBOOK,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      icon: faCopy,
      label: SOCIAL_LABELS.COPY,
    },
  ];
};

/**
 * Copy a link to clipboard with fallback when Clipboard API is unavailable.
 *
 * @param {object} params
 * @param {string} params.url
 * @param {{ writeText?: (value: string) => Promise<void> }} [params.clipboard]
 * @param {(value: string) => boolean} [params.fallbackCopy]
 * @param {(message: string) => void} [params.onSuccess]
 * @param {(message: string) => void} [params.onError]
 * @returns {Promise<boolean>}
 */
export const copyLinkToClipboard = async ({
  url,
  clipboard = globalThis?.navigator?.clipboard,
  fallbackCopy = copyWithExecCommand,
  onSuccess = (message) => toast.message(message),
  onError = (message) => toast.error(message),
}) => {
  const safeUrl = sanitizeAbsoluteUrl(url);
  if (!safeUrl) {
    onError(ERROR_COPY_MESSAGE);
    return false;
  }

  try {
    if (typeof clipboard?.writeText === "function") {
      await clipboard.writeText(safeUrl);
      onSuccess(SUCCESS_COPY_MESSAGE);
      return true;
    }
  } catch {
    // fallback below
  }

  if (fallbackCopy(safeUrl)) {
    onSuccess(SUCCESS_COPY_MESSAGE);
    return true;
  }

  onError(ERROR_COPY_MESSAGE);
  return false;
};

/**
 * Hook to provide social links bound to current page URL.
 *
 * @param {string} [text=""]
 * @returns {Array<{icon: any, label: string, url?: string, action?: Function}>}
 */
export default function useSocialLinks(text = "") {
  const currentUrl = getCurrentLocationHref();
  const links = useMemo(
    () => buildSocialLinks({ text, url: currentUrl }),
    [text, currentUrl]
  );

  const handleCopy = useCallback(() => {
    void copyLinkToClipboard({ url: currentUrl });
  }, [currentUrl]);

  return useMemo(
    () =>
      links.map((link) =>
        link.label === SOCIAL_LABELS.COPY
          ? {
              ...link,
              action: handleCopy,
            }
          : link
      ),
    [handleCopy, links]
  );
}
