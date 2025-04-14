import Signup from '../features/auth/components/Signup';

const SignupPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
                <Signup />
            </div>
        </div>
    );
};

export default SignupPage;