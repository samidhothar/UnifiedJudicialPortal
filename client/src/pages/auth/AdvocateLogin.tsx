import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Briefcase, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function AdvocateLogin() {
  const [, navigate] = useLocation();
  const { login, isLoginPending } = useAuth();
  const { toast } = useToast();
  const [barId, setBarId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barId || !password) {
      toast({
        title: "Error",
        description: "Please enter both Bar ID and password",
        variant: "destructive",
      });
      return;
    }

    try {
      await login({
        identifier: barId,
        password,
        role: "advocate",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="judicial-card">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advocate Login</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Enter your Bar ID and password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="barId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bar ID
                </Label>
                <Input
                  id="barId"
                  type="text"
                  placeholder="ADV-001"
                  value={barId}
                  onChange={(e) => setBarId(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full judicial-button-success"
                disabled={isLoginPending}
              >
                {isLoginPending ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/">
                <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Role Selection
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
