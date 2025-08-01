import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Download,
  Moon,
  Sun,
  Monitor,
  Edit2,
  Lock,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrency, CURRENCIES } from "@/contexts/CurrencyContext";
import {
  getExpenses,
  getCurrentUser,
  updateProfile,
  changePassword,
} from "@/api";
import { exportExpensesToCSV, exportExpensesToJSON } from "@/utils/exportData";
import { toast } from "sonner";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [isExporting, setIsExporting] = useState(false);
  const [user, setUser] = useState<{ email: string; userId: string } | null>(
    null
  );
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setEmailForm({ email: userData.email });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Fallback to localStorage if API fails
        const email = localStorage.getItem("userEmail") || "user@example.com";
        const userId = localStorage.getItem("userId") || "";
        setUser({ email, userId });
        setEmailForm({ email });
      }
    };
    fetchUser();
  }, []);

  const handleExportData = async (format: "csv" | "json") => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to export data");
        return;
      }

      const expenses = await getExpenses();
      if (expenses.length === 0) {
        toast.warning("No expenses found to export");
        return;
      }

      if (format === "csv") {
        exportExpensesToCSV(expenses);
        toast.success(`Exported ${expenses.length} expenses to CSV`);
      } else {
        exportExpensesToJSON(expenses);
        toast.success(`Exported ${expenses.length} expenses to JSON`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!emailForm.email.trim()) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await updateProfile({ email: emailForm.email });
      setUser(updatedUser);
      setIsEditingEmail(false);
      toast.success("Email updated successfully");
    } catch (error) {
      console.error("Failed to update email:", error);
      toast.error("Failed to update email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error(
        "Failed to change password. Please check your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Settings
          </h1>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-foreground">Email Address</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {user?.email || "Loading..."}
                  </p>
                </div>
                <Dialog open={isEditingEmail} onOpenChange={setIsEditingEmail}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Update Email Address</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">New Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={emailForm.email}
                          onChange={(e) =>
                            setEmailForm({ email: e.target.value })
                          }
                          placeholder="Enter new email"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingEmail(false)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateEmail} disabled={loading}>
                          {loading ? "Updating..." : "Update Email"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Change your password
                  </p>
                </div>
                <Dialog
                  open={isChangingPassword}
                  onOpenChange={setIsChangingPassword}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-3 w-3" />
                      Change
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">
                          Current Password
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          placeholder="Enter current password"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          placeholder="Enter new password"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          placeholder="Confirm new password"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setIsChangingPassword(false)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleChangePassword}
                          disabled={loading}
                        >
                          {loading ? "Changing..." : "Change Password"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Budget Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you approach budget limits
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Monthly Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Receive monthly spending summaries
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Choose between light and dark mode
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex items-center gap-2"
                >
                  {getThemeIcon()}
                  {theme === "light" ? "Light" : "Dark"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Currency</p>
                  <p className="text-sm text-muted-foreground">
                    Set your preferred currency
                  </p>
                </div>
                <Select
                  value={currency.code}
                  onValueChange={(value) => {
                    const selectedCurrency = CURRENCIES.find(
                      (c) => c.code === value
                    );
                    if (selectedCurrency) {
                      setCurrency(selectedCurrency);
                      toast.success(
                        `Currency changed to ${selectedCurrency.name}`
                      );
                    }
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue>
                      <span className="flex items-center gap-2">
                        {currency.symbol} {currency.code}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        <span className="flex items-center gap-2">
                          {curr.symbol} {curr.code} - {curr.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Data & Privacy
              </CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Export Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download all your expense data
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData("csv")}
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData("json")}
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-card border-0 shadow-medium">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">
                Your preferences are automatically saved. Theme and currency
                changes take effect immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
