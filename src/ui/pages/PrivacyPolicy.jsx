import { Link } from "react-router-dom";
import LegalPageLayout from "@/ui/components/common/legal/LegalPageLayout";
import { ROUTES } from "@/app/routes";
import {
  LEGAL_CONTACT,
  LEGAL_LAST_UPDATED,
  LEGAL_PROVIDER_LIST,
} from "@/ui/legal/legalInfo";
import { USER_ROLES } from "@/shared/types";

const sectionTitleClass =
  "text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100";
const paragraphClass = "leading-relaxed";
const listClass = "list-disc pl-5 space-y-2";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description="Informativa sul trattamento dei dati personali degli utenti UniStays ai sensi del GDPR."
      updatedAt={LEGAL_LAST_UPDATED}
    >
      <section className="space-y-3">
        <p className={paragraphClass}>
          La presente informativa descrive come {LEGAL_CONTACT.brandName} tratta
          i dati personali degli utenti che navigano o utilizzano la piattaforma
          web.
        </p>
        <p className={paragraphClass}>
          L&apos;informativa e&apos; resa ai sensi del Regolamento (UE) 2016/679
          (GDPR) e della normativa nazionale applicabile in materia di
          protezione dei dati personali.
        </p>
      </section>

      <section className="space-y-3" id="titolare">
        <h2 className={sectionTitleClass}>1. Titolare del trattamento</h2>
        <ul className={listClass}>
          <li>
            Titolare: <strong>{LEGAL_CONTACT.legalEntityName}</strong>
          </li>
          <li>Sede: {LEGAL_CONTACT.registeredOffice}</li>
          <li>
            Email privacy:{" "}
            <a
              href={`mailto:${LEGAL_CONTACT.privacyEmail}`}
              className="text-[#228E8D] underline"
            >
              {LEGAL_CONTACT.privacyEmail}
            </a>
          </li>
          <li>
            Contatto supporto:{" "}
            <a
              href={`mailto:${LEGAL_CONTACT.supportEmail}`}
              className="text-[#228E8D] underline"
            >
              {LEGAL_CONTACT.supportEmail}
            </a>{" "}
            - {LEGAL_CONTACT.phone}
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="categorie-dati">
        <h2 className={sectionTitleClass}>2. Categorie di dati trattati</h2>
        <ul className={listClass}>
          <li>
            Dati di navigazione: indirizzo IP, user-agent, eventi tecnici,
            pagine visitate, tempi di permanenza, referrer.
          </li>
          <li>
            Dati account: identificativo utente, email, eventuale nome visuale e
            immagine profilo forniti in fase di autenticazione.
          </li>
          <li>
            Dati di profilo e annunci: informazioni su {USER_ROLES.HOST},
            alloggi, foto, disponibilita&apos;, caratteristiche e
            geolocalizzazione immobile.
          </li>
          <li>
            Dati di interazione: chat, preferiti, recensioni, risposte,
            segnalazioni e metadati collegati.
          </li>
          <li>
            Dati contatto: nome, email, messaggio e motivazione inseriti tramite
            form contatti.
          </li>
          <li>
            Dati analytics: metriche aggregate della piattaforma e degli
            annunci.
          </li>
          <li>
            Preferenze tecniche e di consenso: scelte relative a tema,
            preferenze interfaccia e categorie cookie opzionali abilitate o
            rifiutate.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="finalita-basi-giuridiche">
        <h2 className={sectionTitleClass}>
          3. Finalita&apos; e basi giuridiche
        </h2>
        <ul className={listClass}>
          <li>
            Erogazione del servizio (ricerca alloggi, pubblicazione annunci,
            chat, gestione account): esecuzione di misure precontrattuali e/o
            contrattuali.
          </li>
          <li>
            Sicurezza, prevenzione abusi, moderazione contenuti e gestione
            segnalazioni: legittimo interesse del titolare e, ove applicabile,
            adempimento di obblighi di legge.
          </li>
          <li>
            Assistenza utenti e gestione richieste inviate tramite form:
            esecuzione di misure precontrattuali o legittimo interesse.
          </li>
          <li>
            Analisi statistiche con Google Analytics 4: consenso
            dell&apos;utente, quando richiesto dalla normativa e secondo le
            preferenze espresse nel pannello cookie.
          </li>
          <li>
            Visualizzazione di Google Maps e contenuti esterni collegati:
            consenso o richiesta esplicita di caricamento della mappa da parte
            dell&apos;utente.
          </li>
          <li>
            Adempimenti normativi, fiscali e richieste dell&apos;autorita&apos;:
            obbligo legale.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="modalita-trattamento">
        <h2 className={sectionTitleClass}>4. Modalita&apos; di trattamento</h2>
        <p className={paragraphClass}>
          Il trattamento avviene con strumenti digitali e organizzativi idonei a
          garantire riservatezza, integrita&apos; e disponibilita&apos; dei
          dati, secondo principi di minimizzazione, liceita&apos; e limitazione
          delle finalita&apos;.
        </p>
        <p className={paragraphClass}>
          Il conferimento dei dati contrassegnati come obbligatori e&apos;
          necessario per l&apos;erogazione dei servizi principali della
          piattaforma. Il mancato conferimento puo&apos; impedire
          l&apos;utilizzo di alcune funzionalita&apos;.
        </p>
      </section>

      <section className="space-y-3" id="conservazione">
        <h2 className={sectionTitleClass}>5. Periodi di conservazione</h2>
        <ul className={listClass}>
          <li>
            Dati account: per la durata del rapporto e successivamente per il
            periodo necessario a tutela legale/amministrativa.
          </li>
          <li>
            Dati annunci e contenuti correlati: fino alla rimozione da parte
            dell&apos;utente o alla chiusura dell&apos;account, salvo obblighi
            di conservazione.
          </li>
          <li>
            Chat, recensioni e segnalazioni: per il tempo necessario a gestione
            del servizio, sicurezza, prevenzione abusi e tutela in caso di
            contestazioni.
          </li>
          <li>
            Dati analytics/cookie: secondo i tempi definiti dai singoli
            strumenti e dalle preferenze di consenso.
          </li>
          <li>
            Preferenze cookie: fino a 6 mesi dalla registrazione della scelta,
            salvo revoca o rinnovo anticipato.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="destinatari">
        <h2 className={sectionTitleClass}>
          6. Destinatari, responsabili e trasferimenti
        </h2>
        <p className={paragraphClass}>
          I dati possono essere trattati da personale autorizzato e da fornitori
          terzi nominati responsabili del trattamento. Principali categorie di
          fornitori:
        </p>
        <ul className={listClass}>
          {LEGAL_PROVIDER_LIST.map((provider) => (
            <li key={provider}>{provider}</li>
          ))}
        </ul>
        <p className={paragraphClass}>
          Qualora i dati siano trasferiti verso Paesi extra-SEE, il titolare
          adotta le garanzie previste dagli artt. 44 e ss. GDPR (es. clausole
          contrattuali standard o altre basi giuridiche applicabili).
        </p>
      </section>

      <section className="space-y-3" id="diritti">
        <h2 className={sectionTitleClass}>7. Diritti dell&apos;interessato</h2>
        <p className={paragraphClass}>
          L&apos;utente puo&apos; esercitare in qualsiasi momento i diritti di
          accesso, rettifica, cancellazione, limitazione, opposizione e
          portabilita&apos;, nei limiti previsti dal GDPR.
        </p>
        <p className={paragraphClass}>
          Le richieste possono essere inviate a{" "}
          <a
            href={`mailto:${LEGAL_CONTACT.privacyEmail}`}
            className="text-[#228E8D] underline"
          >
            {LEGAL_CONTACT.privacyEmail}
          </a>
          . L&apos;utente ha inoltre diritto di proporre reclamo
          all&apos;Autorita&apos; Garante per la protezione dei dati personali.
        </p>
      </section>

      <section className="space-y-3" id="sicurezza">
        <h2 className={sectionTitleClass}>8. Sicurezza del trattamento</h2>
        <p className={paragraphClass}>
          Sono adottate misure tecniche e organizzative adeguate al rischio, tra
          cui controlli di accesso, autenticazione, separazione dei privilegi,
          audit delle operazioni amministrative e protezione
          dell&apos;infrastruttura.
        </p>
      </section>

      <section className="space-y-3" id="minori">
        <h2 className={sectionTitleClass}>9. Minori</h2>
        <p className={paragraphClass}>
          I servizi sono rivolti a utenti maggiorenni. Qualora vengano rilevati
          dati riferiti a minori trattati senza idoneo presupposto, il titolare
          potra&apos; adottare misure di limitazione o cancellazione.
        </p>
      </section>

      <section className="space-y-3" id="aggiornamenti">
        <h2 className={sectionTitleClass}>
          10. Aggiornamenti dell&apos;informativa
        </h2>
        <p className={paragraphClass}>
          Il titolare puo&apos; aggiornare periodicamente la presente Privacy
          Policy. Le modifiche saranno pubblicate su questa pagina con data di
          aggiornamento.
        </p>
        <p className={paragraphClass}>
          Per informazioni su cookie e preferenze di tracciamento consulta anche
          la{" "}
          <Link className="text-[#228E8D] underline" to={ROUTES.COOKIE_POLICY}>
            Cookie Policy
          </Link>
          . Le preferenze possono essere aggiornate in qualsiasi momento tramite
          il link &quot;Preferenze Cookie&quot; presente nel footer del sito.
        </p>
      </section>
    </LegalPageLayout>
  );
}
