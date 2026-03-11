"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FeedbackType = "comment" | "approval" | "revision_request";

export type FeedbackComment = {
  id: string;
  shareId: string;
  author: string;
  content: string;
  type: FeedbackType;
  status?: "pending" | "resolved";
  createdAt: number;
};

const MAX_COMMENTS = 500;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

type FeedbackState = {
  comments: FeedbackComment[];
  addComment: (comment: Omit<FeedbackComment, "id" | "createdAt">) => void;
  resolveComment: (id: string) => void;
  getCommentsByShareId: (shareId: string) => FeedbackComment[];
  getApprovalStatus: (
    shareId: string
  ) => "pending" | "approved" | "revision_requested" | "no_feedback";
  deleteComment: (id: string) => void;
};

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set, get) => ({
      comments: [],

      addComment: (comment) => {
        const newComment: FeedbackComment = {
          ...comment,
          id: generateId(),
          createdAt: Date.now(),
        };
        set((state) => {
          const updated = [newComment, ...state.comments];
          return {
            comments:
              updated.length > MAX_COMMENTS
                ? updated.slice(0, MAX_COMMENTS)
                : updated,
          };
        });
      },

      resolveComment: (id) =>
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === id ? { ...c, status: "resolved" as const } : c
          ),
        })),

      getCommentsByShareId: (shareId) =>
        get().comments.filter((c) => c.shareId === shareId),

      getApprovalStatus: (shareId) => {
        const shareComments = get()
          .comments.filter(
            (c) =>
              c.shareId === shareId &&
              (c.type === "approval" || c.type === "revision_request")
          )
          .sort((a, b) => b.createdAt - a.createdAt);

        if (shareComments.length === 0) return "no_feedback";

        const latest = shareComments[0];
        if (latest.type === "approval") return "approved";
        if (latest.type === "revision_request") return "revision_requested";
        return "pending";
      },

      deleteComment: (id) =>
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "generative-ui-feedback",
    }
  )
);
