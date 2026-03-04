import React from "react";
import TeamMemberCard from "./TeamMemberCard";

const TeamTab = ({ teamMembers, isVisible }) => {
  return (
    <div className={`${isVisible ? "animate-fadeInUp" : "opacity-0"}`}>
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-gray-800 mb-4">
          Il Nostro Team
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Giovani professionisti con una passione comune: migliorare
          l'esperienza degli studenti universitari nella ricerca di alloggi.
        </p>
      </div>

      <div
        className={`grid grid-cols-1 ${
          teamMembers.length > 1
            ? teamMembers.length > 2
              ? "md:grid-cols-3"
              : "md:grid-cols-2"
            : "max-w-2xl mx-auto"
        } gap-8`}
      >
        {teamMembers.map((member) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            isVisible={isVisible}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamTab;
