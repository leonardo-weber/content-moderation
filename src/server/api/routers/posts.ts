import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const postsRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    return prisma.post.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: { _count: { select: { comments: true } } },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.post.findUnique({
        where: { id: input.id },
        include: {
          _count: { select: { comments: true } },
          comments: {
            where: { parentId: null },
            orderBy: { createdAt: "asc" },
            include: {
              replies: {
                orderBy: { createdAt: "asc" },
              },
            },
          },
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        content: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.post.create({
        data: {
          authorName: "John Doe",
          authorRole: "Broker Associate",
          content: input.content,
          category: "member-spotlight",
          contentType: "text",
        },
        include: { _count: { select: { comments: true } } },
      });
    }),

  addComment: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        text: z.string().min(1).max(2000),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.comment.create({
        data: {
          postId: input.postId,
          text: input.text,
          authorName: "John Doe",
          authorRole: "Broker Associate",
          parentId: input.parentId,
        },
      });
    }),
});
