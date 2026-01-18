import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../services/api';
import StudentCard from '../components/StudentCard';
import { AuthContext } from '../context/AuthContext';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [filters, setFilters] = useState({
        search: '',
        branch: '',
        batch_year: '',
        placement_status: '',
        sort_by: '' // sort_by field in API
    });

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await studentAPI.getAll(filters);
            setStudents(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [filters]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const isOfficer = ['tnp_officer', 'admin'].includes(user.role);

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Students</h1>
                {isOfficer && (
                    <Link
                        to="/students/new"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow"
                    >
                        + Add Student
                    </Link>
                )}
            </div>

            <div className="bg-white p-4 rounded shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search name/roll no..."
                        value={filters.search}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        name="branch"
                        placeholder="Branch"
                        value={filters.branch}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                    <input
                        type="number"
                        name="batch_year"
                        placeholder="Batch Year"
                        value={filters.batch_year}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    />
                    <select
                        name="placement_status"
                        value={filters.placement_status}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    >
                        <option value="">Status</option>
                        <option value="Unplaced">Unplaced</option>
                        <option value="Placed">Placed</option>
                    </select>
                    <select
                        name="sort_by"
                        value={filters.sort_by}
                        onChange={handleChange}
                        className="p-2 border rounded"
                    >
                        <option value="">Sort By</option>
                        <option value="cgpa">CGPA</option>
                        <option value="name">Name</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <>
                    {students.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No students found.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {students.map(student => (
                                <StudentCard key={student.student_id} student={student} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentList;
