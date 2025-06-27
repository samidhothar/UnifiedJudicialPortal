import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ClipboardList, FileText, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import type { Case } from "@/types";

export default function ClerkDashboard() {
  const { user, logout } = useAuth();

  const { data: cases, isLoading: casesLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  const intakeQueue = cases?.filter(c => c.status === "filed") || [];
  const pendingPayments = cases?.filter(c => c.status === "pending") || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "filed": return "status-filed";
      case "pending": return "status-pending"; 
      case "in-hearing": return "status-in-hearing";
      case "decided": return "status-decided";
      default: return "status-filed";
    }
  };

  const getUrgencyIcon = (type: string) => {
    switch (type) {
      case "criminal": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "family": return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <FileText className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 judicial-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <ClipboardList className="text-yellow-600 h-6 w-6 mr-3" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Court Clerk Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                System Online
              </Badge>
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => logout()}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-yellow-600"
                >
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white text-sm mr-2">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'C'}
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
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Intake Queue */}
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <ClipboardList className="h-5 w-5 text-yellow-600 mr-2" />
                  Intake Queue
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {casesLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                  </div>
                ) : intakeQueue.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Priority</TableHead>
                          <TableHead>Case No.</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Filed Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {intakeQueue.map((case_) => (
                          <TableRow key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell>
                              {getUrgencyIcon(case_.type)}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-gray-900 dark:text-white">
                              {case_.type?.toUpperCase()}/{case_.id}
                            </TableCell>
                            <TableCell className="text-sm text-gray-900 dark:text-white">{case_.title}</TableCell>
                            <TableCell className="text-sm text-gray-900 dark:text-white capitalize">{case_.type}</TableCell>
                            <TableCell className="text-sm text-gray-900 dark:text-white">
                              {case_.createdAt ? new Date(case_.createdAt).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell className="text-sm space-x-2">
                              <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                                Process
                              </Button>
                              <Link href={`/case/${case_.id}`}>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                  View
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No cases in intake queue.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Reconciliation */}
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  Payment Reconciliation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-200">PKR 45,000</p>
                        <p className="text-sm text-green-600 dark:text-green-400">Received Today</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">PKR 12,500</p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">23</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Transactions</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="font-semibold text-gray-900 dark:text-white">Today's Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">New Filings</span>
                  <Badge variant="outline">{intakeQueue.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Processed</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">8</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payments</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">15</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Hearings</span>
                  <Badge variant="outline" className="text-purple-600 border-purple-600">6</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Urgent Tasks */}
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  Urgent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Criminal Case Review</p>
                  <p className="text-xs text-red-600 dark:text-red-400">Due: Today 5:00 PM</p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Payment Verification</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">3 pending transactions</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Schedule Hearing</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">2 cases awaiting dates</p>
                </div>
              </CardContent>
            </Card>

            {/* System Tools */}
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="font-semibold text-gray-900 dark:text-white">Quick Tools</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment Gateway
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Management
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
