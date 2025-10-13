import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { Amplify } from 'aws-amplify'; // Correct v6 import
import config from './amplifyconfiguration.json'; // The new config file name

// Configure Amplify
Amplify.configure(config);

createRoot(document.getElementById("root")!).render(<App />);
