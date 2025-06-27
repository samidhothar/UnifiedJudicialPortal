import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { User, Plus, Calendar, Phone, HelpCircle, Video, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { CaseFilingWizard } from "@/components/CaseFilingWizard";
import type { Case } from "@/types";

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const [showFilingWizard, setShowFilingWizard] = useState(false);

  const { data: cases, isLoading: casesLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const nextHearing = cases?.find(c => 
    c.nextHearing && new Date(c.nextHearing) > new Date()
  );

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
              <User className="text-blue-600 h-6 w-6 mr-3" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Citizen Portal</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowFilingWizard(true)} className="judicial-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                File New Case
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => logout()}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm mr-2">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  My Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {casesLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : cases && cases.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cases.map((case_) => (
                      <div key={case_.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">{case_.title}</h3>
                          <span className={`status-badge ${getStatusColor(case_.status)}`}>
                            {case_.status.replace("-", " ").toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Case No: {case_.id} • Filed: {case_.createdAt ? new Date(case_.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Next Hearing: {case_.nextHearing ? new Date(case_.nextHearing).toLocaleDateString() : 'TBD'}
                          </div>
                          <Link href={`/case/${case_.id}`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                              View Details →
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No cases filed yet.</p>
                    <Button 
                      onClick={() => setShowFilingWizard(true)}
                      className="mt-4 judicial-button-primary"
                    >
                      File Your First Case
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Hearing Card */}
            {nextHearing && (
              <Card className="judicial-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
                    Next Hearing
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Case #{nextHearing.id}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{nextHearing.title}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">
                        {nextHearing.nextHearing ? new Date(nextHearing.nextHearing).toLocaleDateString() : 'TBD'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {nextHearing.nextHearing ? new Date(nextHearing.nextHearing).toLocaleTimeString() : ''} - {nextHearing.court || 'Court Room TBD'}
                      </p>
                    </div>
                    <Button className="w-full judicial-button-success">
                      <Video className="h-4 w-4 mr-2" />
                      Join Virtual Hearing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help & Support */}
            <Card className="judicial-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left p-3 border-gray-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900"
                  >
                    <HelpCircle className="h-4 w-4 text-blue-600 mr-3" />
                    <span className="text-sm text-gray-900 dark:text-white">Filing Guidelines</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left p-3 border-gray-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900"
                  >
                    <Phone className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm text-gray-900 dark:text-white">Contact Support</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Case Filing Wizard Modal */}
      {showFilingWizard && (
        <CaseFilingWizard
          isOpen={showFilingWizard}
          onClose={() => setShowFilingWizard(false)}
        />
      )}
    </div>
  );
}
