import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyAPI, studentAPI, applicationAPI } from '../services/api';

const StatCard = ({ title, count, color, link }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
        <h3 className="text-gray-500 text-sm uppercase font-semibold">{title}</h3>
        <div className="flex justify-between items-end mt-2">
            <span className="text-3xl font-bold text-gray-800">{count}</span>
            {link && <Link to={link} className="text-sm text-blue-600 hover:underline">View All</Link>}
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        activeCompanies: 0,
        totalStudents: 0,
        placedStudents: 0,
        totalApplications: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, we might have a dedicated dashboard stats API
                // Here we fetch lists and count, which is not optimal for large data but fine for MVC
                const companiesRes = await companyAPI.getAll({ status: 'Active' });
                const studentsRes = await studentAPI.getAll();
                const appsRes = await applicationAPI.getAll();

                const activeCompanies = companiesRes.data.data.length;
                const students = studentsRes.data.data;
                const totalStudents = students.length;
                const placedStudents = students.filter(s => s.placement_status === 'Placed').length;
                const totalApplications = appsRes.data.data.length;

                setStats({ activeCompanies, totalStudents, placedStudents, totalApplications });
            } catch (error) {
                console.error("Error fetching stats", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Active Companies"
                    count={stats.activeCompanies}
                    color="border-green-500"
                    link="/companies"
                />
                <StatCard
                    title="Total Students"
                    count={stats.totalStudents}
                    color="border-blue-500"
                    link="/students"
                />
                <StatCard
                    title="Placed Students"
                    count={stats.placedStudents}
                    color="border-purple-500"
                    link="/students"
                />
                <StatCard
                    title="Total Applications"
                    count={stats.totalApplications}
                    color="border-orange-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="flex gap-4">
                        <Link to="/companies" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">View Companies</Link>
                        <Link to="/students" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">View Students</Link>
                    </div>
                </div>

                {/* Can add Recent Activity or Charts here */}
            </div>
        </div>
    );
};

export default Dashboard;
