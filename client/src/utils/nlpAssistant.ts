import { Task } from "@services/taskService";

/**
 * Natural Language Processing utility for task management
 * Parses user input and extracts task operations and parameters
 */

export interface ParsedCommand {
  action: "create" | "update" | "complete" | "delete" | "list" | "search" | "unknown";
  taskTitle?: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  assignTo?: string;
  confidence: number;
  originalInput: string;
}

// Keywords for each action
const actionPatterns = {
  create: /^(create|add|new|make)\s+(task|item)?/i,
  complete: /^(complete|finish|done|mark\s+(as\s+)?done|check|close)\s+/i,
  delete: /^(delete|remove|trash|discard)\s+(task|item)?/i,
  update: /^(update|edit|modify|change)\s+/i,
  list: /^(list|show|display|what|get)\s+(all\s+)?(tasks|items)?/i,
  search: /^(find|search|look\s+for)\s+/i,
};

// Priority keywords
const priorityPatterns = {
  HIGH: /\b(high|urgent|asap|critical|important|priority)\b/i,
  MEDIUM: /\b(medium|normal|regular)\b/i,
  LOW: /\b(low|minor|soon|later)\b/i,
};

// Status keywords
const statusPatterns = {
  DONE: /\b(done|completed|finished|closed)\b/i,
  "IN_PROGRESS": /\b(in\s+progress|doing|working|in\s+work|started)\b/i,
  TODO: /\b(todo|to\s+do|pending|not\s+started|upcoming)\b/i,
};

// Time expressions
const timeExpressions = /(today|tomorrow|next\s+week|next\s+monday|in\s+\d+\s+(days?|weeks?)|by\s+\d{1,2}\/\d{1,2}|@\s*\d{1,2}\/\d{1,2})/i;

/**
 * Parse natural language command
 */
export function parseCommand(input: string): ParsedCommand {
  const trimmedInput = input.trim();
  let action: ParsedCommand["action"] = "unknown";
  let confidence = 0;

  // Determine action
  for (const [act, pattern] of Object.entries(actionPatterns)) {
    if (pattern.test(trimmedInput)) {
      action = act as ParsedCommand["action"];
      confidence = 0.9;
      break;
    }
  }

  // If still unknown, try to infer from context
  if (action === "unknown") {
    if (trimmedInput.includes("?")) {
      action = "list";
      confidence = 0.5;
    }
  }

  const result: ParsedCommand = {
    action,
    confidence,
    originalInput: trimmedInput,
  };

  // Extract parameters based on action
  switch (action) {
    case "create":
      extractCreateParams(trimmedInput, result);
      break;
    case "complete":
    case "delete":
    case "search":
      extractTaskReference(trimmedInput, result);
      break;
    case "update":
      extractUpdateParams(trimmedInput, result);
      break;
    case "list":
      extractListParams(trimmedInput, result);
      break;
  }

  // Extract common parameters
  extractPriority(trimmedInput, result);
  extractDueDate(trimmedInput, result);
  extractStatus(trimmedInput, result);

  return result;
}

/**
 * Extract parameters for create action
 */
function extractCreateParams(input: string, result: ParsedCommand) {
  // Remove action prefix
  let content = input.replace(/^(create|add|new|make)\s+(task|item)?/i, "").trim();

  // Check for pipe-separated description
  const pipeSplit = content.split(/\|/);
  if (pipeSplit.length > 1) {
    result.taskTitle = pipeSplit[0].trim();
    result.description = pipeSplit
      .slice(1)
      .join("|")
      .replace(/^(description|desc|with|details?):\s*/i, "")
      .trim();
  } else {
    // Try to extract description with keywords
    const descMatch = content.match(
      /(?:description|desc|with|details?):\s*(.+?)(?:\s+priority:|$)/i
    );
    if (descMatch) {
      result.description = descMatch[1].trim();
      result.taskTitle = content.replace(descMatch[0], "").trim();
    } else {
      result.taskTitle = content;
    }
  }

  if (!result.taskTitle) {
    result.confidence = 0.3;
  } else {
    result.confidence = Math.min(0.95, result.confidence + 0.05);
  }
}

/**
 * Extract task reference (for delete, complete, search)
 */
function extractTaskReference(input: string, result: ParsedCommand) {
  let content = input;

  // Remove action prefix
  if (result.action === "complete") {
    content = input.replace(/^(complete|finish|done|mark.*?done|check|close)\s+/i, "").trim();
  } else if (result.action === "delete") {
    content = input.replace(/^(delete|remove|trash|discard)\s+(task|item)?\s*/i, "").trim();
  } else if (result.action === "search") {
    content = input.replace(/^(find|search|look\s+for)\s+/i, "").trim();
  }

  // Remove common suffixes
  content = content
    .replace(/\s+(please|pls|thanks|asap|urgently|immediately)$/i, "")
    .trim();

  result.taskTitle = content;

  if (result.taskTitle) {
    result.confidence = 0.85;
  }
}

/**
 * Extract parameters for update action
 */
