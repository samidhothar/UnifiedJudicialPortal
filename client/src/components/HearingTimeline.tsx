import { Calendar, Clock, MapPin, Video, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Hearing } from "@/types";

interface HearingTimelineProps {
  hearings: Hearing[];
  userRole: string;
  showCaseTitle?: boolean;
}

export function HearingTimeline({ hearings, userRole, showCaseTitle = false }: HearingTimelineProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getHearingStatus = (dateTime: string) => {
    const hearingDate = new Date(dateTime);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hearingDay = new Date(hearingDate.getFullYear(), hearingDate.getMonth(), hearingDate.getDate());
    
    if (hearingDay.getTime() === today.getTime()) {
      return { status: "today", color: "bg-green-100 text-green-800 border-green-200" };
    } else if (hearingDate > now) {
      return { status: "upcoming", color: "bg-blue-100 text-blue-800 border-blue-200" };
    } else {
      return { status: "completed", color: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  const getRoleSpecificActions = (hearing: Hearing) => {
    const { status } = getHearingStatus(hearing.dateTime);
    
    switch (userRole) {
      case "judge":
        return status === "today" ? (
          <div className="flex gap-2">
            <Button size="sm" className="judicial-button-primary">
              <Video className="h-3 w-3 mr-1" />
              Start Hearing
            </Button>
            <Button size="sm" variant="outline">
              View Notes
            </Button>
          </div>
        ) : status === "upcoming" ? (
          <Button size="sm" variant="outline">
            <Calendar className="h-3 w-3 mr-1" />
            Schedule
          </Button>
        ) : (
          <Button size="sm" variant="ghost" className="text-xs">
            View Record
          </Button>
        );
      
      case "advocate":
        return status === "today" ? (
          <div className="flex gap-2">
            <Button size="sm" className="judicial-button-primary">
              <Video className="h-3 w-3 mr-1" />
              Join Hearing
            </Button>
            <Button size="sm" variant="outline">
              Case Brief
            </Button>
          </div>
        ) : status === "upcoming" ? (
          <Button size="sm" variant="outline">
            <User className="h-3 w-3 mr-1" />
            Prepare
          </Button>
        ) : (
          <Button size="sm" variant="ghost" className="text-xs">
            Transcript
          </Button>
        );
      
      case "citizen":
        return status === "today" ? (
          <Button size="sm" className="judicial-button-primary">
            <Video className="h-3 w-3 mr-1" />
            Join Hearing
          </Button>
        ) : status === "upcoming" ? (
          <Badge variant="outline" className="text-xs">
            Scheduled
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Completed
          </Badge>
        );
      
      case "clerk":
        return status === "today" ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              Monitor
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Minutes
            </Button>
          </div>
        ) : status === "upcoming" ? (
          <Button size="sm" variant="outline" className="text-xs">
            Setup
          </Button>
        ) : (
          <Button size="sm" variant="ghost" className="text-xs">
            Archive
          </Button>
        );
      
      default:
        return null;
    }
  };

  if (!hearings || hearings.length === 0) {
    return (
      <Card className="judicial-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Hearing Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hearings scheduled</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort hearings by date
  const sortedHearings = [...hearings].sort((a, b) => 
    new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );

  return (
    <Card className="judicial-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Hearing Timeline
          <Badge variant="secondary" className="ml-auto">
            {sortedHearings.length} hearings
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedHearings.map((hearing, index) => {
            const { date, time } = formatDateTime(hearing.dateTime);
            const { status, color } = getHearingStatus(hearing.dateTime);
            
            return (
              <div key={hearing.id} className="relative">
                {/* Timeline line */}
                {index < sortedHearings.length - 1 && (
                  <div className="absolute left-4 top-12 w-0.5 h-16 bg-gray-200 dark:bg-gray-700"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${color} flex-shrink-0`}>
                    {status === "completed" ? (
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    ) : status === "today" ? (
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    ) : (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  
                  {/* Hearing details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {date} at {time}
                        </p>
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {hearing.location}
                        </div>
                      </div>
                      <Badge className={color.replace('bg-', 'border-').replace('text-', '')} variant="outline">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {hearing.remarks}
                    </p>
                    
                    {/* Role-specific actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {userRole === "judge" ? "Presiding" : 
                         userRole === "advocate" ? "Representing" :
                         userRole === "clerk" ? "Court Staff" : "Attending"}
                      </div>
                      {getRoleSpecificActions(hearing)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}