import { useAppStore } from "@/store/appStore";
import { useAuth } from "@hooks/useAuth";
import { authService } from "@services/authService";
import { useNavigate } from "react-router-dom";
import { Button } from "@components/ui/Button";
import { Menu, Moon, Sun, LogOut, MessageSquare } from "lucide-react";
import AssistantDialog from "@/components/dialogs/AssistantDialog";
import { useEffect, useState } from "react";
import teamService from "@services/teamService";

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    darkMode,
    setDarkMode,
    sidebarOpen,
    setSidebarOpen,
    assistantOpen,
    setAssistantOpen,
  } = useAppStore();
  const [teamName, setTeamName] = useState<string>();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await teamService.getTeamInfo();
        console.log("getTeamInfo response:", data?.name);
        if (data && data?.name) {
          setTeamName(data?.name);
        }
      } catch (e) {
        console.error("Error fetching team info:", e);
        // fallback to default
      }
    };
    fetchTeam();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-b-4 border-blue-700 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white hover:bg-white/20"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className=" text-sm md:text-2xl font-bold text-white drop-shadow-lg">
            {teamName}
          </h1>
        </div>

        <div className="flex md:items-center md:gap-6">
          <div className="md:text-sm text-white/90">
            <span className="font-semibold">{user?.name}</span>
            <span className="mx-2 ">•</span>
            <span className="inline-block px-2 py-1 md:px-3 md:py-1 rounded-full bg-white/20 text-white/95 text-xs font-medium capitalize">
              {user?.role}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="text-white hover:bg-white/20"
            title="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAssistantOpen(!assistantOpen)}
            className="text-white hover:bg-white/20"
            title="Open assistant"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
            className="text-white hover:bg-red-500/50"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <AssistantDialog />
    </header>
  );
}
