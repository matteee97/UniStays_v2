import WhiteContainer from "@/ui/components/common/containers/WhiteContainer";
import RangeSlider from "@/ui/components/common/form/RangeSlider";
import { APARTMENTS, PRICES } from "@/shared/types";

const RangeSliders = ({
  data,
  handleChange,
  hasFieldError,
  getFieldError,
  index,
}) => {
  return (
    <WhiteContainer className="space-y-4 rounded-xl">
      <RangeSlider
        text={"Superficie stanza:"}
        simbol={"mq"}
        value={data.areaMq}
        minValue={0}
        maxValue={APARTMENTS.MAX_ROOM_SQUARE_METERS}
        onChange={(e) =>
          handleChange({
            target: {
              name: `rooms.${index}.areaMq`,
              value: e.target.value,
            },
          })
        }
        showValue
      />
      {hasFieldError("rooms") && (
        <p className="text-red-500 text-sm mt-1">{getFieldError("rooms")}</p>
      )}
      {hasFieldError(`rooms.${index}.areaMq`) && (
        <p className="text-red-500 text-sm mt-1">
          {getFieldError(`rooms.${index}.areaMq`)}
        </p>
      )}

      <RangeSlider
        text={"Prezzo stanza:"}
        simbol={"€"}
        value={data.priceMonthly}
        minValue={PRICES.MIN_PRICE}
        maxValue={PRICES.MAX_PRICE}
        onChange={(e) =>
          handleChange({
            target: {
              name: `rooms.${index}.priceMonthly`,
              value: e.target.value,
            },
          })
        }
        showValue
      />
      {hasFieldError(`rooms.${index}.priceMonthly`) && (
        <p className="text-red-500 text-sm mt-1">
          {getFieldError(`rooms.${index}.priceMonthly`)}
        </p>
      )}
    </WhiteContainer>
  );
};

export default RangeSliders;
