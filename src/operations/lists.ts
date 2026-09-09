/**
 * List operations for PLANKA API.
 */
import { plankaClient } from "../client.js";
import { List } from "../schemas/entities.js";
import { ListResponse } from "../schemas/responses.js";
import {
  CreateListSchema,
  UpdateListSchema,
  CreateListInput,
  UpdateListInput,
} from "../schemas/requests.js";

/**
 * Create a new list on a board.
 */
export async function createList(input: CreateListInput): Promise<List> {
  const validated = CreateListSchema.parse(input);

  const response = await plankaClient.post<unknown>(
    `/api/boards/${validated.boardId}/lists`,
    {
      name: validated.name,
      position: validated.position,
      type: validated.type,
    }
  );

  const parsed = ListResponse.parse(response);
  return parsed.item;
}

/**
 * Update a list's properties.
 */
export async function updateList(
  listId: string,
  input: UpdateListInput
): Promise<List> {
  const validated = UpdateListSchema.parse(input);

  const response = await plankaClient.patch<unknown>(
    `/api/lists/${listId}`,
    validated
  );

  const parsed = ListResponse.parse(response);
  return parsed.item;
}

/**
 * Delete a list.
 */
export async function deleteList(listId: string): Promise<void> {
  await plankaClient.delete(`/api/lists/${listId}`);
}
