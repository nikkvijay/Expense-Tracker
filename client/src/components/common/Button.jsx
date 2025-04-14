const Button = ({ children, type = 'button', className, ...props }) => {
    return (
        <button
            type={type}
            className={`px-4 py-2 rounded-lg transition ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;