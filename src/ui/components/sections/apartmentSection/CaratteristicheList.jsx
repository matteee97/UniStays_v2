import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { caratteristicheConfig } from "@/ui/data/caratteristicheConfig";

export default function CaratteristicheList({ caratteristiche }) {
  return (
    <div>
      <ul className="mt-4 grid grid-cols-2 text-sm text-gray-500 gap-4">
        {caratteristicheConfig.map((item) => {
          const rawValue = caratteristiche?.[item.key];
          // Se esiste un formatter, usalo; altrimenti mostra rawValue
          const valore =
            rawValue !== undefined && rawValue !== null
              ? item.formatter
                ? item.formatter(rawValue)
                : rawValue
              : item.fallback;

          return (
            <li key={item.key} className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={item.icon}
                className="text-[#228E8D] h-6 w-6"
              />
              {item.label}: {valore}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
