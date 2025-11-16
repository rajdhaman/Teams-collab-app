import  { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@components/ui/Button";
import { useAppStore } from "@/store/appStore";
import { taskService, Task } from "@services/taskService";
import { Send} from "lucide-react";

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

  const simpleFindTaskByTitle = (title: string): Task | undefined => {
    return (tasks || []).find(
      (t: any) => t.title.toLowerCase() === title.toLowerCase()
    );
  };

  const handleRun = async () => {
    const cmd = input.trim();
    if (!cmd) return;
    setLoading(true);
    append(`You: ${cmd}`);

    try {
      // Simple create command: "create task <title>" or "create task <title> | description: ..."
      const lc = cmd.toLowerCase();

      if (lc.startsWith("create task")) {
        // parse optional description after "|" or "description:"
        let rest = cmd.replace(/create task/i, "").trim();
        let title = rest;
        let description: string | undefined = undefined;
        const parts = rest.split(/\|/);
        if (parts.length > 1) {
          title = parts[0].trim();
          description = parts
            .slice(1)
            .join("|")
            .replace(/description:\s*/i, "")
            .trim();
        }

        if (!title) {
          append("Assistant: Please provide a title for the task.");
        } else {
          const payload: any = { title, projectId: selectedProjectId || "" };
          if (description) payload.description = description;
          const res = await taskService.create(payload);
          if (res.success) {
            append(`Assistant: Created task \"${res.data.title}\"`);
            // update store if possible
            if (setTasks) setTasks([...(tasks || []), res.data]);
          } else {
            append("Assistant: Failed to create task");
          }
        }
      } else if (lc.startsWith("complete task")) {
        const title = cmd.replace(/complete task/i, "").trim();
        if (!title) {
          append("Assistant: Specify the task title to complete.");
        } else {
          const found = simpleFindTaskByTitle(title);
          if (!found) {
            append("Assistant: Could not find a task with that title.");
          } else {
            const res = await taskService.update(found._id, { status: "DONE" });
            if (res.success) {
              append(`Assistant: Marked \"${found.title}\" as completed.`);
              if (setTasks)
                setTasks(
                  (tasks || []).map((t: any) =>
                    t._id === found._id ? res.data : t
                  )
                );
            } else append("Assistant: Failed to update task status.");
          }
        }
      } else if (lc.startsWith("delete task")) {
        const title = cmd.replace(/delete task/i, "").trim();
        if (!title) {
          append("Assistant: Specify the task title to delete.");
        } else {
          const found = simpleFindTaskByTitle(title);
          if (!found) {
            append("Assistant: Could not find a task with that title.");
          } else {
            const res = await taskService.delete(found._id);
            if (res.success) {
              append(`Assistant: Deleted task \"${found.title}\".`);
              if (setTasks)
                setTasks((tasks || []).filter((t: any) => t._id !== found._id));
            } else append("Assistant: Failed to delete task.");
          }
        }
      } else {
        // fallback: echo with simple suggestions
        append(
          "Assistant: I can help with commands like:\n- create task <title> | description: ...\n- complete task <title>\n- delete task <title>"
        );
      }
    } catch (err: any) {
      console.error(err);
      append(`Assistant: Error - ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
      setInput("");
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
            placeholder='Try: "create task Write report | description: monthly status"'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="mt-3 space-y-2 max-h-48 overflow-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className="text-sm whitespace-pre-wrap text-muted-foreground"
            >
              {m}
            </div>
          ))}
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
