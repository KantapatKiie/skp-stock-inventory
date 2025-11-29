import ReactDOM from "react-dom/client";
import { LanguageProvider } from './contexts/LanguageContext';
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
