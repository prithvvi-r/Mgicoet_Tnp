import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const StudentDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await studentAPI.getById(id);
                const data = res.data.data;
                // applications are joined in backend, so data should contain 'applications' array
                setStudent(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!student) return <div className="p-8 text-center">Student not found</div>;

    const isOfficer = ['tnp_officer', 'admin'].includes(user.role);
    // Allow edit if officer OR if user is the student themselves (assuming user.user_id check eventually)
    // For now just officer check as per basic instructions, but typically student owns their profile
    const canEdit = isOfficer; // || (user.role === 'student' && user.email === student.email);

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white rounded shadow-md overflow-hidden">
                <div className="p-6 border-b flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">{student.name}</h1>
                        <p className="text-gray-600 text-lg">{student.roll_number}</p>
                    </div>
                    {canEdit && (
                        <Link to={`/students/${id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit Profile</Link>
                    )}
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b pb-2">Academic Info</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-gray-500 text-sm block">Branch</span>
                                <span className="font-semibold">{student.branch}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm block">Batch Year</span>
                                <span className="font-semibold">{student.batch_year}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm block">CGPA</span>
                                <span className="font-semibold">{student.cgpa}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm block">Backlogs</span>
                                <span className={`font-semibold ${student.has_backlogs ? 'text-red-500' : 'text-green-500'}`}>
                                    {student.has_backlogs ? `Yes (${student.backlog_count})` : 'None'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm block">Placement Status</span>
                                <span className={`font-semibold ${student.placement_status === 'Placed' ? 'text-green-600' : 'text-gray-600'}`}>
                                    {student.placement_status}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-gray-500 text-sm block mb-1">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {student.skills ? student.skills.split(',').map((skill, i) => (
                                    <span key={i} className="bg-blue-50 text-blue-800 px-3 py-1 rounded text-sm">{skill.trim()}</span>
                                )) : <span className="text-gray-400">No skills listed</span>}
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-gray-500 text-sm block mb-1">Contact Details</h3>
                            <p>📧 {student.email}</p>
                            <p>📱 {student.phone || 'N/A'}</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold border-b pb-2 mb-4">Applications History</h2>
                        {student.applications && student.applications.length > 0 ? (
                            <div className="space-y-4">
                                {student.applications.map(app => (
                                    <div key={app.application_id} className="border rounded p-3 hover:shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-800">{app.company_name}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${app.application_status === 'Selected' ? 'bg-green-100 text-green-800' :
                                                    app.application_status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-50 text-blue-800'
                                                }`}>
                                                {app.application_status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Applied: {new Date(app.applied_date).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No applications found.</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default StudentDetails;
