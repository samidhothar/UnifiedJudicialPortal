import { Link } from "wouter";
import { Scale, User, Briefcase, Gavel, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const roles = [
    {
      id: "citizen",
      title: "Citizen",
      description: "File cases, track status, attend virtual hearings",
      icon: User,
      color: "bg-blue-100 text-blue-600",
      buttonColor: "judicial-button-primary",
      path: "/login/citizen",
    },
    {
      id: "advocate",
      title: "Advocate",
      description: "Manage cases, file documents, access AI briefs",
      icon: Briefcase,
      color: "bg-green-100 text-green-600",
      buttonColor: "judicial-button-success",
      path: "/login/advocate",
    },
    {
      id: "judge",
      title: "Judge",
      description: "Review cause lists, conduct hearings, make decisions",
      icon: Gavel,
      color: "bg-purple-100 text-purple-600",
      buttonColor: "judicial-button-purple",
      path: "/login/judge",
    },
    {
      id: "clerk",
      title: "Court Clerk",
      description: "Process intake, manage schedules, handle payments",
      icon: ClipboardList,
      color: "bg-yellow-100 text-yellow-600",
      buttonColor: "judicial-button-warning",
      path: "/login/clerk",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 judicial-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Scale className="text-blue-600 h-8 w-8 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Unified Judicial Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Government of Pakistan</span>
              <div className="w-px h-4 bg-gray-300"></div>
              <span>Version 1.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to the Digital Justice System
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Access judicial services based on your role. Select your login type to continue.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <Card
              key={role.id}
              className="judicial-card cursor-pointer transform transition-transform hover:scale-105"
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <role.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {role.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {role.description}
                </p>
                <Link href={role.path}>
                  <button className={`w-full ${role.buttonColor}`}>
                    Login as {role.title}
                  </button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Status Bar */}
        <Card className="mt-12 judicial-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">System Online</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Courts Available: 45</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Maintenance: Tonight 11 PM</span>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm">
                <span className="mr-1">?</span>
                Help & Support
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
