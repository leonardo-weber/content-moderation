"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageSquare,
  Share2,
  ChevronRight,
  Pin,
  Megaphone,
  GraduationCap,
  CalendarDays,
  TrendingUp,
  Award,
  Gift,
  Wrench,
  Image as ImageIcon,
  Video,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PostData = {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  category: string;
  contentType: string;
  mediaPlaceholder: string | null;
  likes: number;
  shares: number;
  isPinned: boolean;
  createdAt: Date;
  _count: { comments: number };
};

const categoryLabels: Record<string, string> = {
  announcement: "Announcement",
  training: "Training",
  event: "Event",
  "market-report": "Market Report",
  "member-spotlight": "Member Spotlight",
  benefits: "Benefits",
  operations: "Operations",
};

const categoryColors: Record<string, string> = {
  announcement: "bg-[#1b3a5c]/10 text-[#1b3a5c]",
  training: "bg-emerald-50 text-emerald-700",
  event: "bg-[#1b3a5c]/10 text-[#1b3a5c]",
  "market-report": "bg-emerald-50 text-emerald-700",
  "member-spotlight": "bg-[#1b3a5c]/10 text-[#1b3a5c]",
  benefits: "bg-emerald-50 text-emerald-700",
  operations: "bg-[#1b3a5c]/10 text-[#1b3a5c]",
};

const categoryIcons: Record<string, typeof Megaphone> = {
  announcement: Megaphone,
  training: GraduationCap,
  event: CalendarDays,
  "market-report": TrendingUp,
  "member-spotlight": Award,
  benefits: Gift,
  operations: Wrench,
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function MediaAttachment({ post }: { post: PostData }) {
  if (!post.mediaPlaceholder) return null;

  if (post.contentType === "image") {
    return (
      <div className="mt-3 flex aspect-video items-center justify-center rounded-lg bg-gray-100">
        <div className="flex flex-col items-center">
          <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
          <p className="px-6 text-center text-xs text-gray-400">
            {post.mediaPlaceholder}
          </p>
        </div>
      </div>
    );
  }

  if (post.contentType === "video") {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#1b3a5c]/5 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/80">
          <Video className="h-5 w-5 text-[#1b3a5c]" />
        </div>
        <div className="flex-1">
          <span className="mb-1 inline-block rounded-full bg-[#1b3a5c]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1b3a5c]">
            Video
          </span>
          <p className="text-sm text-gray-900">{post.mediaPlaceholder}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b3a5c]">
          <Play className="h-4 w-4 text-white" />
        </div>
      </div>
    );
  }

  if (post.contentType === "event") {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#1b3a5c]/5 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/80">
          <CalendarDays className="h-5 w-5 text-[#1b3a5c]" />
        </div>
        <div className="flex-1">
          <span className="mb-1 inline-block rounded-full bg-[#1b3a5c]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1b3a5c]">
            Event
          </span>
          <p className="text-sm text-gray-900">{post.mediaPlaceholder}</p>
        </div>
        <ChevronRight className="h-[18px] w-[18px] text-gray-400" />
      </div>
    );
  }

  return null;
}

function PostActions({ post }: { post: PostData }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <div className="mt-3 flex items-center border-t border-gray-100 pt-3">
      <button
        onClick={handleLike}
        className="flex flex-1 items-center justify-center gap-1.5"
      >
        <Heart
          className={cn(
            "h-4 w-4",
            liked ? "fill-red-500 text-red-500" : "text-gray-400"
          )}
        />
        <span
          className={cn(
            "text-xs font-medium",
            liked ? "text-red-500" : "text-gray-400"
          )}
        >
          {likeCount}
        </span>
      </button>

      <div className="flex flex-1 items-center justify-center gap-1.5">
        <MessageSquare className="h-4 w-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-400">
          {post._count.comments}
        </span>
      </div>

      <button className="flex flex-1 items-center justify-center gap-1.5">
        <Share2 className="h-4 w-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-400">
          {post.shares}
        </span>
      </button>
    </div>
  );
}

export function PostCard({ post }: { post: PostData }) {
  const CategoryIcon = categoryIcons[post.category] ?? Megaphone;

  return (
    <Link
      href={`/post/${post.id}`}
      className="block border-b border-gray-100 px-4 py-4 transition-colors hover:bg-gray-50/50"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1b3a5c]">
          <CategoryIcon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">
              {post.authorName}
            </p>
            {post.isPinned && <Pin className="h-3 w-3 text-[#1b3a5c]" />}
          </div>
          <p className="text-xs text-gray-500">{post.authorRole}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {formatTimestamp(post.createdAt)}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                categoryColors[post.category] ?? "bg-gray-100 text-gray-600"
              )}
            >
              {categoryLabels[post.category] ?? post.category}
            </span>
          </div>
        </div>
        <ChevronRight className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gray-300" />
      </div>

      <p className="mt-3 text-sm leading-5 text-gray-900 whitespace-pre-line">
        {post.content}
      </p>

      <MediaAttachment post={post} />
      <PostActions post={post} />
    </Link>
  );
}
