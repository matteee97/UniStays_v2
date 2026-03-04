import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBed, faBath } from "@fortawesome/free-solid-svg-icons";
import CounterBox from "../form/CounterBox";
import { APARTMENTS } from "@/shared/types";

export default function CounterGroup({ camere, setCamere, bagni, setBagni }) {
  return (
    <div className="flex flex-row gap-4 mt-8 mb-8">
      <CounterBox
        label="Camere"
        icon={<FontAwesomeIcon icon={faBed} />}
        description="Camere"
        value={camere}
        setValue={setCamere}
        maxValue={APARTMENTS.MAX_ROOMS}
      />
      <CounterBox
        label="Bagni"
        icon={<FontAwesomeIcon icon={faBath} />}
        description="Bagni"
        value={bagni}
        setValue={setBagni}
        maxValue={APARTMENTS.MAX_BATHS}
      />
    </div>
  );
}
