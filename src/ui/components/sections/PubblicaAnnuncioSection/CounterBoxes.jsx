import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CounterBox from "@/ui/components/common/form/CounterBox";
import {
  faBath,
  faBed,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons";
import { APARTMENTS } from "@/shared/types";

const CounterBoxes = ({
  bedrooms,
  setBedrooms,
  bathrooms,
  setBathrooms,
  totalBeds,
  setTotalBeds,
  availableBeds,
  setAvailableBeds,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
      <CounterBox
        label={"Camere"}
        icon={<FontAwesomeIcon icon={faBed} />}
        value={bedrooms}
        setValue={setBedrooms}
        maxValue={APARTMENTS.MAX_ROOMS}
      />
      <CounterBox
        label={"Bagni"}
        icon={<FontAwesomeIcon icon={faBath} />}
        value={bathrooms}
        setValue={setBathrooms}
        maxValue={APARTMENTS.MAX_BATHROOMS}
      />
      <CounterBox
        label="Posti totali"
        innerText="Persone"
        icon={<FontAwesomeIcon icon={faPeopleGroup} />}
        value={totalBeds}
        setValue={setTotalBeds}
        maxValue={APARTMENTS.MAX_BEDS}
      />
      <CounterBox
        label="Posti disponibili"
        innerText="Persone"
        icon={<FontAwesomeIcon icon={faPeopleGroup} />}
        value={availableBeds}
        setValue={setAvailableBeds}
        maxValue={totalBeds || 1}
      />
    </div>
  );
};

export default CounterBoxes;
