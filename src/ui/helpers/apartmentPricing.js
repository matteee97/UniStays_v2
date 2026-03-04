import { CURRENCY } from "@/shared/types";

export const getPriceRangeLabel = (aggregates, onlyLowerBound = false) => {
  const min = Number(aggregates?.minRoomPrice);
  const max = Number(aggregates?.maxRoomPrice);

  const hasMin = Number.isFinite(min);
  const hasMax = Number.isFinite(max);

  if (!hasMin && !hasMax) return null;
  if (hasMin && hasMax && min !== max) {
    return onlyLowerBound ? `Da ${CURRENCY.SYMBOL}${min}` : `${CURRENCY.SYMBOL}${min}-${max}`;
  }

  return `${CURRENCY.SYMBOL}${hasMin ? min : max}`;
};
