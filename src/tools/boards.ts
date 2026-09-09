/**
 * Board tools for PLANKA MCP server.
 */
import {
  createBoard,
  updateBoard,
  deleteBoard,
} from "../operations/boards.js";
import { PlankaError } from "../errors.js";

/**
 * Tool: planka_manage_boards
 * Create, update, or delete boards in a project.
 */
export const manageBoardsTool = {
  name: "planka_manage_boards",
  description: "Create, update, or delete boards in a project.",
  inputSchema: {
    type: "object" as const,
    properties: {
      action: {
        type: "string",
        enum: ["create", "update", "delete"],
        description: "Action to perform",
      },
      projectId: {
        type: "string",
        description: "Project ID (required for create)",
      },
      boardId: {
        type: "string",
        description: "Board ID (required for update/delete)",
      },
      name: {
        type: "string",
        description: "Board name",
      },
      position: {
        type: "number",
        description: "Board position",
      },
    },
    required: ["action"],
  },
  handler: async (params: {
    action: "create" | "update" | "delete";
    projectId?: string;
    boardId?: string;
    name?: string;
    position?: number;
  }) => {
    try {
      switch (params.action) {
        case "create": {
          if (!params.projectId) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: "Error: projectId is required for create action",
                },
              ],
              isError: true,
            };
          }
          if (!params.name) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: "Error: name is required for create action",
                },
              ],
              isError: true,
            };
          }

          const board = await createBoard({
            projectId: params.projectId,
            name: params.name,
            position: params.position,
          });

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    success: true,
                    board: {
                      id: board.id,
                      name: board.name,
                      position: board.position,
                    },
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "update": {
          if (!params.boardId) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: "Error: boardId is required for update action",
                },
              ],
              isError: true,
            };
          }

          const updates: Record<string, unknown> = {};
          if (params.name !== undefined) updates.name = params.name;
          if (params.position !== undefined) updates.position = params.position;

          const board = await updateBoard(params.boardId, updates);

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    success: true,
                    board: {
                      id: board.id,
                      name: board.name,
                      position: board.position,
                    },
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "delete": {
          if (!params.boardId) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: "Error: boardId is required for delete action",
                },
              ],
              isError: true,
            };
          }

          await deleteBoard(params.boardId);

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    success: true,
                    message: `Board ${params.boardId} deleted`,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        default:
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: Unknown action '${params.action}'`,
              },
            ],
            isError: true,
          };
      }
    } catch (error) {
      if (error instanceof PlankaError) {
        return {
          content: [{ type: "text" as const, text: `Error: ${error.message}` }],
          isError: true,
        };
      }
      throw error;
    }
  },
};

export const boardTools = [manageBoardsTool];
