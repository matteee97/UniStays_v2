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
          Questa Cookie Policy descrive come {LEGAL_CONTACT.brandName} utilizza
          cookie e tecnologie similari (es. local storage, session storage e
          storage locale dei provider tecnici) durante la navigazione del sito.
        </p>
        <p className={paragraphClass}>
          La policy va letta insieme alla{" "}
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
          dell&apos;utente. Tecnologie equivalenti come local storage,
          session storage o cache locale dei provider permettono di memorizzare
          informazioni necessarie al funzionamento del servizio, alle
          preferenze dell&apos;utente o all&apos;attivazione di funzionalita&apos;
          opzionali.
        </p>
      </section>

      <section className="space-y-3" id="categorie-effettive">
        <h2 className={sectionTitleClass}>
          2. Categorie effettivamente utilizzate
        </h2>
        <ul className={listClass}>
          <li>
            <strong>Tecnici e necessari:</strong> autenticazione, sicurezza,
            sessione account, persistenza minima del servizio, protezione
            dell&apos;accesso e funzionamento base della piattaforma.
          </li>
          <li>
            <strong>Preferenze richieste dall&apos;utente:</strong> memoria di
            scelte come tema, viste interfaccia e messaggi informativi gia&apos;
            chiusi dall&apos;utente.
          </li>
          <li>
            <strong>Analytics opzionali:</strong> Google Analytics 4 viene
            attivato solo dopo consenso esplicito dell&apos;utente.
          </li>
          <li>
            <strong>Mappe e contenuti esterni opzionali:</strong> Google Maps
            viene caricata solo dopo consenso o attivazione esplicita della
            funzionalita&apos; mappa.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="strumenti">
        <h2 className={sectionTitleClass}>
          3. Strumenti e finalita&apos; principali
        </h2>
        <ul className={listClass}>
          <li>
            <strong>Clerk:</strong> autenticazione, sicurezza login e gestione
            della sessione account.
          </li>
          <li>
            <strong>Firebase:</strong> autenticazione tecnica, persistenza
            locale funzionale, cache e servizi backend della piattaforma.
          </li>
          <li>
            <strong>Storage applicativo first-party:</strong> memorizzazione di
            tema, preferenze di visualizzazione, suggerimenti gia&apos; chiusi e
            deduplica tecnica di alcuni eventi interni.
          </li>
          <li>
            <strong>Google Analytics 4:</strong> misurazione del traffico e
            delle performance del sito, solo se l&apos;utente presta il proprio
            consenso.
          </li>
          <li>
            <strong>Google Maps:</strong> visualizzazione di mappe e
            geolocalizzazione dell&apos;immobile, solo dopo consenso o richiesta
            esplicita di caricamento.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="base-giuridica">
        <h2 className={sectionTitleClass}>4. Base giuridica</h2>
        <ul className={listClass}>
          <li>
            Strumenti tecnici e necessari: esecuzione del servizio richiesto,
            sicurezza e legittimo interesse del titolare al corretto
            funzionamento della piattaforma.
          </li>
          <li>
            Preferenze strettamente collegate a una scelta esplicita
            dell&apos;utente: esecuzione della funzionalita&apos; richiesta.
          </li>
          <li>
            Google Analytics 4 e Google Maps: consenso dell&apos;utente, quando
            richiesto dalla normativa applicabile.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="durata">
        <h2 className={sectionTitleClass}>5. Durata di conservazione</h2>
        <ul className={listClass}>
          <li>
            cookie di sessione: restano attivi fino alla chiusura del browser o
            alla fine della sessione tecnica;
          </li>
          <li>
            local storage e preferenze first-party: restano memorizzati fino a
            cancellazione da parte dell&apos;utente o aggiornamento della
            preferenza;
          </li>
          <li>
            preferenze di consenso cookie: conservate per 6 mesi, salvo revoca
            anticipata o rinnovo;
          </li>
          <li>
            analytics e mappe di terze parti: secondo i tempi tecnici previsti
            dai rispettivi provider.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="consenso">
        <h2 className={sectionTitleClass}>6. Gestione del consenso</h2>
        <p className={paragraphClass}>
          Al primo accesso l&apos;utente puo&apos; accettare, rifiutare oppure
          personalizzare le categorie opzionali. Google Analytics 4 e Google
          Maps restano bloccati finche&apos; non viene registrata una scelta
          positiva.
        </p>
        <p className={paragraphClass}>
          Le preferenze possono essere modificate in qualsiasi momento tramite il
          link &quot;Preferenze Cookie&quot; presente nel footer del sito.
        </p>
      </section>

      <section className="space-y-3" id="marketing">
        <h2 className={sectionTitleClass}>7. Marketing e profilazione</h2>
        <p className={paragraphClass}>
          Alla data dell&apos;ultimo aggiornamento di questa informativa,
          {LEGAL_CONTACT.brandName} non utilizza sul sito cookie di marketing o
          profilazione come categoria primaria.
        </p>
      </section>

      <section className="space-y-3" id="browser">
        <h2 className={sectionTitleClass}>
          8. Gestione tramite browser e provider
        </h2>
        <ul className={listClass}>
          <li>impostazioni del browser per blocco o cancellazione dei cookie;</li>
          <li>
            cancellazione manuale di local storage e session storage dal
            browser;
          </li>
          <li>
            strumenti di opt-out o informative dei provider terzi, dove
            disponibili.
          </li>
        </ul>
        <p className={paragraphClass}>
          Il blocco degli strumenti tecnici necessari puo&apos; compromettere il
          funzionamento di alcune funzionalita&apos; del sito.
        </p>
      </section>

      <section className="space-y-3" id="contatti">
        <h2 className={sectionTitleClass}>9. Contatti</h2>
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
