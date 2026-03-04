import React from "react";
import AnnunciControls from "./AnnunciControls";

export default function FilterBar({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  statusFilter,
  setStatusFilter,
  filteredAppartamentiLength,
  mode = "default",
  onAnalyticsModeChange,
  analyticsMode,
  refetchApartments,
}) {
  return (
    <>
      {/* Controlli di ricerca e filtro */}
      <AnnunciControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        filteredAppartamentiLength={filteredAppartamentiLength}
        mode={mode}
        onAnalyticsModeChange={onAnalyticsModeChange}
        analyticsMode={analyticsMode}
        refetchApartments={refetchApartments}
      />
    </>
  );
}
