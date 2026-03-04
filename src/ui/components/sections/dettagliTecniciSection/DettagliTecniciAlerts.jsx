import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

const ALERT_STYLES = {
  warning:
    "divide-amber-700/20 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-600/70  border-amber-400  border-amber-400/50 dark:border-amber-600/50",
  success:
    "divide-[#228E8D]/20 bg-[#f0fafa]/50 text-[#228E8D] dark:text-[#228E8D]/80 border-[#228E8D]/50",
  info: "divide-[#228E8D]/10 bg-[#228E8D]/5 text-gray-600 border-[#d4f1ee] dark:border-[#d4f1ee]/20",
  error:
    "divide-red-700/20 bg-red-50 dark:bg-red-500/10 text-red-400 dark:text-red-500/70  border-red-400/50 dark:border-red-600/50",
};

const ALERT_ICON_STYLES = {
  warning: "text-amber-400 dark:text-amber-700/70",
  success: "text-[#228E8D]",
  info: "text-gray-600",
  error: "text-red-400 dark:text-red-500/70",
};

export default function DettagliTecniciAlerts({
  alerts = [],
  isLoading = false,
  error = null,
}) {
  const normalizedAlerts = alerts.filter(Boolean);
  const hasAlerts = normalizedAlerts.length > 0;

  return (
    <div className="bg-white border border-[#d4f1ef] rounded-3xl p-5 shadow-sm flex flex-col gap-4 h-full max-h-[310px]">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faBell} className="text-[#228E8D]" />
        <h3 className="text-lg font-semibold text-gray-800">Alerts</h3>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && isLoading && (
        <p className="text-sm text-gray-500">Caricamento alerts...</p>
      )}
      {!error && !isLoading && hasAlerts && (
        <ul className="text-sm text-gray-700 space-y-2 overflow-y-auto">
          {normalizedAlerts.map((alert, index) => (
            <li
              key={`${alert}-${index}`}
              className={`flex items-start gap-2 divide-x p-2 rounded-xl border ${ALERT_STYLES[alert?.type] || ""}`}
            >
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className={`mt-0.5 ${ALERT_ICON_STYLES[alert?.type] || ""}`}
              />
              <span className="pl-2">{alert.message}</span>
            </li>
          ))}
        </ul>
      )}
      {!error && !isLoading && !hasAlerts && (
        <p className="text-sm text-gray-500">Nessun alert in evidenza.</p>
      )}
    </div>
  );
}