function extractUpdateParams(input: string, result: ParsedCommand) {
  // Extract task reference
  const titleMatch = input.match(
    /^update\s+(task\s+)?["\']?([^"\']+?)["\']?\s+(?:to|with|set|as|priority|status|due|description)/i
  );
  if (titleMatch) {
    result.taskTitle = titleMatch[2].trim();
  }

  // Extract what to update
  const toMatch = input.match(/(?:to|as|:)\s*(.+?)(?:\s+priority|\s+status|\s+due|$)/i);
  if (toMatch) {
    // Could be new title, description, or status
    const newValue = toMatch[1].trim();
    if (statusPatterns.DONE.test(newValue) || statusPatterns["IN_PROGRESS"].test(newValue) || statusPatterns.TODO.test(newValue)) {
      extractStatus(newValue, result);
    } else {
      result.description = newValue;
    }
  }

  result.confidence = result.taskTitle ? 0.8 : 0.5;
}

/**
 * Extract parameters for list action
 */
function extractListParams(input: string, result: ParsedCommand) {
  // Could filter by status, priority, etc.
  if (/pending|todo/i.test(input)) result.status = "TODO";
  if (/in\s+progress|doing/i.test(input)) result.status = "IN_PROGRESS";
  if (/done|completed|finished/i.test(input)) result.status = "DONE";

  result.confidence = 0.8;
}

/**
 * Extract priority from input
 */
function extractPriority(input: string, result: ParsedCommand) {
  for (const [priority, pattern] of Object.entries(priorityPatterns)) {
    if (pattern.test(input)) {
      result.priority = priority as "HIGH" | "MEDIUM" | "LOW";
      return;
    }
  }
}

/**
 * Extract due date from input
 */
function extractDueDate(input: string, result: ParsedCommand) {
  const match = input.match(timeExpressions);
  if (match) {
    result.dueDate = match[0];
  }
}

/**
 * Extract status from input
 */
function extractStatus(input: string, result: ParsedCommand) {
  for (const [status, pattern] of Object.entries(statusPatterns)) {
    if (pattern.test(input)) {
      result.status = status as "TODO" | "IN_PROGRESS" | "DONE";
      return;
    }
  }
}

/**
 * Find best matching task by title (fuzzy matching)
 */
export function findBestMatchingTask(
  query: string,
  tasks: Task[]
): Task | undefined {
  if (!query || tasks.length === 0) return undefined;

  const queryLower = query.toLowerCase();

  // Exact match
  let found = tasks.find((t) => t.title.toLowerCase() === queryLower);
  if (found) return found;

  // Case-insensitive starts with
  found = tasks.find((t) => t.title.toLowerCase().startsWith(queryLower));
  if (found) return found;

  // Case-insensitive contains
  found = tasks.find((t) => t.title.toLowerCase().includes(queryLower));
  if (found) return found;

  // Fuzzy match (simple Levenshtein-like)
  let best: { task: Task; score: number } | null = null;
  for (const task of tasks) {
    const score = calculateSimilarity(queryLower, task.title.toLowerCase());
    if (!best || score > best.score) {
      best = { task, score };
    }
  }

  if (best && best.score > 0.6) {
    return best.task;
  }

  return undefined;
}

/**
 * Calculate string similarity (simple implementation)
 */
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;

  const aWords = a.split(/\s+/);
  const bWords = b.split(/\s+/);

  let matches = 0;
  for (const aWord of aWords) {
    if (bWords.some((bWord) => bWord.includes(aWord) || aWord.includes(bWord))) {
      matches++;
    }
  }

  return matches / Math.max(aWords.length, bWords.length);
}

/**
 * Generate helpful suggestions based on parsed command
 */
export function generateSuggestions(
  command: ParsedCommand
): string[] {
  const suggestions: string[] = [];

  if (command.action === "unknown") {
    suggestions.push("Try: 'create task [title]'");
    suggestions.push("Or: 'complete task [title]'");
    suggestions.push("Or: 'delete task [title]'");
  } else if (command.confidence < 0.7) {
    if (!command.taskTitle && ["complete", "delete", "search"].includes(command.action)) {
      suggestions.push(`Please specify the task title to ${command.action}`);
    }
    if (!command.description && command.action === "create") {
      suggestions.push("Tip: Add a description with | or 'description: ...'");
    }
  }

  return suggestions;
}

/**
 * Format parsed command for display
 */
export function formatCommandSummary(command: ParsedCommand): string {
  const parts: string[] = [];

  switch (command.action) {
    case "create":
      parts.push(`Create task: "${command.taskTitle}"`);
      if (command.description) parts.push(`Description: ${command.description}`);
      if (command.priority) parts.push(`Priority: ${command.priority}`);
      if (command.dueDate) parts.push(`Due: ${command.dueDate}`);
      break;
    case "complete":
      parts.push(`Mark as complete: "${command.taskTitle}"`);
      break;
    case "delete":
      parts.push(`Delete task: "${command.taskTitle}"`);
      break;
    case "update":
      parts.push(`Update task: "${command.taskTitle}"`);
      if (command.description) parts.push(`New value: ${command.description}`);
      break;
    case "search":
      parts.push(`Search for: "${command.taskTitle}"`);
      break;
    case "list":
      parts.push("Listing tasks");
      if (command.status) parts.push(`Status: ${command.status}`);
      if (command.priority) parts.push(`Priority: ${command.priority}`);
      break;
  }

  return parts.length > 0 ? parts.join(" | ") : "Unknown command";
}
