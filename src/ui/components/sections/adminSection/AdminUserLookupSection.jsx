import { useMemo, useState } from "react";
import LoadingIcon from "@/ui/components/common/shared/icons/LoadingIcon";
import AdminAnnunciEmptyState from "./AdminAnnunciEmptyState";
import { fetchUserData } from "@/ui/hooks";
import { isValidFirestoreId } from "@/ui/helpers/validation";
import FormInput from "@/ui/components/common/form/FormInput";
import { formatDate } from "@/ui/helpers/formatDate";

export default function AdminUserLookupSection() {
  const [query, setQuery] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastLookup, setLastLookup] = useState(null);

  const trimmedQuery = useMemo(() => query.trim(), [query]);
  const isValidQuery = trimmedQuery ? isValidFirestoreId(trimmedQuery) : false;

  const displayName = useMemo(() => {
    if (!userData) return "";
    const pieces = [userData.firstName, userData.lastName].filter(Boolean);
    return userData.displayName || pieces.join(" ") || "Utente senza nome";
  }, [userData]);

  const roleLabel = useMemo(() => {
    if (!userData) return "Utente";
    return userData.isAgency ? "Agenzia" : "Utente";
  }, [userData]);

  const lastAccess = useMemo(() => {
    if (!userData) return null;
    return userData.last_login || userData.last_access || userData.lastAccess;
  }, [userData]);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    if (error) {
      setError("");
    }
  };

  const handleSearch = async (event) => {
    event?.preventDefault();
    if (!trimmedQuery) {
      setError("Inserisci un ID utente per iniziare la ricerca.");
      return;
    }
    if (!isValidQuery) {
      setError("ID utente non valido.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await fetchUserData(trimmedQuery, { scope: "combined" });
      setUserData({ ...data, _lookupId: trimmedQuery });
      setLastLookup(new Date());
    } catch (err) {
      setUserData(null);
      setError(err?.message || "Errore durante il recupero dei dati utente.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setUserData(null);
    setError("");
    setLastLookup(null);
  };

  const statusTone = loading ? "amber" : userData ? "emerald" : "slate";
  const statusLabel = loading
    ? "Ricerca in corso"
    : userData
    ? "Utente caricato"
    : "In attesa";

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className="" data-tone={statusTone}>
            {statusLabel}
          </span>
          {lastLookup && (
            <span className="" data-tone="slate">
              Aggiornato:{" "}
              {formatDate(lastLookup, "it-IT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className=""
            data-variant="outline"
            disabled={!query && !userData && !error}
          >
            Reset ricerca
          </button>
        </div>
      </div>

      <div className="p-4">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 lg:grid-cols-5 gap-3"
        >
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Cerca utente per ID
            </label>
            <FormInput
              value={query}
              onChange={handleQueryChange}
              placeholder="Esempio: user_2x8v... o ID Firestore"
            />
            {!isValidQuery && trimmedQuery && (
              <p className="mt-2 text-xs text-rose-600">
                L&apos;ID inserito non sembra valido.
              </p>
            )}
          </div>
          <div className="lg:col-span-2 flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 bg-[#228E8D]/80 p-3 rounded-lg text-white text-sm font-semibold hover:bg-[#228E8D] disabled:opacity-50"
              data-variant="primary"
              disabled={loading || !trimmedQuery || !isValidQuery}
            >
              {loading ? "Ricerca..." : "Cerca utente"}
            </button>
            <button
              type="button"
              className="bg-slate-50/5 p-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50/10 cursor-pointer text-sm disabled:opacity-50"
              data-variant="soft"
              onClick={() => setQuery(trimmedQuery)}
              disabled={!query || query === trimmedQuery}
            >
              Pulisci spazi
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <LoadingIcon />
        </div>
      ) : error ? (
        <AdminAnnunciEmptyState
          title="Ricerca utente non riuscita"
          description={error}
        />
      ) : userData ? (
        <div className="space-y-4">
          <div className="">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={userData.photoUrl || "/img/logoFullColor.webp"}
                  alt={displayName}
                  className="h-16 w-16 rounded-full object-cover border border-white/70 shadow-sm"
                />
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {displayName}
                  </p>
                  <p className="text-sm ">
                    {userData.email || "Email non presente"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className=""
                  data-tone={roleLabel === "Agenzia" ? "emerald" : "slate"}
                >
                  {roleLabel}
                </span>
                <span className="" data-tone="sky">
                  Annunci:{" "}
                  {typeof userData.publicStats?.apartmentsCount === "number"
                    ? userData.publicStats.apartmentsCount
                    : "N/D"}
                </span>
                {typeof userData.publicStats?.reportsCount === "number" && (
                  <span className="" data-tone="amber">
                    Segnalazioni: {userData.publicStats.reportsCount}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="">ID utente:</span>{" "}
                <span className="">
                  {userData.userId || userData._lookupId}
                </span>
              </div>
              <div>
                <span className="">Telefono:</span>{" "}
                <span>{userData.phone || "Non disponibile"}</span>
              </div>
              <div>
                <span className="">Creato il:</span>{" "}
                <span>
                  {formatDate(userData.createdAt, "it-IT", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div>
                <span className="">Ultimo accesso:</span>{" "}
                <span>
                  {formatDate(lastAccess, "it-IT", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          <details className=" p-4">
            <summary className="text-sm font-semibold text-slate-700">
              Dati utente (JSON)
            </summary>
            <pre className="mt-3 text-xs  whitespace-pre-wrap">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        <AdminAnnunciEmptyState
          title="Nessun utente caricato"
          description="Inserisci un ID utente e avvia la ricerca per visualizzare i dati."
        />
      )}
    </div>
  );
}
