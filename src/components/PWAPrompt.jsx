import React, { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * Handles PWA installability + update UX:
 * - Listens for the browser's `beforeinstallprompt` event and shows a small
 *   "Install StudyBun" banner (Android/desktop Chrome/Edge). Safari/iOS has
 *   no such event — users add-to-homescreen manually, so we stay silent there.
 * - Registers the service worker and shows a "New version available" banner
 *   when an update has been fetched, letting the user refresh on their terms
 *   instead of the app silently swapping code under them.
 */
export default function PWAPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [installDismissed, setInstallDismissed] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Check for a new service worker periodically so long-lived tabs still
      // get offered updates.
      if (registration) {
        setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
      }
    },
  });

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (needRefresh) {
    return (
      <div className="sb-pwa-banner">
        <span className="sb-pwa-banner-text">A new version of StudyBun is ready.</span>
        <div className="sb-pwa-banner-actions">
          <button className="sb-pwa-btn" onClick={() => updateServiceWorker(true)}>Refresh</button>
          <button className="sb-pwa-dismiss" onClick={() => setNeedRefresh(false)} aria-label="Dismiss">×</button>
        </div>
      </div>
    );
  }

  if (installEvent && !installDismissed) {
    return (
      <div className="sb-pwa-banner">
        <span className="sb-pwa-banner-text">Install StudyBun for quick access, offline app-shell, and a home-screen icon.</span>
        <div className="sb-pwa-banner-actions">
          <button
            className="sb-pwa-btn"
            onClick={async () => {
              installEvent.prompt();
              await installEvent.userChoice.catch(() => {});
              setInstallEvent(null);
            }}
          >
            Install
          </button>
          <button className="sb-pwa-btn ghost" onClick={() => setInstallDismissed(true)}>Not now</button>
        </div>
      </div>
    );
  }

  return null;
}
