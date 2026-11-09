"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __deferredInstallPrompt?: any;
  }
}

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Capture beforeinstallprompt immediately on window
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      window.__deferredInstallPrompt = e;
      window.dispatchEvent(new CustomEvent("pwa-prompt-ready"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 2. Clear on appinstalled
    const handleAppInstalled = () => {
      window.__deferredInstallPrompt = null;
      window.dispatchEvent(new CustomEvent("pwa-installed"));
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // 3. Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}
