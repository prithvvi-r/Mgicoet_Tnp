import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CompanyList from './pages/CompanyList';
import StudentList from './pages/StudentList';
import StudentDetails from './pages/StudentDetails';
import StudentForm from './pages/StudentForm';
import CompanyDetails from './pages/CompanyDetails';
import CompanyForm from './pages/CompanyForm';

// const StudentList = () => <div className="p-8 text-2xl font-bold">Student List (Coming Soon)</div>;

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />

            {/* Company Routes */}
            <Route path="/companies" element={<PrivateRoute><CompanyList /></PrivateRoute>} />
            <Route path="/companies/new" element={<PrivateRoute roles={['tnp_officer', 'admin']}><CompanyForm /></PrivateRoute>} />
            <Route path="/companies/:id" element={<PrivateRoute><CompanyDetails /></PrivateRoute>} />
            <Route path="/companies/:id/edit" element={<PrivateRoute roles={['tnp_officer', 'admin']}><CompanyForm /></PrivateRoute>} />

            {/* Student Routes */}
            <Route path="/students" element={<PrivateRoute><StudentList /></PrivateRoute>} />
            <Route path="/students/new" element={<PrivateRoute roles={['tnp_officer', 'admin']}><StudentForm /></PrivateRoute>} />
            <Route path="/students/:id" element={<PrivateRoute><StudentDetails /></PrivateRoute>} />
            <Route path="/students/:id/edit" element={<PrivateRoute><StudentForm /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
