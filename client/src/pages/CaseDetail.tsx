import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Download, Video, Upload, Bot, Calendar, Shield, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { EvidenceVault } from "@/components/EvidenceVault";
import type { Case, Evidence, Hearing, AIBrief } from "@/types";

export default function CaseDetail() {
  const [, params] = useRoute("/case/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  
  const caseId = params?.id ? parseInt(params.id) : 0;

  const { data: caseData, isLoading: caseLoading } = useQuery<Case>({
    queryKey: ["/api/cases", caseId],
    enabled: !!caseId,
  });

  const { data: evidence, isLoading: evidenceLoading } = useQuery<Evidence[]>({
    queryKey: ["/api/cases", caseId, "evidence"],
    enabled: !!caseId,
  });

  const { data: hearings, isLoading: hearingsLoading } = useQuery<Hearing[]>({
    queryKey: ["/api/cases", caseId, "hearings"],
    enabled: !!caseId,
  });

  const { data: aiBrief, isLoading: aiBriefLoading } = useQuery<AIBrief>({
    queryKey: ["/api/ai/brief"],
    queryFn: async () => {
      const response = await fetch(`/api/ai/brief?case_id=${caseId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch AI brief");
      return response.json();
    },
    enabled: !!caseId && activeTab === "ai-brief",
  });

  const generateBriefMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", `/api/ai/brief?case_id=${caseId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/brief"] });
      toast({
        title: "Success",
        description: "AI brief generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate AI brief",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "status-filed";
    switch (status) {
      case "filed": return "status-filed";
      case "pending": return "status-pending"; 
      case "in-hearing": return "status-in-hearing";
      case "decided": return "status-decided";
      default: return "status-filed";
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  if (caseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Case Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The requested case could not be found or you don't have permission to view it.
            </p>
            <Link href="/">
              <Button className="judicial-button-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 judicial-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{caseData.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Case No: {caseData.type?.toUpperCase()}/{caseData.id} • 
                  Filed: {formatDate(caseData.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={getStatusColor(caseData.status)}>
                {caseData.status?.replace("-", " ").toUpperCase() || "UNKNOWN"}
              </Badge>
              <Button className="judicial-button-primary">
                <Download className="h-4 w-4 mr-2" />
                Export Case
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-transparent">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none bg-transparent"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="evidence" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none bg-transparent"
              >
                Evidence Vault
              </TabsTrigger>
              <TabsTrigger 
                value="hearings" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none bg-transparent"
              >
                Hearings Timeline
              </TabsTrigger>
              <TabsTrigger 
                value="ai-brief" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none bg-transparent"
              >
                AI Brief
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Case Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="judicial-card">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      Case Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Case Type
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white capitalize">{caseData.type}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Court
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">{caseData.court || "TBD"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Status
                        </label>
                        <Badge className={getStatusColor(caseData.status)}>
                          {caseData.status?.replace("-", " ").toUpperCase() || "UNKNOWN"}
                        </Badge>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Next Hearing
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDateTime(caseData.nextHearing)}
                        </p>
                      </div>
                    </div>
                    {caseData.summary && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Case Summary
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">{caseData.summary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Case Timeline */}
                <Card className="judicial-card">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      Case Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white font-medium">Case Filed</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {formatDate(caseData.createdAt)}
                          </p>
                        </div>
                      </div>
                      {caseData.status && caseData.status !== "filed" && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white font-medium">Case Under Review</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Processing started</p>
                          </div>
                        </div>
                      )}
                      {caseData.nextHearing && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white font-medium">Hearing Scheduled</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {formatDateTime(caseData.nextHearing)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="judicial-card">
                  <CardHeader>
                    <CardTitle className="font-semibold text-gray-900 dark:text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {caseData.nextHearing && (
                      <Button className="w-full judicial-button-primary">
                        <Video className="h-4 w-4 mr-2" />
                        Join Virtual Hearing
                      </Button>
                    )}
                    <Button 
                      className="w-full judicial-button-success"
                      onClick={() => setActiveTab("evidence")}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Evidence
                    </Button>
                    <Button 
                      className="w-full judicial-button-purple"
                      onClick={() => {
                        setActiveTab("ai-brief");
                        generateBriefMutation.mutate();
                      }}
                      disabled={generateBriefMutation.isPending}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      {generateBriefMutation.isPending ? "Generating..." : "Generate AI Brief"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="judicial-card">
                  <CardHeader>
                    <CardTitle className="font-semibold text-gray-900 dark:text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {evidence && evidence.length > 0 ? (
                      evidence.slice(0, 3).map((item, index) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">Evidence uploaded: {item.filename}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {formatDate(item.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">No recent activity.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Evidence Vault Tab */}
          <TabsContent value="evidence">
            <EvidenceVault caseId={caseId} />
          </TabsContent>

          {/* Hearings Timeline Tab */}
          <TabsContent value="hearings" className="space-y-6">
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  Hearings Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hearingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : hearings && hearings.length > 0 ? (
                  <div className="space-y-6">
                    {hearings.map((hearing) => (
                      <div key={hearing.id} className="border-l-4 border-blue-500 pl-6 pb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Hearing #{hearing.id}
                          </h4>
                          {hearing.videoUrl && (
                            <Button variant="outline" size="sm">
                              <Video className="h-4 w-4 mr-1" />
                              Join
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white mb-1">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {formatDateTime(hearing.dateTime)}
                        </p>
                        {hearing.location && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Location: {hearing.location}
                          </p>
                        )}
                        {hearing.remarks && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Remarks: {hearing.remarks}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No hearings scheduled yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Brief Tab */}
          <TabsContent value="ai-brief" className="space-y-6">
            <Card className="judicial-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Bot className="h-5 w-5 text-purple-600 mr-2" />
                  AI Legal Brief
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiBriefLoading || generateBriefMutation.isPending ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Generating AI brief...</p>
                  </div>
                ) : aiBrief ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Executive Summary</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        {aiBrief.summary}
                      </p>
                    </div>

                    {/* Key Points */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Key Legal Points</h4>
                      <ul className="space-y-2">
                        {aiBrief.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Precedents */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Relevant Precedents</h4>
                      <ul className="space-y-2">
                        {aiBrief.precedents.map((precedent, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{precedent}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations</h4>
                      <ul className="space-y-2">
                        {aiBrief.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No AI brief generated yet.</p>
                    <Button 
                      className="judicial-button-purple"
                      onClick={() => generateBriefMutation.mutate()}
                      disabled={generateBriefMutation.isPending}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Generate AI Brief
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
