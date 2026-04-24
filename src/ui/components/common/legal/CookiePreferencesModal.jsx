import { useEffect, useState } from "react";
import Modal from "@/ui/components/common/modals/Modal";
import { ROUTES } from "@/app/routes";
import { useCookieConsent } from "@/ui/hooks";
import { COOKIE_CONSENT_CATEGORY_DETAILS } from "@/ui/legal/cookieConsentConfig";
import {Checkbox, CoolButton, WhiteContainer} from "@/ui/components/common/index.js";

export default function CookiePreferencesModal() {
  const {
    savePreferences,
    closePreferences,
    isPreferencesOpen,
    consent,
  } = useCookieConsent();
  const [draft, setDraft] = useState(consent.categories);

  useEffect(() => {
    if (!isPreferencesOpen) return;
    setDraft(consent.categories);
  }, [consent.categories, isPreferencesOpen]);

  if (!isPreferencesOpen) return null;

  return (
    <Modal title="Preferenze cookie" onClose={closePreferences}>
      <WhiteContainer className="space-y-5 max-w-xl rounded-2xl">
        <p className="text-sm leading-relaxed text-slate-700">
          Puoi modificare in qualsiasi momento le categorie opzionali. I cookie
          tecnici restano sempre attivi per garantire autenticazione, sicurezza
          e funzionamento della piattaforma.
        </p>

        <div className="space-y-3">
          {COOKIE_CONSENT_CATEGORY_DETAILS.map((category) => {
            const checked = category.required
              ? true
              : Boolean(draft[category.key]);

            return (
              <label
                key={category.key}
                className="flex items-start gap-3 rounded-2xl border border-[#d4f1ef] bg-white p-4"
              >
                  <Checkbox
                      label={category.label}
                      description={category.description}
                      checked={checked}
                      disabled={category.required}
                      onChange={(event) => {
                          if (category.required) return;

                          setDraft((current) => ({
                              ...current,
                              [category.key]: event.target.checked,
                          }));
                      }}
                      className={"w-full"}
                  />
              </label>
            );
          })}
        </div>

        <p className="text-xs leading-relaxed text-slate-500">
          Per l&apos;elenco completo degli strumenti usati e delle relative
          finalita&apos; consulta la{" "}
          <a
            href={ROUTES.COOKIE_POLICY}
            className="font-medium text-[#228E8D] underline underline-offset-4"
          >
            Cookie Policy
          </a>
          .
        </p>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <CoolButton
            onClick={() => savePreferences(draft)}
            className={"!py-2 !px-4"}
          >
            Salva preferenze
          </CoolButton>
        </div>
      </WhiteContainer>
    </Modal>
  );
}
