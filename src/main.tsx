// Sentry는 반드시 최상단에서 import
import "./instrument";

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
