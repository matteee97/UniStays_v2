import React from "react";
import ValueCard from "./ValueCard";

const ValuesTab = ({ values, isVisible }) => {
  return (
    <div className={`${isVisible ? "animate-fadeInUp" : "opacity-0"}`}>
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-gray-800 mb-4">
          I Nostri Valori
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          I principi che guidano ogni nostra decisione e azione per creare la
          migliore esperienza possibile per gli studenti.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((value, index) => (
          <ValueCard key={index} value={value} isVisible={isVisible} />
        ))}
      </div>
    </div>
  );
};

export default ValuesTab;
