import React, { useEffect } from "react";
import Checkbox from "../form/Checkbox";

const LocalStorageToggleButton = ({
  label = "",
  storageKey,
  value = false,
  onChange = () => {},
}) => {
  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [value, storageKey]);

  return (
    <Checkbox
      label={label}
      checked={value}
      onChange={() => onChange(!value)}
      className="!mt-0"
    />
  );
};

export default LocalStorageToggleButton;
