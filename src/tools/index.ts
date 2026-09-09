/**
 * Tool registry for PLANKA MCP server.
 */
import { navigationTools } from "./navigation.js";
import { cardTools } from "./cards.js";
import { taskTools } from "./tasks.js";
import { labelTools } from "./labels.js";
import { commentTools } from "./comments.js";
import { listTools } from "./lists.js";
import { boardTools } from "./boards.js";

/**
 * All registered tools.
 */
export const allTools = [
  ...navigationTools,
  ...cardTools,
  ...taskTools,
  ...labelTools,
  ...commentTools,
  ...listTools,
  ...boardTools,
];

/**
 * Tool type definition.
 */
export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (params: unknown) => Promise<{
    content: Array<{ type: "text"; text: string }>;
    isError?: boolean;
  }>;
}

/**
 * Get a tool by name.
 */
export function getTool(name: string): Tool | undefined {
  return allTools.find((tool) => tool.name === name) as Tool | undefined;
}

/**
 * Get all tool definitions (for MCP listTools).
 */
export function getToolDefinitions() {
  return allTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));
}

// Re-export individual tool groups
export { navigationTools } from "./navigation.js";
export { cardTools } from "./cards.js";
export { taskTools } from "./tasks.js";
export { labelTools } from "./labels.js";
export { commentTools } from "./comments.js";
export { listTools } from "./lists.js";
export { boardTools } from "./boards.js";
