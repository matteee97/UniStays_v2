import { useState } from "react";
import CoolButton from "@/ui/components/common/buttons/CoolButton";

export default function ReplyForm({ onSubmit, disabled, setOpen }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(text);
    setText("");
    setOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border border-[#d4f1ef] rounded-lg px-4 py-3 focus:outline-none"
        rows={3}
        placeholder="Scrivi una risposta..."
      />
      <div className="flex gap-2">
        <CoolButton
          type="submit"
          disabled={disabled}
          className="px-4 py-2 rounded-lg"
        >
          Invia risposta
        </CoolButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm text-gray-500"
        >
          Annulla
        </button>
      </div>
    </form>
  );
}
