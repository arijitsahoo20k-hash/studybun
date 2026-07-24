import React from "react";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { isSupabaseConfigured } from "./lib/supabaseClient";
import { THEMES, themeVars } from "./data/themes";
import { DecorLayer, LoadingScreen } from "./components/ui";
import GlobalStyle from "./styles/GlobalStyle";
import Auth from "./pages/Auth";
import App from "./App";

const DEFAULT_THEME = THEMES["Sakura Bloom"];

function Gate() {
  const { user, loading } = useAuth();
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
    return (
      <div className="sb-onboard" style={cssVars}>
        <GlobalStyle />
        <DecorLayer theme={DEFAULT_THEME} />
        <Auth />
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
