import MapSection from "@/ui/components/common/charts/MapSection";

export default function DettagliTecniciMapPanel({
  appartamenti = [],
  cityStats = [],
}) {
  return <MapSection appartamenti={appartamenti} cityStats={cityStats} />;
}
