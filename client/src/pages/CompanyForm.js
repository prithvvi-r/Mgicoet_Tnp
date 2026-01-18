import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { companyAPI } from '../services/api';
import { toast } from 'react-toastify';

const CompanyForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        company_name: '',
        industry: '',
        city: '',
        state: '',
        company_size: '',
        website: '',
        contacts: [],
        requirements: {
            branches_allowed: '',
            cgpa_cutoff: '',
            backlogs_allowed: false,
            max_backlogs: 0,
            required_skills: '',
            job_type: 'Full-time',
            ctc_min: '',
            ctc_max: '',
            stipend: ''
        }
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            const fetchCompany = async () => {
                try {
                    const res = await companyAPI.getById(id);
                    const data = res.data.data;
                    setFormData({
                        ...data,
                        requirements: data.requirements || { ...formData.requirements }
                    });
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to fetch company data");
                }
            };
            fetchCompany();
        } else {
            // Add one empty contact by default for new companies
            setFormData(prev => ({
                ...prev,
                contacts: [{ hr_name: '', hr_email: '', hr_phone: '', hr_designation: '', is_primary: true }]
            }));
        }
    }, [id, isEdit]);

    const handleChange = (e, section = null) => {
        const { name, value, type, checked } = e.target;
        if (section === 'requirements') {
            setFormData(prev => ({
                ...prev,
                requirements: {
                    ...prev.requirements,
                    [name]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleContactChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const newContacts = [...formData.contacts];
        newContacts[index] = {
            ...newContacts[index],
            [name]: type === 'checkbox' ? checked : value
        };
        // Ensure only one primary
        if (name === 'is_primary' && checked) {
            newContacts.forEach((c, i) => {
                if (i !== index) c.is_primary = false;
            });
        }
        setFormData({ ...formData, contacts: newContacts });
    };

    const addContact = () => {
        setFormData({
            ...formData,
            contacts: [...formData.contacts, { hr_name: '', hr_email: '', hr_phone: '', hr_designation: '', is_primary: false }]
        });
    };

    const removeContact = (index) => {
        const newContacts = formData.contacts.filter((_, i) => i !== index);
        setFormData({ ...formData, contacts: newContacts });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await companyAPI.update(id, formData);
                toast.success('Company updated successfully');
            } else {
                await companyAPI.create(formData);
                toast.success('Company created successfully');
            }
            navigate('/companies');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save company');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">{isEdit ? 'Edit Company' : 'Add New Company'}</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-8">
                {/* Basic Details */}
                <section>
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Basic Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Company Name *</label>
                            <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Industry</label>
                            <input type="text" name="industry" value={formData.industry} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Website</label>
                            <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">State</label>
                            <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Company Size</label>
                            <select name="company_size" value={formData.company_size} onChange={handleChange} className="w-full border p-2 rounded">
                                <option value="">Select Size</option>
                                <option value="Startup">Startup (1-50)</option>
                                <option value="Mid-Size">Mid-Size (50-200)</option>
                                <option value="Large">Large (200-1000)</option>
                                <option value="MNC">MNC (1000+)</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Requirements */}
                <section>
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">Requirements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Job Type</label>
                            <select name="job_type" value={formData.requirements.job_type} onChange={(e) => handleChange(e, 'requirements')} className="w-full border p-2 rounded">
                                <option value="Full-time">Full-time</option>
                                <option value="Internship">Internship</option>
                                <option value="Internship+PPO">Internship + PPO</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Minimum CTC/Stipend</label>
                            <input type="number" name="ctc_min" value={formData.requirements.ctc_min} onChange={(e) => handleChange(e, 'requirements')} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Maximum CTC</label>
                            <input type="number" name="ctc_max" value={formData.requirements.ctc_max} onChange={(e) => handleChange(e, 'requirements')} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">CGPA Cutoff</label>
                            <input type="number" step="0.1" name="cgpa_cutoff" value={formData.requirements.cgpa_cutoff} onChange={(e) => handleChange(e, 'requirements')} className="w-full border p-2 rounded" />
                        </div>
                        <div className="flex items-center gap-4 py-8">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="backlogs_allowed" checked={formData.requirements.backlogs_allowed} onChange={(e) => handleChange(e, 'requirements')} />
                                <span className="text-sm text-gray-700">Allow Backlogs?</span>
                            </label>
                        </div>
                        {formData.requirements.backlogs_allowed && (
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Max Backlogs</label>
                                <input type="number" name="max_backlogs" value={formData.requirements.max_backlogs} onChange={(e) => handleChange(e, 'requirements')} className="w-full border p-2 rounded" />
                            </div>
                        )}
                        <div className="md:col-span-3">
                            <label className="block text-sm text-gray-600 mb-1">Allowed Branches (comma separated)</label>
                            <input type="text" name="branches_allowed" value={formData.requirements.branches_allowed} onChange={(e) => handleChange(e, 'requirements')} placeholder="CS, IT, ENTC" className="w-full border p-2 rounded" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm text-gray-600 mb-1">Required Skills</label>
                            <textarea name="required_skills" value={formData.requirements.required_skills} onChange={(e) => handleChange(e, 'requirements')} className="w-full border p-2 rounded h-20"></textarea>
                        </div>
                    </div>
                </section>

                {/* Contacts */}
                <section>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-xl font-bold text-gray-700">HR Contacts</h2>
                        <button type="button" onClick={addContact} className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">Add Contact</button>
                    </div>
                    <div className="space-y-4">
                        {formData.contacts.map((contact, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-gray-50 p-3 rounded relative">
                                <div className="md:col-span-1">
                                    <input type="text" name="hr_name" value={contact.hr_name} onChange={(e) => handleContactChange(index, e)} placeholder="Name" className="w-full border p-2 rounded text-sm" required />
                                </div>
                                <div className="md:col-span-1">
                                    <input type="email" name="hr_email" value={contact.hr_email} onChange={(e) => handleContactChange(index, e)} placeholder="Email" className="w-full border p-2 rounded text-sm" required />
                                </div>
                                <div className="md:col-span-1">
                                    <input type="text" name="hr_phone" value={contact.hr_phone} onChange={(e) => handleContactChange(index, e)} placeholder="Phone" className="w-full border p-2 rounded text-sm" />
                                </div>
                                <div className="md:col-span-1">
                                    <input type="text" name="hr_designation" value={contact.hr_designation} onChange={(e) => handleContactChange(index, e)} placeholder="Designation" className="w-full border p-2 rounded text-sm" />
                                </div>
                                <div className="flex items-center justify-between md:justify-start gap-3">
                                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                                        <input type="checkbox" name="is_primary" checked={contact.is_primary} onChange={(e) => handleContactChange(index, e)} />
                                        Primary
                                    </label>
                                    {formData.contacts.length > 1 && (
                                        <button type="button" onClick={() => removeContact(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={() => navigate('/companies')} className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Company'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CompanyForm;
