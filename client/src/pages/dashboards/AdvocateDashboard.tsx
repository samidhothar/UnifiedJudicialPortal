import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Briefcase, Upload, Calendar, Bot, FileText, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import type { Case } from "@/types";

export default function AdvocateDashboard() {
  const { user, logout } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const { data: cases, isLoading: casesLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "filed": return "status-filed";
      case "pending": return "status-pending"; 
      case "in-hearing": return "status-in-hearing";
      case "decided": return "status-decided";
      default: return "status-filed";
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const upcomingHearings = cases?.filter(c => 
    c.nextHearing && new Date(c.nextHearing) > new Date()
  ).sort((a, b) => 
    new Date(a.nextHearing!).getTime() - new Date(b.nextHearing!).getTime()
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 judicial-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Briefcase className="text-green-600 h-6 w-6 mr-3" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Advocate Portal</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="judicial-button-success">
                <Upload className="h-4 w-4 mr-2" />
                Bulk E-Filing
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => logout()}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-green-600"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm mr-2">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'A'}
                  </div>
                  <span className="text-xs">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cases">My Cases</TabsTrigger>
            <TabsTrigger value="filing">E-Filing</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="ai">AI Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-6">
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Active Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {casesLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
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
                          Case No: {case_.type?.toUpperCase()}/{case_.id} • Court: {case_.court || 'TBD'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Next: {case_.nextHearing ? new Date(case_.nextHearing).toLocaleDateString() : 'TBD'}
                          </div>
                          <div className="space-x-2">
                            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                              <Bot className="h-4 w-4 mr-1" />
                              AI Brief
                            </Button>
                            <Link href={`/case/${case_.id}`}>
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                View Details →
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No active cases found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filing" className="space-y-6">
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bulk E-Filing Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-900 dark:text-white mb-2">Drag & drop files here</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">or click to browse files</p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button className="judicial-button-success">
                      Select Files
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG • Max size: 10MB each
                  </p>
                </div>
                
                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Selected Files:</h4>
                    <div className="space-y-2">
                      {Array.from(selectedFiles).map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button className="mt-4 judicial-button-success">
                      Upload All Files
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upcoming Hearings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {upcomingHearings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingHearings.map((case_) => (
                      <div key={case_.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{case_.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {case_.nextHearing ? new Date(case_.nextHearing).toLocaleString() : 'TBD'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{case_.court || 'Court TBD'}</p>
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">
                            <Video className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                          <Link href={`/case/${case_.id}`}>
                            <Button variant="outline" size="sm">
                              Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center">No upcoming hearings scheduled.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Bot className="h-5 w-5 text-purple-600 mr-2" />
                  AI Legal Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="judicial-button-purple h-20 flex-col">
                    <Bot className="h-6 w-6 mb-2" />
                    Generate Case Brief
                  </Button>
                  <Button className="judicial-button-purple h-20 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    Legal Research
                  </Button>
                  <Button className="judicial-button-purple h-20 flex-col">
                    <Calendar className="h-6 w-6 mb-2" />
                    Precedent Search
                  </Button>
                  <Button className="judicial-button-purple h-20 flex-col">
                    <Briefcase className="h-6 w-6 mb-2" />
                    Document Analysis
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">AI Recommendations</h4>
                  <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                    <li>• Review evidence for Case #{cases?.[0]?.id} before next hearing</li>
                    <li>• Similar precedents found for property disputes</li>
                    <li>• Consider mediation for family law cases</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
