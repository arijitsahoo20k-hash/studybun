import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import { attachProfiles } from "../lib/communityProfiles";

const PAGE_SIZE = 20;
const POST_SELECT = "id, user_id, type, content, subject, chapter, created_at";
const REPLY_SELECT = "id, post_id, user_id, content, created_at";

export function useCommunityFeed() {
  const { user } = useAuth();
  const userId = user?.id;
  const [posts, setPosts] = useState([]);
  const [repliesByPost, setRepliesByPost] = useState({});
  const [reactionsByPost, setReactionsByPost] = useState({}); // { [postId]: { support: n, helpful: n, lets_go: n, mine: Set } }
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const mounted = useRef(true);

  const loadReactions = useCallback(async (postIds) => {
    if (!postIds.length) return;
    const { data } = await supabase.from("community_reactions").select("post_id, user_id, reaction_type").in("post_id", postIds);
    const grouped = {};
    (data || []).forEach((r) => {
      grouped[r.post_id] ||= { support: 0, helpful: 0, lets_go: 0, mine: new Set() };
      grouped[r.post_id][r.reaction_type]++;
      if (r.user_id === userId) grouped[r.post_id].mine.add(r.reaction_type);
    });
    setReactionsByPost((prev) => ({ ...prev, ...grouped }));
  }, [userId]);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("community_posts").select(POST_SELECT).order("created_at", { ascending: false }).limit(PAGE_SIZE);
    if (!mounted.current) return;
    if (!error) {
      const withProfiles = await attachProfiles(data || []);
      if (!mounted.current) return;
      setPosts(withProfiles);
      setHasMore((data || []).length === PAGE_SIZE);
      loadReactions((data || []).map((p) => p.id));
    }
    setLoading(false);
  }, [userId, loadReactions]);

  const loadMore = useCallback(async () => {
    const oldest = posts[posts.length - 1]?.created_at;
    if (!oldest) return;
    const { data, error } = await supabase.from("community_posts").select(POST_SELECT).lt("created_at", oldest).order("created_at", { ascending: false }).limit(PAGE_SIZE);
    if (error) return;
    const withProfiles = await attachProfiles(data || []);
    setHasMore((data || []).length === PAGE_SIZE);
    setPosts((prev) => [...prev, ...withProfiles]);
    loadReactions((data || []).map((p) => p.id));
  }, [posts, loadReactions]);

  useEffect(() => {
    mounted.current = true;
    load();
    if (!userId) return () => { mounted.current = false; };
    const ch = supabase
      .channel("rt:community_posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_posts" }, async (payload) => {
        const { data: prof } = await supabase.from("profiles").select("name, mascot").eq("user_id", payload.new.user_id).maybeSingle();
        setPosts((prev) => (prev.some((p) => p.id === payload.new.id) ? prev : [{ ...payload.new, profiles: prof }, ...prev]));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "community_posts" }, (payload) => {
        setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
      })
      .subscribe();
    return () => { mounted.current = false; supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const createPost = useCallback(
    async (form) => {
      if (!userId) return { ok: false };
      const content = (form.content || "").trim();
      if (!content) return { ok: false, error: "Write something first." };
      if (content.length > 2000) return { ok: false, error: "That's too long (max 2000 characters)." };
      const { data, error: err } = await supabase
        .from("community_posts")
        .insert({ user_id: userId, type: form.type, content, subject: form.subject || null, chapter: form.chapter || null })
        .select(POST_SELECT)
        .single();
      if (err) {
        const friendly = err.message?.includes("rate_limited") ? "You've posted a lot this hour — try again later." : "Couldn't post that. Try again.";
        return { ok: false, error: friendly };
      }
      setPosts((prev) => [data, ...prev]);
      return { ok: true, data };
    },
    [userId]
  );

  const deletePost = useCallback(async (id) => {
    const { error: err } = await supabase.from("community_posts").delete().eq("id", id);
    if (err) return { ok: false };
    setPosts((prev) => prev.filter((p) => p.id !== id));
    return { ok: true };
  }, []);

  const loadReplies = useCallback(async (postId) => {
    const { data, error } = await supabase
      .from("community_replies")
      .select(REPLY_SELECT)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (!error) {
      const withProfiles = await attachProfiles(data || []);
      setRepliesByPost((prev) => ({ ...prev, [postId]: withProfiles }));
    }
  }, []);

  const addReply = useCallback(
    async (postId, content) => {
      if (!userId) return { ok: false };
      const trimmed = (content || "").trim();
      if (!trimmed) return { ok: false };
      const { data, error: err } = await supabase
        .from("community_replies")
        .insert({ post_id: postId, user_id: userId, content: trimmed })
        .select(REPLY_SELECT)
        .single();
      if (err) {
        const friendly = err.message?.includes("rate_limited") ? "Too many replies for now — try again soon." : "Couldn't send that reply.";
        return { ok: false, error: friendly };
      }
      setRepliesByPost((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), data] }));
      return { ok: true };
    },
    [userId]
  );

  const toggleReaction = useCallback(
    async (postId, reactionType) => {
      if (!userId) return;
      const current = reactionsByPost[postId] || { support: 0, helpful: 0, lets_go: 0, mine: new Set() };
      const already = current.mine.has(reactionType);
      // optimistic
      setReactionsByPost((prev) => {
        const next = { ...current, mine: new Set(current.mine) };
        if (already) { next[reactionType] = Math.max(0, next[reactionType] - 1); next.mine.delete(reactionType); }
        else { next[reactionType] = next[reactionType] + 1; next.mine.add(reactionType); }
        return { ...prev, [postId]: next };
      });
      if (already) {
        await supabase.from("community_reactions").delete().eq("post_id", postId).eq("user_id", userId).eq("reaction_type", reactionType);
      } else {
        await supabase.from("community_reactions").insert({ post_id: postId, user_id: userId, reaction_type: reactionType });
      }
    },
    [userId, reactionsByPost]
  );

  return { posts, loading, hasMore, loadMore, createPost, deletePost, repliesByPost, loadReplies, addReply, reactionsByPost, toggleReaction, refetch: load };
}
