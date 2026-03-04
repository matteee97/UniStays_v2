import React from "react";

const AdminAnnunciBulkActions = ({
  selectedIds,
  filteredAnnunci,
  toggleSelectAll,
  handleBulkAction,
  bulkProcessing,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="text-sm text-slate-700">
        Selezionati {selectedIds.size} di {filteredAnnunci.length} annunci
        visibili
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={toggleSelectAll}
          className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50/5 text-sm"
        >
          {selectedIds.size === filteredAnnunci.length
            ? "Deseleziona tutto"
            : "Seleziona tutto"}
        </button>
        <button
          type="button"
          disabled={!selectedIds.size || bulkProcessing}
          onClick={() => handleBulkAction("verify")}
          className="px-3 py-2 rounded-lg bg-[#228E8D]/80 text-white text-sm font-semibold hover:bg-[#228E8D] disabled:opacity-50"
        >
          {bulkProcessing ? "Operazione..." : "Verifica selezionati"}
        </button>
        <button
          type="button"
          disabled={!selectedIds.size || bulkProcessing}
          onClick={() => handleBulkAction("reject")}
          className="px-3 py-2 rounded-lg text-white bg-red-500 dark:bg-red-900 text-sm font-semibold border border-red-600 dark:border-red-900 hover:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50"
        >
          {bulkProcessing ? "Operazione..." : "Rifiuta selezionati"}
        </button>
      </div>
    </div>
  );
};

export default AdminAnnunciBulkActions;
