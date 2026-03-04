import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie } from "@fortawesome/free-solid-svg-icons";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

const colors = ["#228E8D", "#62C1BA", "#A4E0DB", "#F3BDA1", "#F59E0B"];

const CustomTooltip = ({ active, payload, nameKey }) => {
  if (active && payload && payload.length) {
    const { count } = payload[0].payload;
    const name =
      payload[0].name || payload[0].payload?.[nameKey] || "N/D";
    return (
      <div className="bg-white p-2 rounded-xl shadow-md border-2 border-[#d4f1ef] text-sm text-gray-700">
        <p className="font-semibold text-[#228E8D]">{name}</p>
        <p>Valore: {count}</p>
      </div>
    );
  }
  return null;
};

export default function PieChartComponent({
  data = [],
  title = "Distribuzione",
  height = 220,
  dataKey = "count",
  nameKey = "nome",
}) {
  return (
    <div className="bg-[#F0FAF9] border-2 border-[#d4f1ef] rounded-2xl p-4 shadow-sm w-full">
      <h2 className="text-xl font-semibold mb-6">
        <FontAwesomeIcon icon={faChartPie} className="mr-2 text-[#228E8D]" />
        {title}
      </h2>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius="70%"
              innerRadius="45%"
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell
                  // eslint-disable-next-line react/no-array-index-key
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip nameKey={nameKey} />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
