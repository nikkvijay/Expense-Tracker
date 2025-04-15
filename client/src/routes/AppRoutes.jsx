import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/Login';
import SignupPage from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import PrivateRoute from '../components/common/PrivateRoute';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
};

export default AppRoutes;