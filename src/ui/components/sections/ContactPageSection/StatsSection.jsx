import React from "react";
import StatCard from "../ChiSiamoSection/StatCard";

const StatsSection = ({ stats }) => {
  return (
    <div className="bg-white  text-gray-700 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Perché scegliere il nostro supporto?
          </h3>
          <p className="text-lg text-gray-500 font-medium">
            Numeri che parlano da soli
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              stat={stat}
              backgroundImage={
                <img
                  src={stat.img}
                  alt={stat.label}
                  className="absolute inset-0 object-cover w-full h-full scale-110"
                ></img>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
