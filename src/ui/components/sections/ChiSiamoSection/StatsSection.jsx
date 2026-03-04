import React from "react";
import StatCard from "./StatCard";

const StatsSection = ({ stats, isVisible }) => {
  return (
    <div className="mb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            stat={stat}
            isVisible={isVisible}
            backgroundImage={
              <img
                src={stat.img}
                alt={stat.label}
                className="absolute inset-0 w-full h-full scale-125 object-cover"
              />
            }
          />
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
