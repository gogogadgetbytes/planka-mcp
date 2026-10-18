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
import { CommentResponse, CommentsResponse } from "../schemas/responses.js";

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
 * PLANKA 2.x serves comments from a dedicated endpoint: the card
 * detail response never includes them.
 */
export async function getCommentsForCard(cardId: string): Promise<Comment[]> {
  const response = await plankaClient.get<unknown>(
    `/api/cards/${cardId}/comments`
  );

  const parsed = CommentsResponse.parse(response);
  return parsed.items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
