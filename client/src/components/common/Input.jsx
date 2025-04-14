const Input = ({ label, id, className, ...props }) => {
    return (
        <div className="mb-4">
            {label && (
                <label htmlFor={id} className="block text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
                {...props}
            />
        </div>
    );
};

export default Input;