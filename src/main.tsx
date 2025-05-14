
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from './contexts/AuthContext';

const root = createRoot(document.getElementById("root")!);

root.render(
  <AuthProvider>
    <App />
    <Toaster />
  </AuthProvider>
);
