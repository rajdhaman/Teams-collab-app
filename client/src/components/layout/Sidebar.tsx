import { useAppStore } from "@/store/appStore";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@components/ui/Button";
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  Settings,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: MessageSquare, label: "Chat", href: "/chat" },
  { icon: Users, label: "Team", href: "/team" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    sidebarOpen,
    setSidebarOpen,
    desktopSidebarOpen,
    setDesktopSidebarOpen,
  } = useAppStore();

  const nav = (isMobile = false) => (
    <>
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-between">
        {desktopSidebarOpen && (
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CollabEdge
          </h2>
        )}
        <button
          onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
          className="hidden lg:flex p-1 hover:bg-blue-200 dark:hover:bg-slate-600 rounded transition-colors"
          aria-label="Toggle sidebar"
        >
          {desktopSidebarOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-9">
        {navigationItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            location.pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Button
              key={item.href}
              className={`w-full justify-start gap-4 transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg text-xl"
                  : "bg-transparent text-foreground hover:bg-blue-100 dark:hover:bg-slate-700"
              }`}
              onClick={() => {
                navigate(item.href);
                setSidebarOpen(false);
              }}
              title={!desktopSidebarOpen ? item.label : undefined}
            >
              <Icon className="h-6 w-6 flex-shrink-0" />
              {(isMobile || desktopSidebarOpen) && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      <div className="border-t p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
        {(isMobile || desktopSidebarOpen) && (
          <p className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            © 2024 Kriscent Teams
          </p>
        )}
      </div>
    </>
  );

  // Desktop sidebar (always visible on lg+)
  const desktopSidebar = (
    <aside
      className={`border-r bg-white dark:bg-slate-900 hidden lg:flex flex-col shadow-xl transition-all duration-300 ${
        desktopSidebarOpen ? "w-64" : "w-24"
      }`}
    >
      {nav(false)}
    </aside>
  );

  // Mobile drawer
  const mobileDrawer = sidebarOpen ? (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setSidebarOpen(false)}
      />

      <aside className="relative w-64 h-full bg-white dark:bg-slate-900 border-r shadow-2xl">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-slate-800">
            Menu
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="hover:bg-blue-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {nav(true)}
      </aside>
    </div>
  ) : null;

  return (
    <>
      {desktopSidebar}
      {mobileDrawer}
    </>
  );
}
