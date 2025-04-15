// src/components/common/Button.jsx
import React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(
    ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
        const variantClasses = {
            primary: "bg-expense-primary text-white",
            secondary: "bg-gray-500 text-white",
            danger: "bg-expense-danger text-white",
            warning: "bg-expense-warning text-white",
            success: "bg-expense-success text-white",
        };

        const sizeClasses = {
            sm: "py-1 px-2 text-sm",
            md: "py-2 px-4",
            lg: "py-2.5 px-5 text-lg",
        };

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                    variantClasses[variant],
                    sizeClasses[size],
                    "hover:opacity-90", // Subtle hover effect
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;