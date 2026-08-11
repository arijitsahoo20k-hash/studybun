import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";

/** Fixed system channels (General, JEE Main, Physics, ...). Small and
 * rarely changes, so a plain fetch-once is enough — no realtime needed. */
export function useCommunityChannels() {
  const { user } = useAuth();
  const userId = user?.id;
  const [channels, setChannels] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase
      .from("community_channels")
      .select("id, name, slug, description, subject")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setChannels(data || []);
        setActiveChannelId((prev) => prev || data?.[0]?.id || null);
        setLoading(false);
      });
  }, [userId]);

  return { channels, activeChannelId, setActiveChannelId, loading };
}
