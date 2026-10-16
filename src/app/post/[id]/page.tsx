"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUp,
  Heart,
  MessageSquare,
  Share2,
  Pin,
  ChevronDown,
  ShieldAlert,
  X,
  Loader2,
  Megaphone,
  GraduationCap,
  CalendarDays,
  TrendingUp,
  Award,
  Gift,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/lib/trpc";
import { Header } from "@/components/header";

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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

type CommentData = {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  likes: number;
  createdAt: Date;
  replies?: CommentData[];
};

function CommentLikeButton({
  likes,
}: {
  likes: number;
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likes);

  return (
    <button
      onClick={() => {
        setLiked(!liked);
        setCount((prev) => (liked ? prev - 1 : prev + 1));
      }}
      className="flex items-center gap-1"
    >
      <Heart
        className={cn(
          "h-3 w-3",
          liked ? "fill-red-500 text-red-500" : "text-gray-400"
        )}
      />
      <span
        className={cn("text-[11px]", liked ? "text-red-500" : "text-gray-400")}
      >
        {count}
      </span>
    </button>
  );
}

function ReplyItem({ reply }: { reply: CommentData }) {
  return (
    <div className="mt-2 ml-10 flex gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1b3a5c]/10">
        <span className="text-[9px] font-bold text-[#1b3a5c]">
          {getInitials(reply.authorName)}
        </span>
      </div>
      <div className="flex-1 rounded-lg bg-gray-50 px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-900">
            {reply.authorName}
          </span>
          <span className="text-[10px] text-gray-400">
            {formatTimestamp(reply.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-xs leading-4 text-gray-900">{reply.text}</p>
        <div className="mt-1.5 flex items-center gap-3">
          <CommentLikeButton likes={reply.likes} />
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: CommentData }) {
  const [showReplies, setShowReplies] = useState(false);
  const hasReplies = (comment.replies?.length ?? 0) > 0;

  return (
    <div className="mt-3">
      <div className="flex gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1b3a5c]/10">
          <span className="text-[10px] font-bold text-[#1b3a5c]">
            {getInitials(comment.authorName)}
          </span>
        </div>
        <div className="flex-1 rounded-lg bg-gray-50 px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-900">
              {comment.authorName}
            </span>
            <span className="text-[10px] text-gray-400">
              {formatTimestamp(comment.createdAt)}
            </span>
          </div>
          <p className="text-[10px] text-gray-500">{comment.authorRole}</p>
          <p className="mt-1 text-sm leading-5 text-gray-900">
            {comment.text}
          </p>
          <div className="mt-2 flex items-center gap-4">
            <CommentLikeButton likes={comment.likes} />
            <button className="text-[11px] font-medium text-gray-400">
              Reply
            </button>
          </div>
        </div>
      </div>

      {hasReplies &&
        (showReplies ? (
          <>
            {comment.replies!.map((reply) => (
              <ReplyItem key={reply.id} reply={reply} />
            ))}
            <button
              onClick={() => setShowReplies(false)}
              className="mt-1.5 ml-10 text-xs font-medium text-[#1b3a5c]"
            >
              Hide replies
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowReplies(true)}
            className="mt-1.5 ml-10 flex items-center gap-1"
          >
            <ChevronDown className="h-3 w-3 text-[#1b3a5c]" />
            <span className="text-xs font-medium text-[#1b3a5c]">
              {comment.replies!.length}{" "}
              {comment.replies!.length === 1 ? "reply" : "replies"}
            </span>
          </button>
        ))}
    </div>
  );
}

function ModerationBanner({
  violations,
  onDismiss,
}: {
  violations: { type: string; label: string; detail: string }[];
  onDismiss: () => void;
}) {
  return (
    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
        <span className="flex-1 text-xs font-semibold text-red-700">
          Comment blocked
        </span>
        <button onClick={onDismiss}>
          <X className="h-3.5 w-3.5 text-red-400" />
        </button>
      </div>
      {violations.map((v, i) => (
        <p key={i} className="mt-1 text-xs text-red-600">
          {v.label}: {v.detail}
        </p>
      ))}
    </div>
  );
}

function CommentInput({ postId }: { postId: string }) {
  const [text, setText] = useState("");
  const [violations, setViolations] = useState<
    { type: string; label: string; detail: string }[]
  >([]);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const addCommentMutation = useMutation(
    trpc.posts.addComment.mutationOptions({
      onSuccess: () => {
        setText("");
        setViolations([]);
        queryClient.invalidateQueries({
          queryKey: trpc.posts.getById.queryKey({ id: postId }),
        });
      },
    })
  );

  const moderationMutation = useMutation(
    trpc.moderation.check.mutationOptions({
      onSuccess: (result) => {
        if (result.allowed) {
          addCommentMutation.mutate({ postId, text: text.trim() });
        } else {
          setViolations(result.violations);
        }
      },
    })
  );

  const handleSubmit = () => {
    if (!text.trim()) return;
    setViolations([]);
    moderationMutation.mutate({ text: text.trim() });
  };

  const isChecking =
    moderationMutation.isPending || addCommentMutation.isPending;

  return (
    <div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1b3a5c]/10">
          <span className="text-[10px] font-bold text-[#1b3a5c]">JD</span>
        </div>
        <div className="flex min-h-[36px] flex-1 items-center rounded-full border border-gray-200 bg-white px-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Write a comment..."
            className="min-w-0 flex-1 py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
            disabled={isChecking}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isChecking}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            text.trim() && !isChecking
              ? "bg-[#1b3a5c] hover:bg-[#15304d]"
              : "bg-[#1b3a5c]/40 cursor-not-allowed"
          )}
        >
          {isChecking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
          ) : (
            <ArrowUp className="h-3.5 w-3.5 text-white" />
          )}
        </button>
      </div>
      {violations.length > 0 && (
        <ModerationBanner
          violations={violations}
          onDismiss={() => setViolations([])}
        />
      )}
    </div>
  );
}

