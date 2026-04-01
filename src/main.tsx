import { createRoot } from 'react-dom/client'
import "@fontsource-variable/inter"
import App from './App.tsx'
import './index.css'
// Import Firebase configuration
import './firebase'

createRoot(document.getElementById("root")!).render(<App />);
