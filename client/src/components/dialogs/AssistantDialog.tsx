import { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@components/ui/Button";
import { useAppStore } from "@/store/appStore";
import { taskService } from "@services/taskService";
import { Send } from "lucide-react";
import {
  parseCommand,
  findBestMatchingTask,
  generateSuggestions,
  formatCommandSummary,
} from "@/utils/nlpAssistant";

export default function AssistantDialog() {
  const {
    assistantOpen,
    setAssistantOpen,
    tasks,
    setTasks,
    selectedProjectId,
  } = useAppStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  if (!assistantOpen) return null;

  const append = (text: string) => setMessages((m) => [...m, text]);

  const handleRun = async () => {
    const cmd = input.trim();
    if (!cmd) return;

    setLoading(true);
    append(`You: ${cmd}`);

    try {
      // Parse the command using NLP
      const parsed = parseCommand(cmd);

      // Show what we understood
      if (parsed.confidence < 0.7) {
        append(`⚠️ Assistant: I parsed: ${formatCommandSummary(parsed)}`);
      }

      // Execute based on parsed action
      switch (parsed.action) {
        case "create":
          await handleCreateTask(parsed);
          break;
        case "complete":
          await handleCompleteTask(parsed);
          break;
        case "delete":
          await handleDeleteTask(parsed);
          break;
        case "update":
          await handleUpdateTask(parsed);
          break;
        case "search":
          await handleSearchTask(parsed);
          break;
        case "list":
          await handleListTasks(parsed);
          break;
        default:
          showSuggestions(parsed);
      }
    } catch (err: any) {
      console.error(err);
      append(`❌ Assistant: Error - ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const showSuggestions = (parsed: any) => {
    const suggestions = generateSuggestions(parsed);
    if (suggestions.length > 0) {
      append(`Assistant: ${suggestions.join("\n")}`);
    } else {
      append(
        `Assistant: I can help with:\n• "create task [title]" - Add a new task\n• "complete task [title]" - Mark as done\n• "delete task [title]" - Remove a task\n• "list tasks" - Show all tasks\n• "search [keywords]" - Find a task`
      );
    }
  };

  const handleCreateTask = async (parsed: any) => {
    if (!parsed.taskTitle) {
      append("Assistant: Please provide a task title.");
      return;
    }

    const payload: any = {
      title: parsed.taskTitle,
      projectId: selectedProjectId || "",
    };
    if (parsed.description) payload.description = parsed.description;
    if (parsed.priority) payload.priority = parsed.priority;
    if (parsed.dueDate) payload.dueDate = parsed.dueDate;

    try {
      const res = await taskService.create(payload);
      if (res.success) {
        append(
          `✅ Assistant: Created task "${res.data.title}"${
            parsed.priority ? ` [${parsed.priority}]` : ""
          }${parsed.dueDate ? ` due ${parsed.dueDate}` : ""}`
        );
        if (setTasks) setTasks([...(tasks || []), res.data]);
      } else {
        append("❌ Assistant: Failed to create task");
      }
    } catch (err: any) {
      append(`❌ Assistant: Error creating task - ${err?.message}`);
    }
  };

  const handleCompleteTask = async (parsed: any) => {
    if (!parsed.taskTitle) {
      append("Assistant: Please specify which task to complete.");
      return;
    }

    const found = findBestMatchingTask(parsed.taskTitle, tasks || []);
    if (!found) {
      append(
        `Assistant: Could not find task "${parsed.taskTitle}". Did you mean: ${(
          tasks || []
        )
          .slice(0, 3)
          .map((t) => `"${t.title}"`)
          .join(", ")}?`
      );
      return;
    }

    try {
      const res = await taskService.update(found._id, { status: "DONE" });
      if (res.success) {
        append(`✅ Assistant: Marked "${found.title}" as completed`);
        if (setTasks)
          setTasks(
            (tasks || []).map((t: any) => (t._id === found._id ? res.data : t))
          );
      } else {
        append("❌ Assistant: Failed to update task");
      }
    } catch (err: any) {
      append(`❌ Assistant: Error updating task - ${err?.message}`);
    }
  };

  const handleDeleteTask = async (parsed: any) => {
    if (!parsed.taskTitle) {
      append("Assistant: Please specify which task to delete.");
      return;
    }

    const found = findBestMatchingTask(parsed.taskTitle, tasks || []);
    if (!found) {
      append(
        `Assistant: Could not find task "${parsed.taskTitle}". Available: ${(
          tasks || []
        )
          .slice(0, 3)
          .map((t) => `"${t.title}"`)
          .join(", ")}`
      );
      return;
    }

    try {
      const res = await taskService.delete(found._id);
      if (res.success) {
        append(`✅ Assistant: Deleted task "${found.title}"`);
        if (setTasks)
          setTasks((tasks || []).filter((t: any) => t._id !== found._id));
      } else {
        append("❌ Assistant: Failed to delete task");
      }
    } catch (err: any) {
      append(`❌ Assistant: Error deleting task - ${err?.message}`);
    }
  };

  const handleUpdateTask = async (parsed: any) => {
    if (!parsed.taskTitle) {
      append("Assistant: Please specify which task to update.");
      return;
    }

    const found = findBestMatchingTask(parsed.taskTitle, tasks || []);
    if (!found) {
      append(
        `Assistant: Could not find task "${parsed.taskTitle}". Did you mean: ${(
          tasks || []
        )
          .slice(0, 3)
          .map((t) => `"${t.title}"`)
          .join(", ")}?`
      );
      return;
    }

    const updates: any = {};
    if (parsed.description) updates.description = parsed.description;
    if (parsed.status) updates.status = parsed.status;
    if (parsed.priority) updates.priority = parsed.priority;
    if (parsed.dueDate) updates.dueDate = parsed.dueDate;

    if (Object.keys(updates).length === 0) {
      append("Assistant: No updates specified. What would you like to change?");
      return;
    }

    try {
      const res = await taskService.update(found._id, updates);
      if (res.success) {
        append(`✅ Assistant: Updated "${found.title}"`);
        if (setTasks)
          setTasks(
            (tasks || []).map((t: any) => (t._id === found._id ? res.data : t))
          );
      } else {
        append("❌ Assistant: Failed to update task");
      }
    } catch (err: any) {
      append(`❌ Assistant: Error updating task - ${err?.message}`);
    }
  };

  const handleSearchTask = async (parsed: any) => {
    if (!parsed.taskTitle) {
      append("Assistant: What task are you looking for?");
      return;
    }

    const found = findBestMatchingTask(parsed.taskTitle, tasks || []);
    if (found) {
      append(
        `✅ Assistant: Found "${found.title}" - Status: ${found.status} | Priority: ${found.priority}`
      );
    } else {
      const allTitles = (tasks || []).map((t) => `"${t.title}"`).join(", ");
      append(
        `Assistant: No matching task found. Available: ${
          allTitles || "No tasks yet"
        }`
      );
    }
  };

  const handleListTasks = async (parsed: any) => {
    const filtered = (tasks || []).filter((t: any) => {
      if (parsed.status && t.status !== parsed.status) return false;
      if (parsed.priority && t.priority !== parsed.priority) return false;
      return true;
    });

    if (filtered.length === 0) {
      append("Assistant: No tasks found matching your criteria.");
    } else {
      const list = filtered
        .map((t: any) => `• ${t.title} [${t.status}] {${t.priority}}`)
        .join("\n");
      append(`✅ Assistant: Found ${filtered.length} task(s):\n${list}`);
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setAssistantOpen(false)}
      />
      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>Assistant</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <textarea
            rows={4}
            className="w-full p-3 rounded border border-input bg-background resize-none"
            placeholder='Try: "create task Write report | description: monthly status" or "complete task Write report" or "list high priority tasks"'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleRun();
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-1">
            💡 Tip: Use Ctrl+Enter to send
          </div>
        </div>

        <div className="mt-3 space-y-2 max-h-64 overflow-auto bg-muted/30 rounded p-3 text-sm">
          {messages.length === 0 ? (
            <div className="text-muted-foreground italic">
              Ask me to manage your tasks naturally...
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`whitespace-pre-wrap ${
                  m.startsWith("You:")
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                } ${m.includes("❌") ? "text-destructive" : ""} ${
                  m.includes("✅") ? "text-green-600 dark:text-green-400" : ""
                }`}
              >
                {m}
              </div>
            ))
          )}
        </div>

        <DialogFooter className="mt-4">
          <div className="flex items-center gap-2 w-full">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAssistantOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleRun}
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                "Running..."
              ) : (
                <>
                  <Send className="mr-2" /> Run
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </div>
  );
}
