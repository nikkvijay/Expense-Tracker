import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import Button from "@/components/common/Button";

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-expense-primary">404</h1>
                <h2 className="text-3xl font-bold mt-4 mb-6 text-gray-800">Page Not Found</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link to="/">
                    <Button className="px-6 py-3 flex items-center">
                        <Home className="mr-2 h-5 w-5" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;