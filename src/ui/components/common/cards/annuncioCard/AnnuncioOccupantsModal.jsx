import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../modals/Modal";
import CoolButton from "../../buttons/CoolButton";
import OccupantEditorCard from "./occupantsModal/OccupantEditorCard";
import { useOccupantsModalState } from "./occupantsModal/useOccupantsModalState";

export default function AnnuncioOccupantsModal({
  annuncioId,
  roomCandidates = null,
  isOpen,
  onClose,
  onOccupantsUpdated,
}) {
  const {
    loading,
    occupantsDraft,
    roomOptions,
    saving,
    handleAddOccupant,
    handleAvatarRemoved,
    handleAvatarSelected,
    handleRemoveOccupant,
    handleSave,
    toggleDraftTag,
    updateDraftField,
  } = useOccupantsModalState({
    annuncioId,
    isOpen,
    onClose,
    onOccupantsUpdated,
    roomCandidates,
  });

  if (!isOpen) return null;

  return (
    <Modal
      title="Gestisci coinquilini presenti"
      onClose={onClose}
      disableEffects
      disableDistortion
      disableOutsideClick
    >
      <div className="min-h-[82vh] w-full max-w-5xl space-y-6">
        {loading ? (
          <p className="text-sm text-gray-500">Caricamento coinquilini...</p>
        ) : (
          <div className="space-y-5">
            {occupantsDraft.map((draft, index) => (
              <OccupantEditorCard
                key={draft.localId}
                draft={draft}
                index={index}
                roomOptions={roomOptions}
                onRemove={handleRemoveOccupant}
                onFieldChange={updateDraftField}
                onTagToggle={toggleDraftTag}
                onAvatarSelect={handleAvatarSelected}
                onAvatarRemove={handleAvatarRemoved}
              />
            ))}

            <CoolButton
              type="button"
              ariaLabel="Aggiungi coinquilino"
              onClick={handleAddOccupant}
              disabled={roomOptions.length === 0}
              className="w-auto px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faPlus} />
              Aggiungi coinquilino
            </CoolButton>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <CoolButton
          type="button"
          ariaLabel="Salva coinquilini"
          disabled={loading || saving}
          className="w-auto px-6"
          onClick={handleSave}
        >
          {saving ? "Salvataggio..." : "Salva coinquilini"}
        </CoolButton>
      </div>
    </Modal>
  );
}