function PostActions({
  likes,
  commentCount,
  shares,
}: {
  likes: number;
  commentCount: number;
  shares: number;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  return (
    <div className="mt-3 flex items-center border-t border-gray-100 pt-3">
      <button
        onClick={() => {
          setLiked(!liked);
          setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
        }}
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
        <MessageSquare className="h-4 w-4 text-[#1b3a5c]" />
        <span className="text-xs font-medium text-[#1b3a5c]">
          {commentCount}
        </span>
      </div>
      <button className="flex flex-1 items-center justify-center gap-1.5">
        <Share2 className="h-4 w-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-400">{shares}</span>
      </button>
    </div>
  );
}

function PostDetailContent({ postId }: { postId: string }) {
  const router = useRouter();
  const trpc = useTRPC();
  const postQuery = useQuery(trpc.posts.getById.queryOptions({ id: postId }));

  const post = postQuery.data;

  if (postQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">Post not found</p>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[post.category] ?? Megaphone;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="rounded-full p-1 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-sm font-semibold text-gray-900">Post</h1>
      </div>

      <div className="border-b border-gray-100 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1b3a5c]">
            <CategoryIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
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
        </div>

        <p className="mt-3 text-sm leading-5 text-gray-900 whitespace-pre-line">
          {post.content}
        </p>

        <PostActions
          likes={post.likes}
          commentCount={post._count.comments}
          shares={post.shares}
        />
      </div>

      <div className="border-t border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">
          Comments ({post._count.comments})
        </p>
        <CommentInput postId={post.id} />
        {post.comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </main>
  );
}

function PostDetailPageInner() {
  const params = useParams();
  const postId = params.id as string;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <PostDetailContent postId={postId} />
    </div>
  );
}

export default function PostDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </div>
      }
    >
      <PostDetailPageInner />
    </Suspense>
  );
}
