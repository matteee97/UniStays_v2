import { Link } from "react-router-dom";
import LegalPageLayout from "@/ui/components/common/legal/LegalPageLayout";
import { ROUTES } from "@/app/routes";
import { LEGAL_CONTACT, LEGAL_LAST_UPDATED } from "@/ui/legal/legalInfo";
import { USER_ROLES } from "@/shared/types";

const sectionTitleClass =
  "text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100";
const paragraphClass = "leading-relaxed";
const listClass = "list-disc pl-5 space-y-2";

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout
      title="Termini e Condizioni"
      description="Condizioni generali di utilizzo della piattaforma UniStays."
      updatedAt={LEGAL_LAST_UPDATED}
    >
      <section className="space-y-3">
        <p className={paragraphClass}>
          Le presenti condizioni disciplinano l&apos;accesso e l&apos;uso della
          piattaforma {LEGAL_CONTACT.brandName} da parte degli utenti.
        </p>
        <p className={paragraphClass}>
          L&apos;accesso al sito e/o la creazione di un account comportano
          accettazione dei presenti Termini.
        </p>
        <p className={paragraphClass}>
          {LEGAL_CONTACT.brandName} opera esclusivamente come piattaforma
          tecnologica che consente agli utenti di pubblicare, consultare e
          gestire annunci. {LEGAL_CONTACT.brandName} non e&apos; proprietario,
          locatore, intermediario immobiliare, agente o agenzia immobiliare e
          non e&apos; parte dei contratti eventualmente conclusi tra gli utenti,
          salvo diverso accordo scritto espressamente dichiarato.
        </p>
      </section>

      <section className="space-y-3" id="soggetto-erogatore">
        <h2 className={sectionTitleClass}>
          1. Soggetto erogatore del servizio
        </h2>
        <ul className={listClass}>
          <li>
            Gestore piattaforma:{" "}
            <strong>{LEGAL_CONTACT.legalEntityName}</strong>
          </li>
          <li>Sede: {LEGAL_CONTACT.registeredOffice}</li>
          <li>
            Contatti:{" "}
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

      <section className="space-y-3" id="oggetto-servizio">
        <h2 className={sectionTitleClass}>2. Oggetto del servizio</h2>
        <p className={paragraphClass}>
          {LEGAL_CONTACT.brandName} offre una piattaforma digitale per la
          pubblicazione e consultazione di annunci relativi ad alloggi e la
          comunicazione tra utenti interessati e {USER_ROLES.HOST}.
        </p>
        <p className={paragraphClass}>
          Salvo diverso accordo scritto, il gestore non e&apos; parte dei
          contratti eventualmente conclusi tra utenti e {USER_ROLES.HOST}.
        </p>
        <p className={paragraphClass}>
          Eventuali trattative, pagamenti, caparre, canoni, accordi
          contrattuali, prenotazioni o altre intese economiche o giuridiche
          avvengono direttamente tra gli utenti senza coinvolgimento del
          gestore della piattaforma.
        </p>
      </section>

      <section className="space-y-3" id="requisiti-account">
        <h2 className={sectionTitleClass}>3. Requisiti account e accesso</h2>
        <ul className={listClass}>
          <li>
            L&apos;utente dichiara di essere maggiorenne e di avere
            capacita&apos; legale per utilizzare il servizio.
          </li>
          <li>Le credenziali di accesso sono personali e non cedibili.</li>
          <li>
            L&apos;utente deve mantenere aggiornati e veritieri i dati inseriti.
          </li>
          <li>
            E&apos; vietata la creazione di account falsi, duplicati o
            utilizzati per finalita&apos; abusive.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="annunci-host">
        <h2 className={sectionTitleClass}>
          4. Regole per pubblicazione e gestione annunci
        </h2>
        <ul className={listClass}>
          <li>
            L&apos;{USER_ROLES.HOST} e&apos; responsabile della liceita&apos;,
            accuratezza e completezza dei contenuti pubblicati.
          </li>
          <li>
            Sono vietati contenuti ingannevoli, illeciti, discriminatori,
            offensivi o lesivi di diritti di terzi.
          </li>
          <li>
            Le informazioni pubblicate negli annunci, incluse immagini,
            descrizioni, prezzi, disponibilita&apos;, coordinate, mappe,
            geolocalizzazione, metrature, dotazioni e stato dell&apos;immobile,
            sono inserite sotto la responsabilita&apos; esclusiva
            dell&apos;{USER_ROLES.HOST}.
          </li>
          <li>
            Il gestore puo&apos; sottoporre gli annunci a revisione, sospendere,
            rifiutare o rimuovere contenuti non conformi.
          </li>
          <li>
            Salvo ove espressamente indicato, il gestore non effettua verifiche
            sistematiche preventive sull&apos;identita&apos;, titolarita&apos;,
            disponibilita&apos;, affidabilita&apos; o solvibilita&apos; degli
            utenti ne&apos; sulla veridicita&apos; dei contenuti pubblicati.
          </li>
          <li>
            L&apos;{USER_ROLES.HOST} autorizza l&apos;uso tecnico dei contenuti
            caricati (immagini, testi, metadati) per erogare il servizio.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="chat-comunicazioni">
        <h2 className={sectionTitleClass}>
          5. Chat e comunicazioni tra utenti
        </h2>
        <ul className={listClass}>
          <li>
            La chat deve essere usata in modo lecito, corretto e rispettoso.
          </li>
          <li>
            E&apos; vietato inviare spam, minacce, molestie, tentativi di truffa
            o richieste illecite.
          </li>
          <li>
            Il gestore puo&apos; intervenire in caso di abuso, inclusa la
            limitazione dell&apos;account o la rimozione di conversazioni.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="recensioni-segnalazioni">
        <h2 className={sectionTitleClass}>6. Recensioni e segnalazioni</h2>
        <ul className={listClass}>
          <li>
            Le recensioni devono riflettere esperienze reali e non manipolate.
          </li>
          <li>
            Le segnalazioni devono essere veritiere, circostanziate e in buona
            fede.
          </li>
          <li>
            Il gestore puo&apos; moderare o rimuovere recensioni/contenuti in
            violazione dei presenti Termini.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="proprieta-intellettuale">
        <h2 className={sectionTitleClass}>7. Proprieta&apos; intellettuale</h2>
        <p className={paragraphClass}>
          Marchi, loghi, struttura del sito, codice, elementi grafici e
          contenuti proprietari della piattaforma sono tutelati dalla normativa
          applicabile. E&apos; vietato copiare, distribuire o riutilizzare tali
          elementi senza autorizzazione.
        </p>
      </section>

      <section className="space-y-3" id="limitazioni-responsabilita">
        <h2 className={sectionTitleClass}>
          8. Limitazioni di responsabilita&apos;
        </h2>
        <ul className={listClass}>
          <li>
            Il gestore non garantisce continuita&apos; assoluta o assenza totale
            di errori/interruzioni del servizio.
          </li>
          <li>
            Il gestore non risponde, nei limiti di legge, per rapporti
            contrattuali conclusi tra utenti e {USER_ROLES.HOST}.
          </li>
          <li>
            Il gestore non garantisce la veridicita&apos;, accuratezza,
            completezza, liceita&apos; o aggiornamento degli annunci pubblicati
            dagli utenti, ne&apos; l&apos;esattezza delle informazioni relative
            agli immobili, alle loro condizioni, alla disponibilita&apos;, ai
            prezzi, alle immagini o alle coordinate geografiche mostrate in
            piattaforma.
          </li>
          <li>
            Il gestore non risponde, nei limiti di legge, per truffe, condotte
            fraudolente, informazioni false, omissioni, inadempimenti,
            cancellazioni, danni agli immobili, danni a persone o cose,
            controversie, perdite economiche o altri pregiudizi derivanti dai
            rapporti o dagli accordi intercorsi tra utenti.
          </li>
          <li>
            L&apos;utente resta responsabile dei contenuti e delle condotte
            poste in essere tramite la piattaforma.
          </li>
        </ul>
      </section>

      <section className="space-y-3" id="manleva-indennizzo">
        <h2 className={sectionTitleClass}>
          9. Manleva e indennizzo
        </h2>
        <p className={paragraphClass}>
          L&apos;utente si impegna a manlevare e tenere indenne{" "}
          {LEGAL_CONTACT.brandName}, i suoi titolari, collaboratori e fornitori
          da qualsiasi pretesa, danno, responsabilita&apos;, sanzione, costo o
          spesa, incluse ragionevoli spese legali, derivanti dall&apos;uso
          improprio della piattaforma, dalla pubblicazione di contenuti illeciti
          o inesatti, dalla violazione dei presenti Termini o dalla violazione
          di diritti di terzi.
        </p>
      </section>

      <section className="space-y-3" id="sospensione-risoluzione">
        <h2 className={sectionTitleClass}>
          10. Sospensione, limitazione e cessazione account
        </h2>
        <p className={paragraphClass}>
          In caso di violazione dei presenti Termini o di uso improprio della
          piattaforma, il gestore puo&apos; sospendere o chiudere
          l&apos;account, limitare specifiche funzionalita&apos; e rimuovere
          contenuti.
        </p>
      </section>

      <section className="space-y-3" id="modifiche-termini">
        <h2 className={sectionTitleClass}>11. Modifiche ai Termini</h2>
        <p className={paragraphClass}>
          Il gestore puo&apos; aggiornare i presenti Termini per esigenze
          legali, tecniche o organizzative. Le modifiche saranno pubblicate su
          questa pagina con data di aggiornamento.
        </p>
      </section>

      <section className="space-y-3" id="legge-foro">
        <h2 className={sectionTitleClass}>12. Legge applicabile e foro</h2>
        <p className={paragraphClass}>
          I presenti Termini sono regolati dalla legge italiana. Salvo diversi
          diritti inderogabili del consumatore, per ogni controversia e&apos;
          competente il foro individuato dalla normativa applicabile.
        </p>
      </section>

      <section className="space-y-3" id="contatti">
        <h2 className={sectionTitleClass}>13. Contatti legali</h2>
        <p className={paragraphClass}>
          Per richieste relative a questi Termini o alla protezione dati:
        </p>
        <ul className={listClass}>
          <li>
            Supporto:{" "}
            <a
              href={`mailto:${LEGAL_CONTACT.supportEmail}`}
              className="text-[#228E8D] underline"
            >
              {LEGAL_CONTACT.supportEmail}
            </a>
          </li>
          <li>
            Privacy:{" "}
            <a
              href={`mailto:${LEGAL_CONTACT.privacyEmail}`}
              className="text-[#228E8D] underline"
            >
              {LEGAL_CONTACT.privacyEmail}
            </a>
          </li>
        </ul>
        <p className={paragraphClass}>
          Consulta anche la{" "}
          <Link className="text-[#228E8D] underline" to={ROUTES.PRIVACY}>
            Privacy Policy
          </Link>{" "}
          e la{" "}
          <Link className="text-[#228E8D] underline" to={ROUTES.COOKIE_POLICY}>
            Cookie Policy
          </Link>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
