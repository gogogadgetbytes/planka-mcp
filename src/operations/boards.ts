/**
 * Board operations for PLANKA API.
 */
import { plankaClient } from "../client.js";
import {
  Board,
  List,
  Card,
  Label,
  CardLabel,
  TaskList,
  Task,
} from "../schemas/entities.js";
import { BoardResponse, BoardIncludedSchema } from "../schemas/responses.js";
import {
  CreateBoardSchema,
  UpdateBoardSchema,
  CreateBoardInput,
  UpdateBoardInput,
} from "../schemas/requests.js";

/**
 * Create a new board in a project.
 */
export async function createBoard(input: CreateBoardInput): Promise<Board> {
  const validated = CreateBoardSchema.parse(input);

  const response = await plankaClient.post<unknown>(
    `/api/projects/${validated.projectId}/boards`,
    {
      name: validated.name,
      position: validated.position,
    }
  );

  const parsed = BoardResponse.parse(response);
  return parsed.item;
}

/**
 * Update a board's properties.
 */
export async function updateBoard(
  boardId: string,
  input: UpdateBoardInput
): Promise<Board> {
  const validated = UpdateBoardSchema.parse(input);

  const response = await plankaClient.patch<unknown>(
    `/api/boards/${boardId}`,
    validated
  );

  const parsed = BoardResponse.parse(response);
  return parsed.item;
}

/**
 * Delete a board.
 */
export async function deleteBoard(boardId: string): Promise<void> {
  await plankaClient.delete(`/api/boards/${boardId}`);
}

/**
 * Full board details with all included entities.
 */
export interface BoardDetails {
  board: Board;
  lists: List[];
  cards: Card[];
  labels: Label[];
  cardLabels: CardLabel[];
  taskLists: TaskList[];
  tasks: Task[];
}

/**
 * Card with computed task counts.
 */
export interface CardWithTaskCounts extends Card {
  taskCount: number;
  completedTaskCount: number;
}

/**
 * Get a board by ID with all included entities.
 */
export async function getBoard(boardId: string): Promise<BoardDetails> {
  const response = await plankaClient.get<unknown>(`/api/boards/${boardId}`);
  const parsed = BoardResponse.parse(response);
  const included = BoardIncludedSchema.parse(
    (response as Record<string, unknown>).included || {}
  );

  return {
    board: parsed.item,
    lists: (included.lists || []).sort(
      (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)
    ),
    cards: included.cards || [],
    labels: (included.labels || []).sort((a, b) => a.position - b.position),
    cardLabels: included.cardLabels || [],
    taskLists: (included.taskLists || []).sort((a, b) => a.position - b.position),
    tasks: included.tasks || [],
  };
}

/**
 * Get a board with cards enriched with task counts.
 */
export async function getBoardWithTaskCounts(
  boardId: string
): Promise<{
  board: Board;
  lists: List[];
  cards: CardWithTaskCounts[];
  labels: Label[];
  cardLabels: CardLabel[];
}> {
  const details = await getBoard(boardId);

  // Build taskList -> cardId mapping (PLANKA 2.0: tasks belong to taskLists, not cards directly)
  const taskListToCard = new Map<string, string>();
  for (const taskList of details.taskLists) {
    taskListToCard.set(taskList.id, taskList.cardId);
  }

  // Build task count map by card
  const taskCountsByCard = new Map<
    string,
    { total: number; completed: number }
  >();

  for (const task of details.tasks) {
    // Get cardId via the taskList
    const cardId = taskListToCard.get(task.taskListId);
    if (!cardId) continue;

    const counts = taskCountsByCard.get(cardId) || {
      total: 0,
      completed: 0,
    };
    counts.total++;
    if (task.isCompleted) {
      counts.completed++;
    }
    taskCountsByCard.set(cardId, counts);
  }

  // Enrich cards with task counts
  const cardsWithCounts: CardWithTaskCounts[] = details.cards.map((card) => {
    const counts = taskCountsByCard.get(card.id) || { total: 0, completed: 0 };
    return {
      ...card,
      taskCount: counts.total,
      completedTaskCount: counts.completed,
    };
  });

  return {
    board: details.board,
    lists: details.lists,
    cards: cardsWithCounts,
    labels: details.labels,
    cardLabels: details.cardLabels,
  };
}

/**
 * Get cards for a specific list on a board.
 */
export async function getCardsForList(
  boardId: string,
  listId: string
): Promise<Card[]> {
  const details = await getBoard(boardId);
  return details.cards
    .filter((card) => card.listId === listId)
    .sort((a, b) => a.position - b.position);
}
