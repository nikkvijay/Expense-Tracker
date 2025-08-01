import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-9xl font-bold bg-gradient-primary bg-clip-text text-transparent">404</h1>
                <h2 className="text-3xl font-bold mt-4 mb-6 text-foreground">Page Not Found</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link to="/dashboard">
                    <Button className="px-6 py-3 flex items-center bg-gradient-primary hover:shadow-glow transition-all duration-300">
                        <Home className="mr-2 h-5 w-5" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;