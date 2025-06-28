import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { User, Plus, Calendar, Phone, HelpCircle, Video, Eye, Upload, CreditCard, MapPin, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { CaseFilingWizard } from "@/components/CaseFilingWizard";
import { GlassNavbar } from "@/components/GlassNavbar";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <GlassNavbar showKycBadge={true} kycStatus="verified" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-3 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass-card cursor-pointer hover:scale-105 transition-transform duration-200" onClick={() => setShowFilingWizard(true)}>
                <CardContent className="p-4 text-center">
                  <Plus className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-white mb-1">File New Case</h3>
                  <p className="text-white/70 text-xs">Start a new legal proceeding</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card cursor-pointer hover:scale-105 transition-transform duration-200">
                <CardContent className="p-4 text-center">
                  <CreditCard className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-white mb-1">Fee Estimator</h3>
                  <p className="text-white/70 text-xs">Calculate court fees</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card cursor-pointer hover:scale-105 transition-transform duration-200">
                <CardContent className="p-4 text-center">
                  <Upload className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-white mb-1">Evidence Upload</h3>
                  <p className="text-white/70 text-xs">Submit documents</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card cursor-pointer hover:scale-105 transition-transform duration-200">
                <CardContent className="p-4 text-center">
                  <MapPin className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-white mb-1">Court Locator</h3>
                  <p className="text-white/70 text-xs">Find nearest facility</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-blue-400" />
                  My Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {casesLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                  </div>
                ) : cases && cases.length > 0 ? (
                  <div className="space-y-4 p-4">
                    {cases.map((case_) => (
                      <div key={case_.id} className={`glass-card p-4 case-card-${case_.status}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-white">{case_.title}</h3>
                          <Badge className={`status-badge status-${case_.status}`}>
                            {case_.status.replace("-", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-white/70 mb-3">
                          Case No: {case_.type?.toUpperCase()}/{case_.id} • Filed: {case_.createdAt ? new Date(case_.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                        
                        {/* Progress Indicator */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-white/60 mb-1">
                            <span>Case Progress</span>
                            <span>{case_.status === 'filed' ? '25%' : case_.status === 'pending' ? '50%' : case_.status === 'in-hearing' ? '75%' : '100%'}</span>
                          </div>
                          <Progress 
                            value={case_.status === 'filed' ? 25 : case_.status === 'pending' ? 50 : case_.status === 'in-hearing' ? 75 : 100} 
                            className="h-2"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-white/70">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Next: {case_.nextHearing ? new Date(case_.nextHearing).toLocaleDateString() : 'Awaiting scheduling'}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" className="judicial-button-primary text-xs">
                              <Upload className="h-3 w-3 mr-1" />
                              Evidence
                            </Button>
                            <Link href={`/case/${case_.id}`}>
                              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 text-xs">
                                View →
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-white/70">No cases filed yet.</p>
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
            {/* Smart Notifications */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-400" />
                  Smart Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">SMS Alerts</span>
                  <Button size="sm" className="judicial-button-success text-xs">ON</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Email Updates</span>
                  <Button size="sm" className="judicial-button-success text-xs">ON</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">WhatsApp</span>
                  <Button size="sm" variant="outline" className="text-white/70 border-white/30 text-xs">OFF</Button>
                </div>
                <p className="text-white/50 text-xs mt-3">
                  Get reminders 48h, 24h, and 12h before hearings
                </p>
              </CardContent>
            </Card>

            {/* Next Hearing Card */}
            {nextHearing && (
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center">
                    <Calendar className="h-5 w-5 text-yellow-400 mr-2" />
                    Upcoming Hearing
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-white">Case #{nextHearing.type?.toUpperCase()}/{nextHearing.id}</p>
                      <p className="text-xs text-white/70">{nextHearing.title}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-white">
                        {nextHearing.nextHearing ? new Date(nextHearing.nextHearing).toLocaleDateString() : 'Awaiting scheduling'}
                      </p>
                      <p className="text-white/70">
                        {nextHearing.nextHearing ? new Date(nextHearing.nextHearing).toLocaleTimeString() : ''} - {nextHearing.court || 'Court Room TBD'}
                      </p>
                    </div>
                    <Button className="w-full judicial-button-success">
                      <Video className="h-4 w-4 mr-2" />
                      Join Virtual Courtroom
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Guidelines Hub */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-green-400" />
                  Guidelines Hub
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <span className="text-sm">📝 Filing Procedures</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <span className="text-sm">📄 Evidence Requirements</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <span className="text-sm">💰 Fee Structure</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <span className="text-sm">⚖️ Hearing Process</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-3 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <span className="text-sm">📞 Appeal Options</span>
                  </Button>
                </div>
                <div className="pt-2 border-t border-white/20">
                  <Button
                    variant="ghost"
                    className="w-full text-white/70 hover:text-white text-xs"
                  >
                    🇵🇰 اردو Guidelines | English
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* My Lawyer Card */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2 text-purple-400" />
                  My Lawyer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-white/70 text-sm mb-3">No lawyer assigned</p>
                <Button className="w-full judicial-button-primary">
                  <Phone className="h-4 w-4 mr-2" />
                  Find Registered Advocate
                </Button>
                <p className="text-white/50 text-xs mt-2">
                  Connect with qualified legal counsel
                </p>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-white mb-2">Digital Court Officer</h3>
                <p className="text-white/70 text-xs mb-3">
                  Need help? Chat with our support team
                </p>
                <p className="text-white/50 text-xs">
                  Available 09:00-17:00 PKT
                </p>
                <Button className="w-full mt-3 judicial-button-warning">
                  <Phone className="h-4 w-4 mr-2" />
                  Get Help Now
                </Button>
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
