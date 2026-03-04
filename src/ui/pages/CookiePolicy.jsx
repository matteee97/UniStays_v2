import { Link } from "react-router-dom";
import LegalPageLayout from "@/ui/components/common/legal/LegalPageLayout";
import { ROUTES } from "@/app/routes";
import { LEGAL_CONTACT, LEGAL_LAST_UPDATED } from "@/ui/legal/legalInfo";

const sectionTitleClass =
  "text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100";
const paragraphClass = "leading-relaxed";
const listClass = "list-disc pl-5 space-y-2";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      description="Informativa sull'uso di cookie e tecnologie similari da parte di UniStays."
      updatedAt={LEGAL_LAST_UPDATED}
    >
      <section className="space-y-3">
        <p className={paragraphClass}>
          Questa Cookie Policy spiega come {LEGAL_CONTACT.brandName} utilizza
          cookie e tecnologie similari (es. local storage e session storage)
          durante la navigazione del sito.
        </p>
        <p className={paragraphClass}>
          La policy deve essere letta insieme alla{" "}
          <Link className="text-[#228E8D] underline" to={ROUTES.PRIVACY}>
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3" id="cosa-sono">
        <h2 className={sectionTitleClass}>
          1. Cosa sono cookie e tecnologie similari
        </h2>
        <p className={paragraphClass}>
          I cookie sono piccoli file di testo salvati sul dispositivo
          dell&apos;utente durante la navigazione. Tecnologie similari (es.
          local/session storage) consentono di memorizzare informazioni utili al
          funzionamento e all&apos;ottimizzazione del servizio.
        </p>
      </section>

      <section className="space-y-3" id="tipologie">
        <h2 className={sectionTitleClass}>2. Tipologie utilizzate</h2>
        <ul className={listClass}>
          <li>
            <strong>Tecnici/Necessari:</strong> indispensabili per
            autenticazione, sicurezza, gestione sessione, navigazione e
            funzionalita&apos; base.
          </li>
          <li>
            <strong>Funzionali:</strong> permettono preferenze utente (es. tema,
            suggerimenti, messaggi one-time, deduplica eventi).
          </li>
          <li>
            <strong>Analytics:</strong> utilizzati per analizzare traffico e
            performance della piattaforma.
          </li>
          <li>
            <strong>Marketing/Profilazione:</strong> non usati come categoria
            primaria nel perimetro applicativo corrente salvo eventuali future
            integrazioni esplicitamente indicate.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="strumenti">
        <h2 className={sectionTitleClass}>
          3. Strumenti e servizi che possono impostare cookie
        </h2>
        <ul className={listClass}>
          <li>Clerk (autenticazione e gestione sessione account).</li>
          <li>Firebase (servizi backend, autenticazione e persistenza).</li>
          <li>Google Maps (mappe e geolocalizzazione).</li>
          <li>Google Analytics 4 (analisi statistiche del traffico).</li>
        </ul>
        <p className={paragraphClass}>
          Ogni fornitore tratta i dati secondo le proprie policy. L&apos;utente
          puo&apos; consultare le informative ufficiali sui rispettivi siti.
        </p>
      </section>

      <section className="space-y-3" id="base-giuridica">
        <h2 className={sectionTitleClass}>4. Base giuridica</h2>
        <ul className={listClass}>
          <li>
            Cookie tecnici/necessari: legittimo interesse e/o esecuzione del
            servizio richiesto.
          </li>
          <li>
            Cookie analytics non strettamente necessari: consenso ove richiesto
            dalla normativa applicabile.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="durata">
        <h2 className={sectionTitleClass}>5. Durata di conservazione</h2>
        <p className={paragraphClass}>
          La durata varia in base alla tecnologia e al fornitore:
        </p>
        <ul className={listClass}>
          <li>cookie di sessione: cancellati alla chiusura del browser;</li>
          <li>
            cookie persistenti/local storage: conservati fino alla scadenza
            tecnica o cancellazione manuale da parte dell&apos;utente.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="gestione-preferenze">
        <h2 className={sectionTitleClass}>
          6. Come gestire o revocare le preferenze
        </h2>
        <p className={paragraphClass}>
          L&apos;utente puo&apos; gestire i cookie attraverso:
        </p>
        <ul className={listClass}>
          <li>impostazioni del browser (blocco o cancellazione cookie);</li>
          <li>
            strumenti di opt-out offerti dai provider terzi, dove disponibili;
          </li>
          <li>
            eventuali strumenti di consenso messi a disposizione sul sito.
          </li>
        </ul>
        <p className={paragraphClass}>
          Il blocco dei cookie tecnici puo&apos; compromettere il funzionamento
          di alcune funzionalita&apos; del sito.
        </p>
      </section>

      <section className="space-y-3" id="contatti">
        <h2 className={sectionTitleClass}>7. Contatti</h2>
        <p className={paragraphClass}>
          Per chiarimenti sull&apos;uso di cookie e tecnologie similari scrivi a{" "}
          <a
            href={`mailto:${LEGAL_CONTACT.privacyEmail}`}
            className="text-[#228E8D] underline"
          >
            {LEGAL_CONTACT.privacyEmail}
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
