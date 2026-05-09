import React, { useMemo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ActionLabel from "@/ui/components/common/indicators/ActionLabel";
import ActiveAnchor from "../../common/search/SearchTray/ActiveAnchor";

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  const chipRef = useRef(null);
  const activeButtonRef = useMemo(
    () => ({
      get current() {
        return chipRef.current?.querySelector(`[data-tab-id="${activeTab}"]`);
      },
    }),
    [activeTab],
  );

  return (
    <div className="flex justify-center mb-12">
      <div className="bg-white rounded-full p-2 border-2 border-[#d4f1ef]">
        <div className="flex gap-2 relative z-10" ref={chipRef}>
          <ActiveAnchor
            active
            containerRef={chipRef}
            targetRef={activeButtonRef}
            className="bg-[#228E8D] "
          />
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`group relative px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "text-white shadow-lg"
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
