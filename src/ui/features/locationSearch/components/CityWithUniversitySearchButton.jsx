import React, { useMemo } from "react";
import { CoolButton, Stars } from "@/ui/components/common";
import useNearbyUniversities from "../hooks/useNearbyUniversities";

const CityWithUniversitySearchButton = ({
  isUserPositionEnabled,
  onEnableUserPosition,
  text = "Scopri università vicino a te",
}) => {
  const geoPermissionStatus = useNearbyUniversities();

  const hasClickedCities = useMemo(() => {
    try {
      return Boolean(localStorage.getItem("clicked_cities"));
    } catch {
      return false;
    }
  }, []);

  const shouldShow = geoPermissionStatus === "prompt" && !hasClickedCities;

  if (!shouldShow) return null;

  return (
    <CoolButton
      className="!w-64 flex items-center justify-center opacity-85"
      onClick={() => {
        if (!isUserPositionEnabled) onEnableUserPosition?.();
      }}
    >
      <Stars className="mr-2 h-4 w-4" />
      {text}
    </CoolButton>
  );
};

export default CityWithUniversitySearchButton;
