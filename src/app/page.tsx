"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTRPC } from "@/lib/trpc";
import { Header } from "@/components/header";
import { PostCard } from "@/components/post-card";
import { ComposePostModal } from "@/components/compose-post-modal";

function ComposeBar({ onPress }: { onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className="flex w-full items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 text-left"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1b3a5c]/10">
        <span className="text-xs font-bold text-[#1b3a5c]">JD</span>
      </div>
      <div className="flex-1 rounded-full border border-gray-200 px-4 py-2">
        <span className="text-sm text-gray-400">
          What do you want to share?
        </span>
      </div>
    </button>
  );
}

export default function FeedPage() {
  const [composeOpen, setComposeOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const postsQuery = useQuery(trpc.posts.list.queryOptions());

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 bg-white shadow-sm">
        <ComposeBar onPress={() => setComposeOpen(true)} />

        {postsQuery.isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}

        {postsQuery.data?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {postsQuery.data?.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No posts yet. Be the first to share something!
          </div>
        )}
      </main>

      <ComposePostModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onPosted={() =>
          queryClient.invalidateQueries({ queryKey: trpc.posts.list.queryKey() })
        }
      />
    </div>
  );
}
