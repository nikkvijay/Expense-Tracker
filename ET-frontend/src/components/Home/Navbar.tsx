import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LogOut,
  Home,
  Calculator,
  BarChart3,
  Settings,
  User,
} from "lucide-react";
import { logout } from "@/api";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Logo from "@/components/ui/logo";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("token");
  const { user, getUserDisplayName, setUser } = useUser();

  const handleLogout = async () => {
    try {
      logout();
      setUser(null); // Clear user context
      toast.success("Logged out successfully");
      navigate("/login");
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const NavLink = ({
    to,
    children,
    icon: Icon,
    onClick,
  }: {
    to: string;
    children: React.ReactNode;
    icon: React.ElementType;
    onClick?: () => void;
  }) => (
    <Link
      to={to}
      onClick={onClick || closeMenu}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary ${
        isActive(to)
          ? "bg-primary/10 text-primary"
          : "text-foreground hover:scale-105"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-gradient-card shadow-medium backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to={isAuthenticated ? "/dashboard" : "/"}
              className="hover:scale-105 transition-transform duration-200"
              onClick={closeMenu}
            >
              <Logo variant="horizontal" size="lg" currency="$" />
            </Link>
          </div>

          {/* Desktop Navigation */}   
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-2">
              <NavLink to="/dashboard" icon={Home}>
                Dashboard
              </NavLink>
              <NavLink to="/expense-tracker" icon={Calculator}>
                Expense Tracker
              </NavLink>
              <NavLink to="/analytics" icon={BarChart3}>
                Analytics
              </NavLink>
              <NavLink to="/settings" icon={Settings}>
                Settings
              </NavLink>

              {/* User Menu */}
              <div className="flex items-center gap-2 ml-4 pl-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}

          {/* Desktop Auth Links (for non-authenticated users) */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="hover:bg-primary/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2 hover:bg-primary/10"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-card shadow-large z-40 animate-slide-up">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-surface rounded-lg mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName.charAt(0)}${user.lastName.charAt(
                              0
                            )}`.toUpperCase()
                          : user?.fullName
                          ? user.fullName.split(" ").length > 1
                            ? `${user.fullName
                                .split(" ")[0]
                                .charAt(0)}${user.fullName
                                .split(" ")
                                [user.fullName.split(" ").length - 1].charAt(
                                  0
                                )}`.toUpperCase()
                            : user.fullName.charAt(0).toUpperCase()
                          : user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || "Welcome back!"}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    <NavLink to="/dashboard" icon={Home}>
                      Dashboard
                    </NavLink>
                    <NavLink to="/expense-tracker" icon={Calculator}>
                      Expense Tracker
                    </NavLink>
                    <NavLink to="/analytics" icon={BarChart3}>
                      Analytics
                    </NavLink>
                    <NavLink to="/settings" icon={Settings}>
                      Settings
                    </NavLink>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-4">
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Auth Links for Mobile */}
                  <div className="space-y-2">
                    <Link to="/login" onClick={closeMenu}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start hover:bg-primary/10"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={closeMenu}>
                      <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={closeMenu}
        />
      )}
    </nav>
  );
};

export default Navbar;
