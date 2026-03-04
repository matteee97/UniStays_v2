import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ActionLabel from "@/ui/components/common/indicators/ActionLabel";

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center mb-12">
      <div className="bg-white rounded-full p-2 border-2 border-[#d4f1ef]">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group relative px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-[#228E8D] text-white shadow-lg"
                  : "text-gray-600 hover:text-[#228E8D] hover:bg-[#228E8D]/10"
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-sm" />
              <ActionLabel text={tab.label} className="w-36" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
