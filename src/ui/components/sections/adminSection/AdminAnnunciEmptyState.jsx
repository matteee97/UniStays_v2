export default function AdminAnnunciEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="admin-empty">
      <p className="text-lg admin-muted">{title}</p>
      {description && (
        <p className="text-sm admin-muted mt-2">{description}</p>
      )}
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="admin-link mt-3 text-sm"
        >
          {actionLabel || "Azione"}
        </button>
      )}
    </div>
  );
}
