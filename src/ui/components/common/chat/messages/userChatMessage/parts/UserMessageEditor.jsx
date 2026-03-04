const UserMessageEditor = ({ value, onChange, onSave, onCancel, onKeyDown }) => (
  <div className="space-y-1">
    <textarea
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className="w-full bg-transparent border-none outline-none resize-none text-sm"
      rows={Math.min(value.split("\n").length, 4)}
      autoFocus
    />
    <div className="flex gap-2 text-xs">
      <button
        type="button"
        onClick={onSave}
        className="text-white hover:text-gray-200"
      >
        Salva
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-white hover:text-gray-200"
      >
        Annulla
      </button>
    </div>
  </div>
);

export default UserMessageEditor;
