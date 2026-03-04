import { useMemo } from "react";
import { useCities } from "./useCities";

export function useCitiesByLetter(options = {}) {
  const { cities, loading, error, refresh } = useCities(options);

  const groups = useMemo(() => {
    if (!cities || cities.length === 0) return [];

    const grouped = cities.reduce((acc, cityObj) => {
      const firstLetter = cityObj.city?.trim()?.[0]?.toUpperCase?.() ?? "#";
      if (!acc[firstLetter]) {
        acc[firstLetter] = { letter: firstLetter, cities: [] };
      }
      acc[firstLetter].cities.push(cityObj);
      return acc;
    }, {});

    const sortedGroups = Object.values(grouped).sort((a, b) =>
      a.letter.localeCompare(b.letter)
    );

    sortedGroups.forEach((group) => {
      group.cities.sort((a, b) => a.city.localeCompare(b.city));
    });

    return sortedGroups;
  }, [cities]);

  return { groups, loading, error, refresh };
}
