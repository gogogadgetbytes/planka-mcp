/**
 * Card operations for PLANKA API.
 */
import { plankaClient } from "../client.js";
import { Card, TaskList, Task, Comment, Label, CardLabel, Attachment } from "../schemas/entities.js";
import {
  CreateCardSchema,
  UpdateCardSchema,
  MoveCardSchema,
  CreateCardInput,
  UpdateCardInput,
  MoveCardInput,
} from "../schemas/requests.js";
import { CardResponse, CardIncludedSchema } from "../schemas/responses.js";
import { getCommentsForCard } from "./comments.js";

/**
 * Card details with all related entities.
 */
export interface CardDetails {
  card: Card;
  taskLists: TaskList[];
  tasks: Task[];
  comments: Comment[];
  labels: Label[];
  cardLabels: CardLabel[];
  attachments: Attachment[];
}

/**
 * Create a new card in a list.
 */
export async function createCard(input: CreateCardInput): Promise<Card> {
  const validated = CreateCardSchema.parse(input);

  const response = await plankaClient.post<unknown>(
    `/api/lists/${validated.listId}/cards`,
    {
      name: validated.name,
      description: validated.description,
      position: validated.position,
      type: validated.type, // Required for PLANKA 2.0
      dueDate: validated.dueDate,
    }
  );

  const parsed = CardResponse.parse(response);
  return parsed.item;
}

/**
 * Get a card by ID with all related entities.
 */
export async function getCard(cardId: string): Promise<CardDetails> {
  const response = await plankaClient.get<unknown>(`/api/cards/${cardId}`);
  const parsed = CardResponse.parse(response);
  const included = CardIncludedSchema.parse(
    (response as Record<string, unknown>).included || {}
  );

  // PLANKA 2.x does not include comments in the card detail response
  // (the card only carries a commentsTotal counter): fetch them from
  // their dedicated endpoint.
  const comments = await getCommentsForCard(cardId);

  return {
    card: parsed.item,
    taskLists: (included.taskLists || []).sort((a, b) => a.position - b.position),
    tasks: (included.tasks || []).sort((a, b) => a.position - b.position),
    comments,
    labels: included.labels || [],
    cardLabels: included.cardLabels || [],
    attachments: included.attachments || [],
  };
}

/**
 * Update a card's properties.
 */
export async function updateCard(
  cardId: string,
  input: UpdateCardInput
): Promise<Card> {
  const validated = UpdateCardSchema.parse(input);

  const response = await plankaClient.patch<unknown>(
    `/api/cards/${cardId}`,
    validated
  );

  const parsed = CardResponse.parse(response);
  return parsed.item;
}

/**
 * Move a card to a different list/position.
 */
export async function moveCard(input: MoveCardInput): Promise<Card> {
  const validated = MoveCardSchema.parse(input);

  const updatePayload: Record<string, unknown> = {
    listId: validated.listId,
    position: validated.position,
  };

  if (validated.boardId) {
    updatePayload.boardId = validated.boardId;
  }

  const response = await plankaClient.patch<unknown>(
    `/api/cards/${validated.cardId}`,
    updatePayload
  );

  const parsed = CardResponse.parse(response);
  return parsed.item;
}

/**
 * Delete a card.
 */
export async function deleteCard(cardId: string): Promise<void> {
  await plankaClient.delete(`/api/cards/${cardId}`);
}
