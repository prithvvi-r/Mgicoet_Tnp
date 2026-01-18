import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-blue-600 text-white shadow-md p-4 flex justify-between items-center">
            <div className="text-xl font-bold">
                <Link to="/">TNP System</Link>
            </div>
            <div className="flex gap-4 items-center">
                <Link to="/" className="hover:text-gray-200">Dashboard</Link>
                <Link to="/companies" className="hover:text-gray-200">Companies</Link>
                <Link to="/students" className="hover:text-gray-200">Students</Link>
                <div className="flex items-center gap-2 border-l pl-4 border-blue-400">
                    <span className="text-sm">{user.username} ({user.role})</span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
