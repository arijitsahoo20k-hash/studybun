import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { isSupabaseConfigured } from "./lib/supabaseClient";
import { THEMES, themeVars } from "./data/themes";
import { DecorLayer, LoadingScreen } from "./components/ui";
import GlobalStyle from "./styles/GlobalStyle";
import Auth from "./pages/auth";
import Landing from "./pages/landing";
import App from "./App";

const DEFAULT_THEME = THEMES["Sakura Bloom"];

function Gate() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const cssVars = themeVars(DEFAULT_THEME);

  // Supabase isn't configured yet — skip the auth wall so the existing
  // "not configured" banner inside App can explain what to do next.
  if (!isSupabaseConfigured) return <App />;

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
          <Auth />
        </div>
      </div>
    );
  }

  return <App />;
}

export default function AppRoot() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
