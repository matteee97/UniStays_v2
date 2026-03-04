import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar } from "@fortawesome/free-solid-svg-icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// tooltip
export const CustomTooltip = ({
  active,
  payload,
  valueLabel = "Visualizzazioni",
}) => {
  if (!active || !payload?.length) return null;

  const entry = payload[0]; // slice corrente
  const title =
    entry.payload?.title || entry.payload?.label || entry?.name || "";
  const value = entry.value; // 👈 value della slice

  return (
    <div className="bg-white p-2 rounded-xl shadow-md border-2 border-[#d4f1ef] text-sm text-gray-600">
      <p className="font-semibold text-[#228E8D]">{title}</p>
      <p>
        {valueLabel}: {typeof value === "number" ? value.toFixed(0) : value}
      </p>
    </div>
  );
};

export default function BarChartComponent({
  data,
  onBarClick,
  title,
  dataKey = "totalViews",
  valueLabel = "Visualizzazioni",
}) {
  return (
    <div className="flex justify-center items-center bg-[#F0FAFA] border-2 border-[#d4f1ef] rounded-2xl sm:p-4 h-full shadow-sm w-full">
      {title && (
        <h2 className="text-xl font-semibold mb-6">
          <FontAwesomeIcon icon={faChartBar} className="mr-2 text-[#228E8D]" />
          {title}
        </h2>
      )}
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" hide />
          <YAxis />
          <Tooltip content={<CustomTooltip valueLabel={valueLabel} />} />
          <Bar
            dataKey={dataKey}
            fill="#228E8D"
            radius={[15, 15, 0, 0]}
            onClick={onBarClick}
            activeBar={{
              fill: "#1A6B6A",
              background: { fill: "#000" }, // 👈 background in hover
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
