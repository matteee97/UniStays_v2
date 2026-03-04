export const REPORT_REASON_OPTIONS = Object.freeze([
  { value: "scam", label: "Truffa o annuncio sospetto" },
  { value: "spam", label: "Spam o contenuti indesiderati" },
  { value: "harassment", label: "Molestie o comportamento scorretto" },
  { value: "fakeListing", label: "Annuncio falso o ingannevole" },
  { value: "inappropriateContent", label: "Contenuti inappropriati" },
  { value: "other", label: "Altro" },
]);

export const REPORT_REASON_VALUES = new Set(
  REPORT_REASON_OPTIONS.map((option) => option.value)
);

export const REPORT_STATUS_META = Object.freeze({
  open: {
    label: "Aperta",
    tone: "bg-amber-100 dark:bg-amber-200/10 text-gray-700 border-amber-200 dark:border-amber-700/40",
  },
  reviewing: {
    label: "In revisione",
    tone: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-600 border-blue-200 dark:border-blue-700/40",
  },
  resolved: {
    label: "Risolta",
    tone: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-600 border-emerald-200 dark:border-emerald-700/40",
  },
  rejected: {
    label: "Respinta",
    tone: "bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/40",
  },
});

export const REPORT_PRIORITY_META = Object.freeze({
  low: {
    label: "Bassa",
    tone: "bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/40",
  },
  medium: {
    label: "Media",
    tone: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-600 border-amber-200 dark:border-amber-700/40",
  },
  high: {
    label: "Alta",
    tone: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-600 border-red-200 dark:border-red-700/40",
  },
});

export const REPORT_SEVERITY_META = Object.freeze({
  low: {
    label: "Bassa",
    tone: "bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/40",
  },
  medium: {
    label: "Media",
    tone: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-600 border-amber-200 dark:border-amber-700/40",
  },
  high: {
    label: "Alta",
    tone: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-600 border-orange-200 dark:border-orange-700/40",
  },
  critical: {
    label: "Critica",
    tone: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-600 border-red-200 dark:border-red-600/70",
  },
});

export const REPORT_STATUS_VALUES = Object.freeze(
  Object.keys(REPORT_STATUS_META)
);
export const REPORT_PRIORITY_VALUES = Object.freeze(
  Object.keys(REPORT_PRIORITY_META)
);
export const REPORT_SEVERITY_VALUES = Object.freeze(
  Object.keys(REPORT_SEVERITY_META)
);

export const REPORT_QUICK_ACTIONS = Object.freeze({
  START_REVIEW: "start_review",
  RESOLVE: "resolve",
  REJECT: "reject",
  REOPEN: "reopen",
  ESCALATE: "escalate",
  REMOVE_APARTMENT: "remove_apartment",
});

const reasonLabelMap = Object.freeze(
  REPORT_REASON_OPTIONS.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {})
);

export const getReportReasonLabel = (reason) =>
  reasonLabelMap[reason] || reasonLabelMap.other;

export const getReportStatusMeta = (status) =>
  REPORT_STATUS_META[status] || REPORT_STATUS_META.open;

export const getReportPriorityMeta = (priority) =>
  REPORT_PRIORITY_META[priority] || REPORT_PRIORITY_META.medium;

export const getReportSeverityMeta = (severity) =>
  REPORT_SEVERITY_META[severity] || REPORT_SEVERITY_META.medium;
