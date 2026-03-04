import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBed } from "@fortawesome/free-solid-svg-icons";
import FormSection from "../FormSection";
import FormTips from "../FormTips";
import { createRoomDraft } from "@/core/valueObjects/roomDraft";
import RoomsEditor from "@/ui/components/common/rooms/RoomsEditor";

const RoomsSection = ({
  formData,
  setFormData,
  handleChange,
  handleBlur,
  showTips,
  getFieldError,
  hasFieldError,
}) => {
  const rooms = formData.rooms || [];

  const addRoom = () => {
    setFormData((prev) => ({
      ...prev,
      rooms: [...(prev.rooms || []), createRoomDraft()],
    }));
  };

  const removeRoom = (indexToRemove) => {
    setFormData((prev) => {
      const nextRooms = (prev.rooms || []).filter(
        (_, index) => index !== indexToRemove
      );
      return {
        ...prev,
        rooms: nextRooms.length ? nextRooms : [createRoomDraft()],
      };
    });
  };

  return (
    <FormSection
      title="Stanze"
      description="Aggiungi almeno una stanza con prezzo, disponibilita e foto"
      icon={<FontAwesomeIcon icon={faBed} />}
      required
    >
      <RoomsEditor
        rooms={rooms}
        onAddRoom={addRoom}
        onRemoveRoom={removeRoom}
        handleChange={handleChange}
        handleBlur={handleBlur}
        getFieldError={getFieldError}
        hasFieldError={hasFieldError}
      />

      {showTips && <FormTips currentSection="rooms" />}
    </FormSection>
  );
};

export default RoomsSection;
