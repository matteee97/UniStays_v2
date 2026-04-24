import { ROUTES } from "@/app/routes";
import { useCookieConsent } from "@/ui/hooks";
import {CoolButton} from "@/ui/components/common/index.js";
import {APP_NAME} from "@/shared/constants/index.js";

export default function CookieConsentBanner() {
  const {
    acceptAll,
    rejectOptional,
    isPreferencesOpen,
    openPreferences,
    shouldShowBanner,
  } = useCookieConsent();

  if (!shouldShowBanner) return null;

  return (
    <div className={`fixed inset-x-0 bottom-0 z-[9998] p-3 sm:p-4 ${isPreferencesOpen ? "translate-y-full" : ""} transition-transform duration-500`}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 rounded-[28px] border border-white/10 bg-[#081110]/95 px-5 py-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8fd4cf]">
            Preferenze Cookie
          </p>
          <h2 className="text-lg font-semibold sm:text-xl">
              Aiutaci a migliorare la tua esperienza d'uso
          </h2>
          <p className="max-w-4xl text-sm leading-relaxed text-white/90">
              Utilizziamo i cookie e altre tecnologie per personalizzare i contenuti, misurare l'efficacia degli annunci pubblicitari e offrire un'esperienza d'uso ottimizzata. Alcuni cookie sono necessari per il funzionamento del sito e non possono essere disattivati. Acconsentendo al loro utilizzo, dichiari di accettare la {" "}
            <a
              href={ROUTES.COOKIE_POLICY}
              className="font-medium text-[#8fd4cf] underline underline-offset-4"
            >
              Cookie Policy di {APP_NAME}
            </a>
            . Puoi aggiornare le tue preferenze in qualsiasi momento.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:items-center">
          <CoolButton
            onClick={acceptAll}
            className="!px-4 !py-2.5"
          >
            Accetta tutto
          </CoolButton>
          <CoolButton
            onClick={rejectOptional}
            className="!px-4 !py-2.5"
          >
              Solo quelli necessari
          </CoolButton>
          <button
              type="button"
              onClick={openPreferences}
              className="rounded-full border border-[#228E8D]/50 bg-[#0f2120] px-4 py-2.5 text-sm font-medium text-[#d2f1ef] transition hover:border-[#62c1ba] hover:bg-[#12302f]"
          >
              Personalizza
          </button>
        </div>
      </div>
    </div>
  );
}
