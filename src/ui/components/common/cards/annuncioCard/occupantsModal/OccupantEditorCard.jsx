import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faUser } from "@fortawesome/free-solid-svg-icons";
import FormInput from "../../../form/FormInput";
import FormSelect from "../../../form/FormSelect";
import Checkbox from "../../../form/Checkbox";
import {
  AGE_RANGE_OPTIONS,
  CLEANLINESS_OPTIONS,
  CONSENT_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
  LIFESTYLE_OPTIONS,
  MAX_INTERESTS,
  MAX_LANGUAGES,
  MAX_LIFESTYLE_TAGS,
  PRESENCE_OPTIONS,
  RHYTHM_OPTIONS,
  SECTION_ICONS,
  SOCIAL_OPTIONS,
  WEEKEND_OPTIONS,
} from "./constants";
import {
  LabeledTextarea,
  OccupantAvatarField,
  SectionPanel,
  SingleChoiceSelector,
  TagSelector,
} from "./OccupantFormFields";
import { OCCUPANT_CONSENT_STATUS } from "@/shared/types";

export default function OccupantEditorCard({
  draft,
  index,
  roomOptions,
  onRemove,
  onFieldChange,
  onTagToggle,
  onAvatarSelect,
  onAvatarRemove,
}) {
  const fieldBase = `occupants.${index}`;

  return (
    <article className="space-y-4 rounded-2xl border-2 border-[#d4f1ef] bg-white p-4">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#228E8D]">
          <FontAwesomeIcon icon={faUser} />
          Coinquilino {index + 1}
        </h4>
        <button
          type="button"
          onClick={() => onRemove(draft.localId)}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-500/10"
        >
          <FontAwesomeIcon icon={faTrashCan} />
          Rimuovi
        </button>
      </div>

      <SectionPanel
        icon={SECTION_ICONS.identity}
        title="Identita pubblica"
        subtitle="Informazioni visibili agli studenti in fase di ricerca."
      >
        <OccupantAvatarField
          draft={draft}
          onSelectFile={onAvatarSelect}
          onRemove={onAvatarRemove}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <FormSelect
              id={`occupant-room-${draft.localId}`}
              name={`${fieldBase}.roomId`}
              label="Stanza"
              value={draft.roomId}
              options={roomOptions}
              placeholder="Seleziona stanza"
              onChange={(event) =>
                onFieldChange(draft.localId, "roomId", event.target.value)
              }
            />
            {roomOptions.length === 0 ? (
              <p className="mt-1 text-xs text-red-500">
                Nessuna stanza disponibile. Salva prima almeno una stanza.
              </p>
            ) : null}
          </div>

          <FormInput
            name={`${fieldBase}.displayName`}
            label="Nome visibile"
            value={draft.displayName}
            onChange={(event) =>
              onFieldChange(draft.localId, "displayName", event.target.value)
            }
            placeholder="Es. Marco"
          />

          <FormSelect
            id={`occupant-age-${draft.localId}`}
            name={`${fieldBase}.ageRange`}
            label="Fascia eta"
            value={draft.ageRange}
            options={AGE_RANGE_OPTIONS}
            placeholder="Non specificata"
            onChange={(event) =>
              onFieldChange(draft.localId, "ageRange", event.target.value)
            }
          />
        </div>

        <LabeledTextarea
          label="Bio breve"
          value={draft.shortBio}
          onChange={(event) =>
            onFieldChange(draft.localId, "shortBio", event.target.value)
          }
          placeholder="Come descriveresti il coinquilino in due righe?"
          rows={3}
        />
      </SectionPanel>

      <SectionPanel
        icon={SECTION_ICONS.study}
        title="Studio e routine"
        subtitle="Aiuta gli studenti a capire il contesto universitario della casa."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormInput
            name={`${fieldBase}.university`}
            label="Universita"
            value={draft.university}
            onChange={(event) =>
              onFieldChange(draft.localId, "university", event.target.value)
            }
            placeholder="Es. Sapienza"
          />
          <FormInput
            name={`${fieldBase}.faculty`}
            label="Facolta"
            value={draft.faculty}
            onChange={(event) =>
              onFieldChange(draft.localId, "faculty", event.target.value)
            }
            placeholder="Es. Ingegneria"
          />
          <FormInput
            name={`${fieldBase}.course`}
            label="Corso"
            value={draft.course}
            onChange={(event) =>
              onFieldChange(draft.localId, "course", event.target.value)
            }
            placeholder="Es. Informatica"
          />
        </div>

        <div className="max-w-md">
          <FormSelect
            id={`occupant-presence-${draft.localId}`}
            name={`${fieldBase}.presenceStatus`}
            label="Stato presenza in casa"
            value={draft.presenceStatus}
            options={PRESENCE_OPTIONS}
            onChange={(event) =>
              onFieldChange(
                draft.localId,
                "presenceStatus",
                event.target.value,
              )
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <SingleChoiceSelector
            label="Ritmo di vita"
            subtitle="Seleziona l'opzione piu rappresentativa."
            options={RHYTHM_OPTIONS}
            value={draft.livingRhythm}
            onSelect={(value) => onFieldChange(draft.localId, "livingRhythm", value)}
          />

          <SingleChoiceSelector
            label="Ordine e pulizia"
            options={CLEANLINESS_OPTIONS}
            value={draft.cleanlinessLevel}
            onSelect={(value) =>
              onFieldChange(draft.localId, "cleanlinessLevel", value)
            }
          />

          <SingleChoiceSelector
            label="Socialita in casa"
            options={SOCIAL_OPTIONS}
            value={draft.socialLevel}
            onSelect={(value) => onFieldChange(draft.localId, "socialLevel", value)}
          />

          <SingleChoiceSelector
            label="Weekend"
            options={WEEKEND_OPTIONS}
            value={draft.weekendPresence}
            onSelect={(value) =>
              onFieldChange(draft.localId, "weekendPresence", value)
            }
          />
        </div>
      </SectionPanel>

      <SectionPanel
        icon={SECTION_ICONS.vibe}
        title="Vibe e interessi"
        subtitle="Seleziona con un click i tratti che raccontano meglio la convivenza."
      >
        <TagSelector
          label="Tag convivenza"
          subtitle="Scegli fino a 8 tag."
          options={LIFESTYLE_OPTIONS}
          selected={draft.lifestyleTags}
          onToggle={(value) =>
            onTagToggle(draft.localId, "lifestyleTags", value, MAX_LIFESTYLE_TAGS)
          }
        />

        <TagSelector
          label="Interessi"
          subtitle="Scegli fino a 8 interessi."
          options={INTEREST_OPTIONS}
          selected={draft.interests}
          onToggle={(value) =>
            onTagToggle(draft.localId, "interests", value, MAX_INTERESTS)
          }
        />

        <TagSelector
          label="Lingue parlate"
          subtitle="Scegli fino a 6 lingue."
          options={LANGUAGE_OPTIONS}
          selected={draft.languages}
          onToggle={(value) =>
            onTagToggle(draft.localId, "languages", value, MAX_LANGUAGES)
          }
        />
      </SectionPanel>

      <SectionPanel
        icon={SECTION_ICONS.consent}
        title="Consenso e visibilita"
        subtitle="Le informazioni personali vengono mostrate solo con consenso esplicito."
      >
        <div className="max-w-md">
          <FormSelect
            id={`occupant-consent-${draft.localId}`}
            name={`${fieldBase}.consentStatus`}
            label="Stato consenso"
            value={draft.consentStatus}
            options={CONSENT_OPTIONS}
            onChange={(event) =>
              onFieldChange(draft.localId, "consentStatus", event.target.value)
            }
          />
        </div>

        <Checkbox
          name={`${fieldBase}.consentConfirmed`}
          checked={draft.consentConfirmed === true}
          disabled={draft.consentStatus !== OCCUPANT_CONSENT_STATUS.GRANTED}
          onChange={(event) =>
            onFieldChange(draft.localId, "consentConfirmed", event.target.checked)
          }
          label="Confermo consenso esplicito del coinquilino"
          description="Obbligatorio quando il consenso è impostato su 'Consenso ottenuto'."
        />

        <div className="max-w-[520px] pt-1">
          <Checkbox
            name={`${fieldBase}.isPublic`}
            checked={draft.isPublic}
            onChange={(event) =>
              onFieldChange(draft.localId, "isPublic", event.target.checked)
            }
            disabled={
              draft.consentStatus !== OCCUPANT_CONSENT_STATUS.GRANTED ||
              draft.consentConfirmed !== true
            }
            label="Mostra questo coinquilino pubblicamente"
            description="Disponibile solo dopo consenso ottenuto e confermato."
          />
        </div>
      </SectionPanel>
    </article>
  );
}
