import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import {
  settingsService,
  UserSettings,
  TeamSettings,
} from "@services/settingsService";
import { Sidebar } from "@components/layout/Sidebar";
import { Header } from "@components/layout/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Label } from "@components/ui/Label";
import { Textarea } from "@components/ui/Textarea";
import { Badge } from "@components/ui/Badge";
import { Switch } from "@components/ui/Switch";
import {
  User,
  Settings,
  Bell,
  LogOut,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "notifications" | "team"
  >("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // User settings
  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: user?.name || "",
    email: user?.email || "",
    notifications: {
      emailNotifications: true,
      taskAssignmentNotifications: true,
    },
  });

  // Team settings
  const [teamSettings, setTeamSettings] = useState<TeamSettings>({
    name: "",
    description: "",
  });

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // If auth finished loading and no user, redirect to login
    if (!user) {
      navigate("/login");
      return;
    }

    // User is authenticated, load settings
    loadSettings();
  }, [user, authLoading, navigate]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user settings
      const userRes = await settingsService.getUserSettings();
      if (userRes.success) {
        setUserSettings(userRes.data);
      }

      // Load team settings
      const teamRes = await settingsService.getTeamSettings();
      if (teamRes.success) {
        setTeamSettings(teamRes.data);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load settings";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUserSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await settingsService.updateUserSettings(userSettings);
      if (response.success) {
        setSuccess("Profile settings saved successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save settings";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTeamSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await settingsService.updateTeamSettings(teamSettings);
      if (response.success) {
        setSuccess("Team settings saved successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save settings";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotification = (
    key: keyof NonNullable<UserSettings["notifications"]>
  ) => {
    setUserSettings((prev) => ({
      ...prev,
      notifications: {
        emailNotifications: prev.notifications?.emailNotifications ?? true,
        taskAssignmentNotifications:
          prev.notifications?.taskAssignmentNotifications ?? true,
        [key]: !(prev.notifications?.[key] ?? false),
      } as NonNullable<UserSettings["notifications"]>,
    }));
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Settings
                </h1>
              </div>
              <p className="text-muted-foreground mt-2">
                Manage your profile, preferences, and team settings
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-l-4 border-red-500 shadow-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 rounded-lg bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-l-4 border-green-500 shadow-md flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-white dark:bg-slate-800 p-1 rounded-lg shadow-md w-fit">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-3 rounded-md font-semibold transition-all flex items-center gap-2 ${
                  activeTab === "profile"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`px-6 py-3 rounded-md font-semibold transition-all flex items-center gap-2 ${
                  activeTab === "notifications"
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bell className="h-4 w-4" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab("team")}
                className={`px-6 py-3 rounded-md font-semibold transition-all flex items-center gap-2 ${
                  activeTab === "team"
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Settings className="h-4 w-4" />
                Team
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-900/30 rounded-xl shadow-lg border border-blue-100 dark:border-blue-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span className="bg-white/20 p-2 rounded-lg">
                        <User className="h-6 w-6" />
                      </span>
                      Profile Information
                    </h2>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={userSettings.name}
                        onChange={(e) =>
                          setUserSettings({
                            ...userSettings,
                            name: e.target.value,
                          })
                        }
                        placeholder="Your name"
                        className="rounded-lg border-2 border-blue-100 dark:border-blue-800 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={userSettings.email}
                        disabled
                        placeholder="Your email"
                        className="rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                        Role
                      </Label>
                      <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 font-semibold text-sm">
                        {user?.role}
                      </Badge>
                    </div>

                    <Button
                      onClick={handleSaveUserSettings}
                      disabled={saving}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-red-50 dark:from-slate-800 dark:to-red-900/30 rounded-xl shadow-lg border border-red-100 dark:border-red-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span className="bg-white/20 p-2 rounded-lg">
                        <LogOut className="h-6 w-6" />
                      </span>
                      Account Actions
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Manage your account settings and dangerous actions
                    </p>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 border-red-300 dark:border-red-700 font-semibold py-3 rounded-lg transition-all"
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete your account? This action cannot be undone."
                          )
                        ) {
                          // TODO: implement account deletion
                          alert("Account deletion not yet implemented");
                        }
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-purple-900/30 rounded-xl shadow-lg border border-purple-100 dark:border-purple-800 overflow-hidden max-w-2xl">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-8">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="bg-white/20 p-2 rounded-lg">
                      <Bell className="h-6 w-6" />
                    </span>
                    Notification Preferences
                  </h2>
                  <p className="text-purple-100 mt-2 text-sm">
                    Choose how you want to be notified about activities
                  </p>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between p-5 border-2 border-purple-100 dark:border-purple-800 rounded-lg bg-gradient-to-r from-white to-purple-50 dark:from-slate-750 dark:to-purple-900/20 hover:shadow-md transition-all">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        Email Notifications
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Receive email updates about team activity
                      </p>
                    </div>
                    <Switch
                      checked={
                        userSettings.notifications?.emailNotifications || false
                      }
                      onCheckedChange={() =>
                        handleToggleNotification("emailNotifications")
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-5 border-2 border-purple-100 dark:border-purple-800 rounded-lg bg-gradient-to-r from-white to-purple-50 dark:from-slate-750 dark:to-purple-900/20 hover:shadow-md transition-all">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        Task Assignments
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get notified when a task is assigned to you
                      </p>
                    </div>
                    <Switch
                      checked={
                        userSettings.notifications
                          ?.taskAssignmentNotifications || false
                      }
                      onCheckedChange={() =>
                        handleToggleNotification("taskAssignmentNotifications")
                      }
                    />
                  </div>

                  <Button
                    onClick={handleSaveUserSettings}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 mt-4"
                  >
                    {saving ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === "team" && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Settings</CardTitle>
                  <CardDescription>
                    Configure team information and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="teamName">Team Name</Label>
                    <Input
                      id="teamName"
                      value={teamSettings.name}
                      onChange={(e) =>
                        setTeamSettings({
                          ...teamSettings,
                          name: e.target.value,
                        })
                      }
                      placeholder="Your team name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="teamDesc">Team Description</Label>
                    <Textarea
                      id="teamDesc"
                      value={teamSettings.description || ""}
                      onChange={(e) =>
                        setTeamSettings({
                          ...teamSettings,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your team"
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleSaveTeamSettings}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? "Saving..." : "Save Team Settings"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
