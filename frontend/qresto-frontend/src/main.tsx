// Polyfill for libraries that expect a Node `global` in the browser (e.g. sockjs-client)
;(window as Window & typeof globalThis & { global: typeof globalThis }).global = window;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import { authStorage } from './auth/authStorage.ts'

if (import.meta.env.DEV) {
    const devSessionStorageKey = "qresto-dev-server-session";
    const previousDevSession = sessionStorage.getItem(devSessionStorageKey);

    if (previousDevSession !== __QRESTO_DEV_SERVER_SESSION__) {
        authStorage.clearSession();
        sessionStorage.setItem(devSessionStorageKey, __QRESTO_DEV_SERVER_SESSION__);
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </StrictMode>,
)
