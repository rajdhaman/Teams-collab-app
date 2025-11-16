/**
 * NLP Assistant Unit Tests
 *
 * This file contains tests for the Natural Language Processing module.
 * Place in: tests/unit/nlpAssistant.test.ts
 * Run with: npm test -- nlpAssistant.test.ts
 */

import {
  parseCommand,
  findBestMatchingTask,
  generateSuggestions,
  formatCommandSummary,
} from "../src/utils/nlpAssistant";
import { Task } from "../src/services/taskService";

describe("NLP Assistant", () => {
  // Sample tasks for testing
  const mockTasks: Task[] = [
    {
      _id: "1",
      title: "Write report",
      description: "Monthly status report",
      projectId: "proj1",
      status: "TODO",
      priority: "HIGH",
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "2",
      title: "Fix navigation bug",
      description: "Navigation menu not responsive",
      projectId: "proj1",
      status: "IN_PROGRESS",
      priority: "HIGH",
      position: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "3",
      title: "Design database schema",
      projectId: "proj1",
      status: "TODO",
      priority: "MEDIUM",
      position: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  describe("parseCommand", () => {
    describe("Create action", () => {
      it("should parse simple create command", () => {
        const result = parseCommand("create task Write report");
        expect(result.action).toBe("create");
        expect(result.taskTitle).toBe("Write report");
        expect(result.confidence).toBeGreaterThan(0.8);
      });

      it("should parse create with description using pipe", () => {
        const result = parseCommand(
          "create task Write report | description: monthly status"
        );
        expect(result.action).toBe("create");
        expect(result.taskTitle).toBe("Write report");
        expect(result.description).toBe("monthly status");
      });

      it("should recognize priority keywords", () => {
        const result = parseCommand("create urgent task Fix bug");
        expect(result.priority).toBe("HIGH");

        const mediumResult = parseCommand("create normal task Review code");
        expect(mediumResult.priority).toBe("MEDIUM");

        const lowResult = parseCommand("create low priority task Fix typo");
        expect(lowResult.priority).toBe("LOW");
      });

      it("should recognize date expressions", () => {
        const result = parseCommand("create task Write report | due: tomorrow");
        expect(result.dueDate).toBe("tomorrow");

        const nextWeek = parseCommand(
          "create task Plan sprint | due: next week"
        );
        expect(nextWeek.dueDate).toBe("next week");
      });

      it("should handle variations of create", () => {
        expect(parseCommand("add task Test").action).toBe("create");
        expect(parseCommand("new task Test").action).toBe("create");
        expect(parseCommand("make task Test").action).toBe("create");
      });
    });

    describe("Complete action", () => {
      it("should parse complete command", () => {
        const result = parseCommand("complete task Write report");
        expect(result.action).toBe("complete");
        expect(result.taskTitle).toBe("Write report");
      });

      it("should handle variations of complete", () => {
        expect(parseCommand("finish task Test").action).toBe("complete");
        expect(parseCommand("done with Test").action).toBe("complete");
        expect(parseCommand("mark Test as done").action).toBe("complete");
        expect(parseCommand("close task Test").action).toBe("complete");
      });

      it("should strip common suffixes", () => {
        const result = parseCommand("complete task Write report please");
        expect(result.taskTitle).toBe("Write report");
      });
    });

    describe("Delete action", () => {
      it("should parse delete command", () => {
        const result = parseCommand("delete task Old task");
        expect(result.action).toBe("delete");
        expect(result.taskTitle).toBe("Old task");
      });

      it("should handle variations of delete", () => {
        expect(parseCommand("remove task Test").action).toBe("delete");
        expect(parseCommand("trash task Test").action).toBe("delete");
        expect(parseCommand("discard task Test").action).toBe("delete");
      });
    });

    describe("Search action", () => {
      it("should parse search command", () => {
        const result = parseCommand("find Write report");
        expect(result.action).toBe("search");
        expect(result.taskTitle).toBe("Write report");
      });

      it("should handle variations of search", () => {
        expect(parseCommand("search bug").action).toBe("search");
        expect(parseCommand("look for Test").action).toBe("search");
      });
    });

    describe("List action", () => {
      it("should parse list command", () => {
        const result = parseCommand("list tasks");
        expect(result.action).toBe("list");
      });

      it("should filter by status", () => {
        const result = parseCommand("list pending tasks");
        expect(result.action).toBe("list");
        expect(result.status).toBe("TODO");

        const inProgress = parseCommand("list in progress tasks");
        expect(inProgress.status).toBe("IN_PROGRESS");

        const done = parseCommand("list completed tasks");
        expect(done.status).toBe("DONE");
      });

      it("should filter by priority", () => {
        const result = parseCommand("list high priority tasks");
        expect(result.priority).toBe("HIGH");
      });
    });

    describe("Update action", () => {
      it("should parse update command", () => {
        const result = parseCommand("update Write report to high priority");
        expect(result.action).toBe("update");
      });
    });
  });

  describe("findBestMatchingTask", () => {
    it("should find exact match", () => {
      const result = findBestMatchingTask("Write report", mockTasks);
      expect(result?._id).toBe("1");
    });

    it("should find case-insensitive match", () => {
      const result = findBestMatchingTask("WRITE REPORT", mockTasks);
      expect(result?._id).toBe("1");
    });

    it("should find partial match", () => {
      const result = findBestMatchingTask("Write", mockTasks);
      expect(result?._id).toBe("1");
    });

    it("should return undefined for no match", () => {
      const result = findBestMatchingTask("Nonexistent", mockTasks);
      expect(result).toBeUndefined();
    });

    it("should handle empty array", () => {
      const result = findBestMatchingTask("test", []);
      expect(result).toBeUndefined();
    });
  });

  describe("formatCommandSummary", () => {
    it("should format create summary", () => {
      const cmd = parseCommand("create task Write report | high priority");
      const summary = formatCommandSummary(cmd);
      expect(summary).toContain("Create task");
    });

    it("should format complete summary", () => {
      const cmd = parseCommand("complete task Write report");
      const summary = formatCommandSummary(cmd);
      expect(summary).toContain("complete");
    });
  });

  describe("generateSuggestions", () => {
    it("should suggest for unknown command", () => {
      const cmd = parseCommand("random text");
      const suggestions = generateSuggestions(cmd);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });
});
