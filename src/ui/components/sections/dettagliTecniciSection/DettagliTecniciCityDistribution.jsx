import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCity } from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { CustomTooltip } from "@/ui/components/common/charts/BarChartComponent";
import { COLORS } from "./DettagliTecniciConstants";

const CityPie = ({ data }) => {
  if (!data?.length) {
    return (
      <p className="text-sm text-gray-500">
        Aggiungi annunci per visualizzare la distribuzione geografica.
      </p>
    );
  }

  const pieData = data.map((city, idx) => ({
    ...city,
    fill: COLORS[idx % COLORS.length],
    value: city.count,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="city"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={6}
          cornerRadius={4}
          stroke="none"
        >
          {pieData.map((entry) => (
            <Cell key={entry.city} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip valueLabel="Annunci" />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default function DettagliTecniciCityDistribution({ cityStats = [] }) {
  return (
    <div className="bg-white border border-[#d4f1ef] rounded-3xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faCity} className="text-[#228E8D]" />
        <h3 className="text-lg font-semibold text-gray-800">
          Distribuzione citta
        </h3>
      </div>
      <div className="grid grid-cols-[1fr] md:grid-cols-[1fr_1fr] gap-4 items-center">
        <div className="h-56">
          <CityPie data={cityStats} />
        </div>
        <div className="space-y-2">
          {cityStats.map((city, idx) => (
            <div
              key={city.city}
              className="flex items-center justify-between text-sm bg-[#F0FAFA] border border-[#d4f1ef] rounded-xl px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="font-semibold text-gray-800">
                  {city.city}
                </span>
              </div>
              <span className="text-gray-600">{city.count}</span>
            </div>
          ))}
          {!cityStats.length && (
            <p className="text-sm text-gray-500">
              Aggiungi annunci per vedere le citta.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
