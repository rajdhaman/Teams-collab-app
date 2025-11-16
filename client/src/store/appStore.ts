import { create } from "zustand";
import { User } from "@services/authService";
import { Project } from "@services/projectService";
import { Task } from "@services/taskService";

interface AppStore {
  user: User | null;
  setUser: (user: User | null) => void;

  projects: Project[];
  setProjects: (projects: Project[]) => void;

  tasks: Task[];
  setTasks: (tasks: Task[]) => void;

  selectedProjectId: string | null;
  setSelectedProjectId: (projectId: string | null) => void;

  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  desktopSidebarOpen: boolean;
  setDesktopSidebarOpen: (open: boolean) => void;
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  projects: [],
  setProjects: (projects) => set({ projects }),

  tasks: [],
  setTasks: (tasks) => set({ tasks }),

  selectedProjectId: null,
  setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),

  darkMode: localStorage.getItem("darkMode") === "true" || false,
  setDarkMode: (darkMode) => {
    localStorage.setItem("darkMode", String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    set({ darkMode });
  },

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  desktopSidebarOpen: true,
  setDesktopSidebarOpen: (open) => set({ desktopSidebarOpen: open }),
  assistantOpen: false,
  setAssistantOpen: (open) => set({ assistantOpen: open }),
}));
