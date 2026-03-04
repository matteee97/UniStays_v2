import { createRoot } from "react-dom/client";
import AppProviders from "@/app/providers/AppProviders";
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";
import { initGA } from "@/ui/helpers/analytics";

initGA();

createRoot(document.getElementById("root")).render(<AppProviders />);
