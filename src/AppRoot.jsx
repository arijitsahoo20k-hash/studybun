import React, { useState, lazy, Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { isSupabaseConfigured } from "./lib/supabaseClient";
import { THEMES, themeVars } from "./data/themes";
import { DecorLayer, LoadingScreen } from "./components/ui";
import GlobalStyle from "./styles/GlobalStyle";
import Landing from "./pages/landing";

// Auth and App were eagerly imported here, which meant the ~955KB main
// bundle -- gsap, framer-motion, the entire Mascot mood engine, GlobalStyle,
// and every page's lazy-loader map -- had to be downloaded, parsed, and
// executed before an ANONYMOUS visitor could even see the landing page.
// Lighthouse hits "/" logged out, so this was the single biggest chunk of
// its 8.4s mobile LCP. Landing is the only thing a first-time visitor
// actually needs; Auth/App now load on demand, right when they're reached.
const Auth = lazy(() => import("./pages/auth"));
const App = lazy(() => import("./App"));

const DEFAULT_THEME = THEMES["Sakura Bloom"];

function Gate() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const cssVars = themeVars(DEFAULT_THEME);

  // Supabase isn't configured yet — skip the auth wall so the existing
  // "not configured" banner inside App can explain what to do next.
  if (!isSupabaseConfigured) {
    return (
      <Suspense fallback={<LoadingScreen message="Waking up your study buddy..." />}>
        <App />
      </Suspense>
    );
  }

  if (loading) {
    return (
      <div style={cssVars}>
        <GlobalStyle />
        <DecorLayer theme={DEFAULT_THEME} />
        <LoadingScreen message="Waking up your study buddy..." />
      </div>
    );
  }

  if (!user) {
    if (!showAuth) {
      return (
        <div style={cssVars}>
          <GlobalStyle />
          <Landing onGetStarted={() => setShowAuth(true)} />
        </div>
      );
    }
    return (
      <div className="sb-onboard sb-auth-page" style={cssVars}>
        <GlobalStyle />
        <DecorLayer theme={DEFAULT_THEME} />
        <button className="sb-land-back-btn" onClick={() => setShowAuth(false)}>
          <ArrowLeft size={14} /> Back to explore
        </button>
        <div className="sb-flow-shell">
          <Suspense fallback={<LoadingScreen message="Waking up your study buddy..." />}>
            <Auth />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingScreen message="Waking up your study buddy..." />}>
      <App />
    </Suspense>
  );
}

export default function AppRoot() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
