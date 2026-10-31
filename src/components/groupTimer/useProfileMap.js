import { useEffect, useRef, useState } from "react";
import { fetchProfilesByIds } from "../../lib/communityProfiles";

// Same resolve-and-cache approach StudyingNowCard uses: presence / broadcasts /
// stats only ever carry user ids (a client must not be trusted to name itself),
// so names + mascots come from the batched profiles RPC and are cached.
// Returns a fresh Map snapshot whenever new profiles resolve so downstream
// useMemo hooks that depend on `profiles` (e.g. sorting idle room members by
// name in GroupRoom.jsx) recompute reliably.
export function useProfileMap(ids) {
  const cacheRef = useRef(new Map());
  const [snapshot, setSnapshot] = useState(() => new Map());
  const key = [...new Set((ids || []).filter(Boolean))].sort().join(",");
  useEffect(() => {
    const missing = key ? key.split(",").filter((id) => !cacheRef.current.has(id)) : [];
    if (!missing.length) return undefined;
    let cancelled = false;
    fetchProfilesByIds(missing)
      .then((fetched) => {
        if (cancelled) return;
        fetched.forEach((profile, id) => cacheRef.current.set(id, profile || null));
        missing.forEach((id) => { if (!cacheRef.current.has(id)) cacheRef.current.set(id, null); });
        setSnapshot(new Map(cacheRef.current));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [key]);
  return snapshot;
}
