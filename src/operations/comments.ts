/**
 * Comment operations for PLANKA API.
 */
import { plankaClient } from "../client.js";
import { Comment } from "../schemas/entities.js";
import {
  CreateCommentSchema,
  UpdateCommentSchema,
  CreateCommentInput,
  UpdateCommentInput,
} from "../schemas/requests.js";
import { CommentResponse, CommentsResponse, CommentsIncludedSchema } from "../schemas/responses.js";

/**
 * A comment enriched with its author's display name (when the API
 * includes the user record).
 */
export interface CommentWithAuthor extends Comment {
  authorName?: string;
}

/**
 * Add a comment to a card.
 */
export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const validated = CreateCommentSchema.parse(input);

  const response = await plankaClient.post<unknown>(
    `/api/cards/${validated.cardId}/comments`,
    {
      text: validated.text,
    }
  );

  const parsed = CommentResponse.parse(response);
  return parsed.item;
}

/**
 * Update a comment's text.
 */
export async function updateComment(
  commentId: string,
  input: UpdateCommentInput
): Promise<Comment> {
  const validated = UpdateCommentSchema.parse(input);

  const response = await plankaClient.patch<unknown>(
    `/api/comments/${commentId}`,
    validated
  );

  const parsed = CommentResponse.parse(response);
  return parsed.item;
}

/**
 * Delete a comment.
 */
export async function deleteComment(commentId: string): Promise<void> {
  await plankaClient.delete(`/api/comments/${commentId}`);
}

/**
 * Get all comments for a card, newest first.
 * PLANKA 2.x serves comments only from the dedicated endpoint — the card
 * response's `included` never carries them.
 */
export async function getCommentsForCard(
  cardId: string
): Promise<CommentWithAuthor[]> {
  const response = await plankaClient.get<unknown>(
    `/api/cards/${cardId}/comments`
  );
  const parsed = CommentsResponse.parse(response);
  const included = CommentsIncludedSchema.parse(
    (response as Record<string, unknown>).included || {}
  );
  const users = included.users || [];

  return parsed.items
    .map((c) => ({
      ...c,
      authorName: users.find((u) => u.id === c.userId)?.name,
    }))
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}
