import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CoolButton from "../buttons/CoolButton";
import { faLock } from "@fortawesome/free-solid-svg-icons";

const ChatAccessDenied = ({ onBack }) => {
  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="text-center max-w-md">
        <div className="bg-red-50 dark:bg-red-800/10 border border-red-200 dark:border-red-900 text-red-800 text-sm px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FontAwesomeIcon icon={faLock} className="w-4 h-4" />
            <span className="font-semibold">Accesso negato</span>
          </div>
          <p className="text-sm mb-3">
            Non hai accesso a questa conversazione. Potresti essere stato
            rimosso o la conversazione non esiste più.
          </p>
          <div className="px-6">
            <CoolButton
              ariaLabel="Torna alla home"
              onClick={onBack}
              className="!bg-red-600 dark:bg-red-800"
            >
              Torna indietro
            </CoolButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAccessDenied;
