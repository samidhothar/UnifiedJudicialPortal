import { useState } from "react";
import { Link, useLocation } from "wouter";
import { User, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function CitizenLogin() {
  const [, navigate] = useLocation();
  const { login, isLoginPending } = useAuth();
  const { toast } = useToast();
  const [cnic, setCnic] = useState("");
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cnic || !otp) {
      toast({
        title: "Error",
        description: "Please enter both CNIC and OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      await login({
        identifier: cnic,
        role: "citizen",
        otp,
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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Citizen Login</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Enter your CNIC to receive OTP</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="cnic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CNIC Number
                </Label>
                <Input
                  id="cnic"
                  type="text"
                  placeholder="12345-6789012-3"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <Label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OTP Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">For demo: use 123456</p>
              </div>

              <Button
                type="submit"
                className="w-full judicial-button-primary"
                disabled={isLoginPending}
              >
                {isLoginPending ? "Verifying..." : "Verify & Login"}
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
