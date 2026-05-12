// Polyfill for libraries that expect a Node `global` in the browser (e.g. sockjs-client)
;(window as any).global = window;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import { authStorage } from './auth/authStorage.ts'

if (import.meta.env.DEV) {
    const alreadyCleared = sessionStorage.getItem("qresto-dev-auth-cleared");

    if (!alreadyCleared) {
        authStorage.clearSession();
        sessionStorage.setItem("qresto-dev-auth-cleared", "true");
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </StrictMode>,
)