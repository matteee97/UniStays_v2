import ApartmentsPageView from "@/ui/components/sections/apartmentsSection/ApartmentsPageView";
import { useApartmentsPage } from "@/ui/hooks";

export default function Apartments() {
  const apartmentsPageModel = useApartmentsPage();
  return <ApartmentsPageView {...apartmentsPageModel} />;
}
