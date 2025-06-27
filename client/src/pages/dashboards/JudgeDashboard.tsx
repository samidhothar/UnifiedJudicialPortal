import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Gavel, Calendar, Folder, Clock, CalendarDays, Video, Eye, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { HearingTimeline } from "@/components/HearingTimeline";
import type { Case, Hearing } from "@/types";

export default function JudgeDashboard() {
  const { user, logout } = useAuth();

  const { data: cases, isLoading: casesLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Get all hearings for judge's cases
  const { data: allHearings } = useQuery<Hearing[]>({
    queryKey: ["/api/hearings/judge"],
    queryFn: async () => {
      const response = await fetch("/api/hearings/judge", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch hearings");
      return response.json();
    },
  });

  const todaysCases = cases?.filter(c => 
    c.nextHearing && 
    new Date(c.nextHearing).toDateString() === new Date().toDateString()
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "filed": return "status-filed";
      case "pending": return "status-pending"; 
      case "in-hearing": return "status-in-hearing";
      case "decided": return "status-decided";
      default: return "status-filed";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 judicial-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Gavel className="text-purple-600 h-6 w-6 mr-3" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Judge Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 inline mr-1" />
                Today: {new Date().toLocaleDateString()}
              </div>
              <Button className="judicial-button-purple">
                <Video className="h-4 w-4 mr-2" />
                Join Court Room
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => logout()}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-purple-600"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm mr-2">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'J'}
                  </div>
                  <span className="text-xs">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Today's Cause List */}
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                  Today's Cause List
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {casesLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </div>
                ) : todaysCases.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Case No.</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todaysCases.map((case_) => (
                          <TableRow key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell className="text-sm text-gray-900 dark:text-white">
                              {case_.nextHearing ? new Date(case_.nextHearing).toLocaleTimeString() : 'TBD'}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-gray-900 dark:text-white">
                              {case_.type?.toUpperCase()}/{case_.id}
                            </TableCell>
                            <TableCell className="text-sm text-gray-900 dark:text-white">{case_.title}</TableCell>
                            <TableCell className="text-sm text-gray-900 dark:text-white capitalize">{case_.type}</TableCell>
                            <TableCell>
                              <span className={`status-badge ${getStatusColor(case_.status)}`}>
                                {case_.status.replace("-", " ")}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm space-x-2">
                              <Link href={`/case/${case_.id}`}>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                                <Video className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No hearings scheduled for today.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="judicial-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalCases || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Cases</p>
                    </div>
                    <Folder className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="judicial-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingDecisions || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pending Decisions</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="judicial-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.todayHearings || 0}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Today's Hearings</p>
                    </div>
                    <CalendarDays className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Summaries Sidebar */}
          <div className="space-y-6">
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Bot className="h-5 w-5 text-purple-600 mr-2" />
                  AI Case Summaries
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {cases?.slice(0, 3).map((case_) => (
                  <div key={case_.id} className="border-l-4 border-blue-500 pl-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {case_.type?.toUpperCase()}/{case_.id}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {case_.summary?.substring(0, 80) || 'Case summary requires detailed analysis...'}...
                    </p>
                    <Link href={`/case/${case_.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 mt-2 p-0 h-auto">
                        View Full Brief
                      </Button>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Decisions */}
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="font-semibold text-gray-900 dark:text-white">Recent Decisions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {cases?.filter(c => c.status === "decided").slice(0, 3).map((case_) => (
                  <div key={case_.id} className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {case_.type?.toUpperCase()}/{case_.id}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Decision rendered</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {case_.createdAt ? new Date(case_.createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                )) || (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No recent decisions.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
