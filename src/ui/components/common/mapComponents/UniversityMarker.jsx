import { useEffect } from "react";
import { useGoogleMap } from "@react-google-maps/api";

export default function UniversityMarker({ position, name = "Università" }) {
  const map = useGoogleMap();

  useEffect(() => {
    if (!map || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    const { AdvancedMarkerElement } = window.google.maps.marker;

    const img = document.createElement("img");
    img.src = "/icons/unimarker.svg";
    img.alt = name;
    img.style.width = "48px";
    img.style.height = "48px";

    const marker = new AdvancedMarkerElement({
      map,
      position,
      title: name,
      content: img,
    });

    return () => marker.setMap(null);
  }, [map, name, position]);

  return null;
}
