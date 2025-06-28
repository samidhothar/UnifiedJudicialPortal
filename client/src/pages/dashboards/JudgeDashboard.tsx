import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Gavel, Calendar, Folder, Clock, CalendarDays, Video, Eye, Bot, FileText, Users, BarChart3, Crown, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { GlassNavbar } from "@/components/GlassNavbar";
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

  const currentTime = new Date().toLocaleTimeString('en-PK', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
  
  const greeting = new Date().getHours() < 12 ? 'Good morning' : 
                   new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <GlassNavbar showKycBadge={false} />
      
      {/* Judge Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {greeting}, Justice {user?.name?.split(' ').pop() || 'Judge'}
                </h1>
                <p className="text-white/70">
                  You have {todaysCases.length} matters today • {currentTime} PKT
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="status-badge status-in-hearing">
                <Clock className="h-3 w-3 mr-1" />
                In Session
              </Badge>
              <Button className="judicial-button-primary">
                <Video className="h-4 w-4 mr-2" />
                Virtual Bench
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card cursor-pointer hover:scale-105 transition-transform duration-200">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Case Queue</h3>
              <p className="text-white/70 text-xs">Prioritized by urgency</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card cursor-pointer hover:scale-105 transition-transform duration-200">
            <CardContent className="p-4 text-center">
              <Bot className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">AI Brief</h3>
              <p className="text-white/70 text-xs">Auto-generated synopsis</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card cursor-pointer hover:scale-105 transition-transform duration-200">
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Evidence Viewer</h3>
              <p className="text-white/70 text-xs">Browse exhibits inline</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card cursor-pointer hover:scale-105 transition-transform duration-200">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Analytics</h3>
              <p className="text-white/70 text-xs">Performance metrics</p>
            </CardContent>
          </Card>
        </div>

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

            {/* Comprehensive Hearing Timeline */}
            <div className="lg:col-span-2">
              <HearingTimeline 
                hearings={allHearings || []} 
                userRole="judge"
                showCaseTitle={true}
              />
            </div>

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
