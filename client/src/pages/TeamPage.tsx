import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import teamService from "@services/teamService";
import { Sidebar } from "@components/layout/Sidebar";
import { Header } from "@components/layout/Header";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@components/ui/Card";
import { Users, Mail, Shield, Clock, Trash2, Edit2 } from "lucide-react";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
  joinedAt?: string;
}

interface TeamInfo {
  _id: string;
  name: string;
  description?: string;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TeamPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<
    "ADMIN" | "MANAGER" | "MEMBER"
  >("MEMBER");

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) return;

    // If auth finished loading and no user, redirect to login
    if (!user) {
      navigate("/login");
      return;
    }

    // User is authenticated, load team data
    loadTeamData();
  }, [user, authLoading, navigate]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch team info (service returns normalized data object)
      const teamData = await teamService.getTeamInfo();
      if (teamData) {
        setTeam(teamData as TeamInfo);
      }

      // Fetch team members (service returns array of members)
      const membersData = await teamService.getMembers();
      if (Array.isArray(membersData)) {
        setMembers(membersData as TeamMember[]);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load team data";
      setError(message);
      console.error("Team page error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "MANAGER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "MEMBER":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleUpdateRole = async (
    memberId: string,
    newRole: "ADMIN" | "MANAGER" | "MEMBER",
  ) => {
    setActionLoading(memberId);
    try {
      const response = await teamService.updateMemberRole(memberId, newRole);
      if (response.success) {
        // Update local state
        setMembers(
          members.map((m) =>
            m._id === memberId ? { ...m, role: newRole } : m,
          ),
        );
        setEditingMemberId(null);
      }
    } catch (err) {
      console.error("Failed to update member role:", err);
      alert("Failed to update member role");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member from the team?"))
      return;

    setActionLoading(memberId);
    try {
      const response = await teamService.removeMember(memberId);
      if (response.success) {
        setMembers(members.filter((m) => m._id !== memberId));
        if (team) {
          setTeam({ ...team, memberCount: team.memberCount - 1 });
        }
      }
    } catch (err) {
      console.error("Failed to remove member:", err);
      alert("Failed to remove member");
    } finally {
      setActionLoading(null);
    }
  };

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
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Team Overview
                </h1>
              </div>
              <p className="text-muted-foreground mt-2 ml-0">
                Manage your team members and view team information
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-l-4 border-red-500 shadow-md">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Team Info Section */}
                <div className="lg:col-span-1">
                  <Card className="p-0">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg p-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle>Team Information</CardTitle>
                      </div>
                      <CardDescription className="text-blue-100 my-1 p-0">
                        Overview and basic team stats
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {team && (
                        <>
                          <div className="pb-4 border-b border-border">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Team Name
                            </p>
                            <p className="text-2xl font-bold text-foreground mt-1">
                              {team.name}
                            </p>
                          </div>

                          <div className="pb-4 border-b border-border">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Total Members
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-3">
                                <Users className="h-6 w-6 text-white" />
                              </div>
                              <p className="text-3xl font-bold text-foreground">
                                {team.memberCount}
                              </p>
                            </div>
                          </div>

                          <div className="pb-4 border-b border-border">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Created
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              {formatDate(team.createdAt)}
                            </p>
                          </div>

                          <div className="pb-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Status
                            </p>
                            <Badge
                              variant="outline"
                              className={
                                team.isActive
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 text-sm font-semibold"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 text-sm font-semibold"
                              }
                            >
                              {team.isActive ? "🟢 Active" : "🔴 Inactive"}
                            </Badge>
                          </div>

                          {team.description && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Description
                              </p>
                              <p className="text-sm text-muted-foreground italic">
                                "{team.description}"
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Team Members Section */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg p-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle>Team Members</CardTitle>
                      </div>
                      <CardDescription className="text-purple-100 mt-1 text-sm">
                        {members.length} member{members.length !== 1 ? "s" : ""}{" "}
                        in this team
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {members.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                          </div>
                          <p className="text-muted-foreground text-lg">
                            No team members found
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {members.map((member) => (
                            <div
                              key={member._id}
                              className="p-4 md:p-5 rounded-xl border-2 border-border bg-background hover:shadow-md transition-all duration-200"
                            >
                              {/* Top Section - Avatar and Name */}
                              <div className="flex items-start justify-between gap-3 mb-3 md:mb-0">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {/* Avatar */}
                                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0">
                                    <span className="text-xs font-bold text-white">
                                      {member.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                    </span>
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-foreground text-sm md:text-base truncate">
                                      {member.name}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground truncate">
                                      <Mail className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">
                                        {member.email}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* Mobile - Role Badge */}
                              {editingMemberId !== member._id && (
                                <Badge
                                  variant="outline"
                                  className={`${getRoleBadgeColor(
                                    member.role,
                                  )} px-2 md:px-3 py-1 font-semibold text-xs flex items-center gap-1 flex-shrink-0 md:hidden`}
                                >
                                  <Shield className="h-3 w-3" />
                                  {member.role}
                                </Badge>
                              )}

                              {/* Desktop - Main Controls Row */}
                              <div className="hidden md:flex items-center justify-between gap-3">
                                {editingMemberId === member._id &&
                                user?.role === "ADMIN" ? (
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={selectedRole}
                                      onChange={(e) =>
                                        setSelectedRole(
                                          e.target.value as
                                            | "ADMIN"
                                            | "MANAGER"
                                            | "MEMBER",
                                        )
                                      }
                                      className="text-sm px-2 py-1 rounded border border-input bg-background"
                                      title="Select new role"
                                    >
                                      <option value="ADMIN">Admin</option>
                                      <option value="MANAGER">Manager</option>
                                      <option value="MEMBER">Member</option>
                                    </select>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleUpdateRole(
                                          member._id,
                                          selectedRole,
                                        )
                                      }
                                      disabled={actionLoading === member._id}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingMemberId(null)}
                                      disabled={actionLoading === member._id}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <Badge
                                      variant="outline"
                                      className={`${getRoleBadgeColor(
                                        member.role,
                                      )} px-3 py-1 font-semibold text-xs flex items-center gap-1`}
                                    >
                                      <Shield className="h-3 w-3" />
                                      {member.role}
                                    </Badge>

                                    {/* Joined Date */}
                                    {member.joinedAt && (
                                      <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                                        <Clock className="h-3 w-3" />
                                        {formatDate(member.joinedAt)}
                                      </div>
                                    )}

                                    {/* Admin action buttons */}
                                    {user?.role === "ADMIN" && (
                                      <div className="flex items-center gap-2 ml-auto">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setEditingMemberId(member._id);
                                            setSelectedRole(member.role);
                                          }}
                                          disabled={
                                            actionLoading === member._id
                                          }
                                          title="Edit role"
                                          className="hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 dark:text-red-400"
                                          onClick={() =>
                                            handleRemoveMember(member._id)
                                          }
                                          disabled={
                                            actionLoading === member._id
                                          }
                                          title="Remove member"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Mobile - Controls Row */}
                              <div className="md:hidden mt-3 space-y-2 border-t border-border pt-3">
                                {editingMemberId === member._id &&
                                user?.role === "ADMIN" ? (
                                  <div className="space-y-2">
                                    <select
                                      value={selectedRole}
                                      onChange={(e) =>
                                        setSelectedRole(
                                          e.target.value as
                                            | "ADMIN"
                                            | "MANAGER"
                                            | "MEMBER",
                                        )
                                      }
                                      className="w-full text-sm px-2 py-1 rounded border border-input bg-background"
                                      title="Select new role"
                                    >
                                      <option value="ADMIN">Admin</option>
                                      <option value="MANAGER">Manager</option>
                                      <option value="MEMBER">Member</option>
                                    </select>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() =>
                                          handleUpdateRole(
                                            member._id,
                                            selectedRole,
                                          )
                                        }
                                        disabled={actionLoading === member._id}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setEditingMemberId(null)}
                                        disabled={actionLoading === member._id}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {/* Joined Date */}
                                    {member.joinedAt && (
                                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Joined {formatDate(member.joinedAt)}
                                      </div>
                                    )}

                                    {/* Admin action buttons */}
                                    {user?.role === "ADMIN" && (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1"
                                          onClick={() => {
                                            setEditingMemberId(member._id);
                                            setSelectedRole(member.role);
                                          }}
                                          disabled={
                                            actionLoading === member._id
                                          }
                                          title="Edit role"
                                        >
                                          <Edit2 className="h-4 w-4 mr-1" />
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 dark:text-red-400"
                                          onClick={() =>
                                            handleRemoveMember(member._id)
                                          }
                                          disabled={
                                            actionLoading === member._id
                                          }
                                          title="Remove member"
                                        >
                                          <Trash2 className="h-4 w-4 mr-1" />
                                          Remove
                                        </Button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Role Legend */}
            <div className="mt-10 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-800 dark:to-indigo-900/30 rounded-xl shadow-lg border border-indigo-100 dark:border-indigo-800 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="bg-white/20 p-2 rounded-lg">
                    <Shield className="h-6 w-6" />
                  </span>
                  Role Permissions
                </h3>
                <p className="text-indigo-100 mt-1 text-sm">
                  Understanding team member roles and their permissions
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Admin */}
                  <div className="p-6 rounded-lg border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-red-900 dark:text-red-100 flex items-center gap-2 mb-4 text-lg">
                      <div className="bg-red-500/20 p-2 rounded-lg">
                        <Shield className="h-5 w-5" />
                      </div>
                      Admin
                    </h3>
                    <ul className="text-sm text-red-800 dark:text-red-200 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-red-600 dark:text-red-400 font-bold">
                          ●
                        </span>
                        Full system access
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600 dark:text-red-400 font-bold">
                          ●
                        </span>
                        Manage roles
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600 dark:text-red-400 font-bold">
                          ●
                        </span>
                        Delete projects
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600 dark:text-red-400 font-bold">
                          ●
                        </span>
                        Delete any task
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600 dark:text-red-400 font-bold">
                          ●
                        </span>
                        Manage team members
                      </li>
                    </ul>
                  </div>

                  {/* Manager */}
                  <div className="p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-4 text-lg">
                      <div className="bg-blue-500/20 p-2 rounded-lg">
                        <Shield className="h-5 w-5" />
                      </div>
                      Manager
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          ●
                        </span>
                        Create projects
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          ●
                        </span>
                        Edit projects
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          ●
                        </span>
                        Create tasks
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          ●
                        </span>
                        Assign tasks
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          ●
                        </span>
                        Delete own tasks
                      </li>
                    </ul>
                  </div>

                  {/* Member */}
                  <div className="p-6 rounded-lg border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-green-900 dark:text-green-100 flex items-center gap-2 mb-4 text-lg">
                      <div className="bg-green-500/20 p-2 rounded-lg">
                        <Shield className="h-5 w-5" />
                      </div>
                      Member
                    </h3>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400 font-bold">
                          ●
                        </span>
                        View projects
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400 font-bold">
                          ●
                        </span>
                        Create tasks
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400 font-bold">
                          ●
                        </span>
                        View chat
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400 font-bold">
                          ●
                        </span>
                        Send messages
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400 font-bold">
                          ●
                        </span>
                        Delete own tasks
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
