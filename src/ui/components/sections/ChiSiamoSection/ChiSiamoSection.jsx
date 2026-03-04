import React, { useState } from "react";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import TabNavigation from "./TabNavigation";
import MissionTab from "./MissionTab";
import TeamTab from "./TeamTab";
import ValuesTab from "./ValuesTab";
import CallToAction from "./CallToAction";
import StatsSection from "./StatsSection";
import SectionHeader from "../SectionHeader";
import { teamMembers, stats, values, tabs } from "./data";
import { useInView } from "@/ui/hooks";

export default function ChiSiamoSection() {
  const [ref, isVisible] = useInView({ threshold: 0.1 });
  const [activeTab, setActiveTab] = useState("mission");

  return (
    <section
      className="bg-gradient-to-br from-[#F0FAF9] dark:from-[#0F172A] dark:to-[#122529] via-white to-[#F0FAF9] py-20"
      id="chi-siamo"
    >
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          icon={faStar}
          badgeText="Il nostro team"
          title="Chi Siamo"
          description={
            <>
              Siamo un team di{" "}
              <strong className="text-[#228E8D]">studenti universitari</strong>{" "}
              che ha trasformato la frustrazione di cercare casa in una
              missione:
              <span className="block mt-2">
                <strong className="text-[#228E8D]">
                  semplificare la ricerca di alloggi per tutti gli studenti
                  italiani.
                </strong>
              </span>
            </>
          }
        />

        {/* Stats Section */}
        <StatsSection stats={stats} isVisible={isVisible} />

        <div ref={ref}>
          {/* Tabs Navigation */}
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "mission" && <MissionTab isVisible={isVisible} />}
            {activeTab === "team" && (
              <TeamTab teamMembers={teamMembers} isVisible={isVisible} />
            )}
            {activeTab === "values" && (
              <ValuesTab values={values} isVisible={isVisible} />
            )}
          </div>

          {/* Call to Action */}
          <CallToAction isVisible={isVisible} />
        </div>
      </div>
    </section>
  );
}
