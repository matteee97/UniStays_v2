import { createRoot } from "react-dom/client";
import AppProviders from "@/app/providers/AppProviders";
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";

createRoot(document.getElementById("root")).render(<AppProviders />);
