/**
 * API response schemas for PLANKA.
 */
import { z } from "zod";
import {
  ProjectSchema,
  BoardSchema,
  ListSchema,
  CardSchema,
  TaskListSchema,
  TaskSchema,
  LabelSchema,
  CommentSchema,
  UserSchema,
  CardLabelSchema,
  AttachmentSchema,
} from "./entities.js";

// Generic response wrappers
export const SingleItemResponse = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    item: itemSchema,
    included: z.record(z.any()).optional(),
  });

export const MultiItemResponse = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    included: z.record(z.any()).optional(),
  });

// Specific response types
export const ProjectResponse = SingleItemResponse(ProjectSchema);
export const ProjectsResponse = MultiItemResponse(ProjectSchema);

export const BoardResponse = SingleItemResponse(BoardSchema);
export const BoardsResponse = MultiItemResponse(BoardSchema);

export const ListResponse = SingleItemResponse(ListSchema);
export const ListsResponse = MultiItemResponse(ListSchema);

export const CardResponse = SingleItemResponse(CardSchema);
export const CardsResponse = MultiItemResponse(CardSchema);

export const TaskListResponse = SingleItemResponse(TaskListSchema);
export const TaskListsResponse = MultiItemResponse(TaskListSchema);

export const TaskResponse = SingleItemResponse(TaskSchema);
export const TasksResponse = MultiItemResponse(TaskSchema);

export const LabelResponse = SingleItemResponse(LabelSchema);
export const LabelsResponse = MultiItemResponse(LabelSchema);

export const CommentResponse = SingleItemResponse(CommentSchema);
export const CommentsResponse = MultiItemResponse(CommentSchema);

export const CardLabelResponse = SingleItemResponse(CardLabelSchema);

// Auth response
export const AuthResponse = z.object({
  item: z.string(), // JWT token
});

// Included entities schema for board details
export const BoardIncludedSchema = z
  .object({
    lists: z.array(ListSchema).optional(),
    cards: z.array(CardSchema).optional(),
    labels: z.array(LabelSchema).optional(),
    cardLabels: z.array(CardLabelSchema).optional(),
    taskLists: z.array(TaskListSchema).optional(),
    tasks: z.array(TaskSchema).optional(),
    users: z.array(UserSchema).optional(),
  })
  .passthrough(); // Allow additional fields

// Included entities schema for card details
export const CardIncludedSchema = z
  .object({
    taskLists: z.array(TaskListSchema).optional(),
    tasks: z.array(TaskSchema).optional(),
    comments: z.array(CommentSchema).optional(),
    labels: z.array(LabelSchema).optional(),
    cardLabels: z.array(CardLabelSchema).optional(),
    attachments: z.array(AttachmentSchema).optional(),
    users: z.array(UserSchema).optional(),
  })
  .passthrough();

// Included entities schema for the card-comments endpoint
export const CommentsIncludedSchema = z
  .object({
    users: z.array(UserSchema).optional(),
  })
  .passthrough();

// Projects response includes boards
export const ProjectsIncludedSchema = z
  .object({
    boards: z.array(BoardSchema).optional(),
    users: z.array(UserSchema).optional(),
  })
  .passthrough();
