import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentAPI } from '../services/api';
import { toast } from 'react-toastify';

const StudentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        roll_number: '',
        name: '',
        email: '',
        phone: '',
        branch: '',
        batch_year: '',
        cgpa: '',
        has_backlogs: false,
        backlog_count: 0,
        skills: '',
        placement_status: 'Unplaced'
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            const fetchStudent = async () => {
                try {
                    const res = await studentAPI.getById(id);
                    setFormData(res.data.data);
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to fetch student data");
                }
            };
            fetchStudent();
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await studentAPI.update(id, formData);
                toast.success('Student updated successfully');
            } else {
                await studentAPI.create(formData);
                toast.success('Student created successfully');
            }
            navigate('/students');
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Failed to save student';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">{isEdit ? 'Edit Student' : 'Add New Student'}</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Roll Number *</label>
                        <input type="text" name="roll_number" value={formData.roll_number} onChange={handleChange} required className="w-full border p-2 rounded" disabled={isEdit} />
                        {isEdit && <p className="text-xs text-gray-400 mt-1">Roll Number cannot be changed</p>}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Email *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Phone</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Branch *</label>
                        <input type="text" name="branch" value={formData.branch} onChange={handleChange} required className="w-full border p-2 rounded" placeholder="E.g., CS, IT" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Batch Year *</label>
                        <input type="number" name="batch_year" value={formData.batch_year} onChange={handleChange} required className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">CGPA *</label>
                        <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} required className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Placement Status</label>
                        <select name="placement_status" value={formData.placement_status} onChange={handleChange} className="w-full border p-2 rounded">
                            <option value="Unplaced">Unplaced</option>
                            <option value="Placed">Placed</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                    <div className="flex items-center gap-4 mb-3">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold">
                            <input type="checkbox" name="has_backlogs" checked={formData.has_backlogs} onChange={handleChange} />
                            Has Backlogs?
                        </label>
                    </div>
                    {formData.has_backlogs && (
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Backlog Count</label>
                            <input type="number" name="backlog_count" value={formData.backlog_count} onChange={handleChange} className="w-full border p-2 rounded max-w-xs" />
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Skills (comma separated)</label>
                    <textarea name="skills" value={formData.skills} onChange={handleChange} className="w-full border p-2 rounded h-20" placeholder="React, Node.js, C++, Java"></textarea>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={() => navigate('/students')} className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Student'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentForm;
