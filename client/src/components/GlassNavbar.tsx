import { Moon, Sun, User, Bell, LogOut, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface GlassNavbarProps {
  showKycBadge?: boolean;
  kycStatus?: "verified" | "pending" | "required";
}

export function GlassNavbar({ showKycBadge = false, kycStatus = "pending" }: GlassNavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getKycBadgeColor = () => {
    switch (kycStatus) {
      case "verified": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "required": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getKycText = () => {
    switch (kycStatus) {
      case "verified": return "✓ Verified";
      case "pending": return "⏳ Pending";
      case "required": return "⚠ KYC Required";
      default: return "Unknown";
    }
  };

  return (
    <nav className="glass-navbar sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚖️</span>
              </div>
              <span className="font-bold text-lg text-white">Pakistan Courts</span>
            </div>
          </Link>
        </div>

        {/* Center Navigation (if needed) */}
        <div className="hidden md:flex items-center space-x-6">
          {user && (
            <>
              <Link href="/">
                <span className="text-white/80 hover:text-white transition-colors cursor-pointer">
                  Dashboard
                </span>
              </Link>
              <span className="text-white/60">•</span>
              <span className="text-white/60 text-sm">
                All times are Pakistan Standard Time (UTC+5)
              </span>
            </>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {user && (
            <>
              {/* KYC Status Badge */}
              {showKycBadge && (
                <Badge 
                  className={`${getKycBadgeColor()} backdrop-filter backdrop-blur-sm border text-xs`}
                >
                  {getKycText()}
                </Badge>
              )}

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* Help */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <p className="text-white text-sm font-medium">{user.name}</p>
                  <p className="text-white/60 text-xs capitalize">{user.role}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <User className="h-4 w-4" />
                </Button>
              </div>

              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Helper Text */}
      {user && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/10">
          <p className="text-white/60 text-xs text-center">
            Need help? Chat with our Digital Court Officer 09:00-17:00 PKT
          </p>
        </div>
      )}
    </nav>
  );
}