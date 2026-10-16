"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  X,
  ShieldAlert,
  TriangleAlert,
  Check,
  Loader2,
  Image,
  Video,
  Radio,
  House,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/lib/trpc";

type AttachmentType = "image" | "video" | "audio" | "listing" | "event";

type ModerationViolation = {
  type: string;
  label: string;
  detail: string;
};

const attachmentOptions: {
  type: AttachmentType;
  icon: typeof Image;
  label: string;
}[] = [
  { type: "image", icon: Image, label: "Photo" },
  { type: "video", icon: Video, label: "Video" },
  { type: "audio", icon: Radio, label: "Audio" },
  { type: "listing", icon: House, label: "Listing" },
  { type: "event", icon: CalendarDays, label: "Event" },
];

function ModerationBlocked({
  violations,
  onDismiss,
}: {
  violations: ModerationViolation[];
  onDismiss: () => void;
}) {
  return (
    <div className="py-6">
      <div className="mb-4 flex flex-col items-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert className="h-7 w-7 text-red-500" />
        </div>
        <h3 className="mb-1 text-lg font-bold text-gray-900">
          Content Blocked
        </h3>
        <p className="text-center text-sm text-gray-500">
          Your post was flagged by our content moderation system.
        </p>
      </div>

      <div className="mb-4 space-y-2">
        {violations.map((v, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5"
          >
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-700">{v.label}</p>
              <p className="mt-0.5 text-xs text-red-600">{v.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onDismiss}
        className="w-full rounded-full border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
      >
        Edit Post
      </button>
    </div>
  );
}

function PostedConfirmation({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center py-8">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <Check className="h-7 w-7 text-emerald-500" />
      </div>
      <h3 className="mb-1 text-lg font-bold text-gray-900">Posted!</h3>
      <p className="mb-4 text-center text-sm text-gray-500">
        Your update is now visible to your network.
      </p>
      <button
        onClick={onClose}
        className="rounded-full bg-[#1b3a5c] px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#15304d]"
      >
        Done
      </button>
    </div>
  );
}

type ComposePostModalProps = {
  open: boolean;
  onClose: () => void;
  onPosted: () => void;
};

export function ComposePostModal({
  open,
  onClose,
  onPosted,
}: ComposePostModalProps) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<AttachmentType | null>(null);
  const [posted, setPosted] = useState(false);
  const [violations, setViolations] = useState<ModerationViolation[]>([]);

  const trpc = useTRPC();

  const createPostMutation = useMutation(
    trpc.posts.create.mutationOptions({
      onSuccess: () => {
        setPosted(true);
        onPosted();
      },
    })
  );

  const moderationMutation = useMutation(
    trpc.moderation.check.mutationOptions({
      onSuccess: (result) => {
        if (result.allowed) {
          createPostMutation.mutate({ content: text.trim() });
        } else {
          setViolations(result.violations);
        }
      },
    })
  );

  const canPost = text.trim().length > 0;
  const isChecking = moderationMutation.isPending || createPostMutation.isPending;

  const handlePost = () => {
    setViolations([]);
    moderationMutation.mutate({ text: text.trim() });
  };

  const handleClose = () => {
    setText("");
    setAttachment(null);
    setPosted(false);
    setViolations([]);
    moderationMutation.reset();
    createPostMutation.reset();
    onClose();
  };

  if (!open) return null;

  const showBlocked = violations.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
        {posted ? (
          <PostedConfirmation onClose={handleClose} />
        ) : showBlocked ? (
          <ModerationBlocked
            violations={violations}
            onDismiss={() => setViolations([])}
          />
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Create Post</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePost}
                  disabled={!canPost || isChecking}
                  className={cn(
                    "min-w-[72px] rounded-full px-5 py-2 text-sm font-semibold text-white",
                    canPost && !isChecking
                      ? "bg-[#1b3a5c] hover:bg-[#15304d]"
                      : "bg-[#1b3a5c]/40 cursor-not-allowed"
                  )}
                >
                  {isChecking ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    "Post"
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1b3a5c]/10">
                <span className="text-sm font-bold text-[#1b3a5c]">JD</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Broker Associate</p>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What do you want to share?"
              className="mt-3 min-h-[120px] w-full resize-none text-sm leading-5 text-gray-900 placeholder-gray-400 outline-none"
              autoFocus
            />

            {attachment && (
              <div className="mt-3 flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80">
                  {(() => {
                    const opt = attachmentOptions.find(
                      (o) => o.type === attachment
                    );
                    if (!opt) return null;
                    const Icon = opt.icon;
                    return <Icon className="h-5 w-5 text-[#1b3a5c]" />;
                  })()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {attachmentOptions.find((o) => o.type === attachment)
                      ?.label ?? ""}{" "}
                    attached
                  </p>
                </div>
                <Check className="h-4 w-4 text-emerald-500" />
              </div>
            )}

            <div className="mt-4 border-t border-gray-200 pt-3">
              <p className="mb-2 text-xs font-medium text-gray-500">
                Add to your post
              </p>
              <div className="flex flex-wrap gap-2">
                {attachmentOptions.map((option) => {
                  const Icon = option.icon;
                  const active = attachment === option.type;
                  return (
                    <button
                      key={option.type}
                      onClick={() =>
                        setAttachment((prev) =>
                          prev === option.type ? null : option.type
                        )
                      }
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold",
                        active
                          ? "border-[#1b3a5c] bg-[#1b3a5c]/5 text-[#1b3a5c]"
                          : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
