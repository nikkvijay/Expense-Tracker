import { Link } from "react-router-dom";
import { DollarSign, LogOut } from "lucide-react";
import Button from "@/components/common/Button";
import { logout } from "@/utils/authUtils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        navigate("/login");
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <DollarSign className="h-8 w-8 text-expense-primary" />
                            <span className="ml-2 text-xl font-bold text-gray-800">Smart Expense Organizer</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/"
                            className="text-gray-700 hover:text-expense-primary px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/analytics"
                            className="text-gray-700 hover:text-expense-primary px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Analytics
                        </Link>
                        <Button
                            variant="danger"
                            size="sm"
                            className="flex items-center bg-expense-danger text-white bg-red-500"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;