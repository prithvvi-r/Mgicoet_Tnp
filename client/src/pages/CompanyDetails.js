import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { companyAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { toast } from 'react-toastify';

const CompanyDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [remark, setRemark] = useState('');

    const fetchCompany = async () => {
        try {
            const res = await companyAPI.getById(id);
            setCompany(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompany();
    }, [id]);

    const handleStatusChange = async (newStatus) => {
        try {
            if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

            await companyAPI.updateStatus(id, {
                status: newStatus,
                reason: prompt('Reason for status change:') || 'Status update'
            });
            toast.success('Status updated');
            fetchCompany();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddRemark = async (e) => {
        e.preventDefault();
        if (!remark.trim()) return;
        try {
            await companyAPI.addRemark(id, { remark_text: remark });
            toast.success('Remark added');
            setRemark('');
            fetchCompany();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!company) return <div className="p-8 text-center">Company not found</div>;

    const isOfficer = ['tnp_officer', 'admin'].includes(user.role);

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white rounded shadow-md overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-800">{company.company_name}</h1>
                            <StatusBadge status={company.status} />
                        </div>
                        <p className="text-gray-600">{company.industry} • {company.city}, {company.state}</p>
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">{company.website}</a>
                    </div>
                    {isOfficer && (
                        <div className="flex gap-2">
                            <Link to={`/companies/${id}/edit`} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Edit</Link>
                            <select
                                value={company.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="border rounded px-2 py-1 bg-gray-50 text-sm"
                            >
                                <option value="Active">Active</option>
                                <option value="Prospective">Prospective</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Blacklisted">Blacklisted</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        <section>
                            <h2 className="text-xl font-bold mb-3 border-b pb-2">Requirements</h2>
                            {company.requirements ? (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-semibold block">Branches Allowed:</span>
                                        {company.requirements.branches_allowed || 'All'}
                                    </div>
                                    <div>
                                        <span className="font-semibold block">CGPA Cutoff:</span>
                                        {company.requirements.cgpa_cutoff}
                                    </div>
                                    <div>
                                        <span className="font-semibold block">Backlogs:</span>
                                        {company.requirements.backlogs_allowed ? `Allowed (Max ${company.requirements.max_backlogs})` : 'Not Allowed'}
                                    </div>
                                    <div>
                                        <span className="font-semibold block">Job Type:</span>
                                        {company.requirements.job_type}
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-semibold block">CTC Range:</span>
                                        {company.requirements.ctc_min} - {company.requirements.ctc_max} LPA
                                        {company.requirements.stipend > 0 && ` (Stipend: ${company.requirements.stipend})`}
                                    </div>
                                    <div className="col-span-2 bg-gray-50 p-3 rounded">
                                        <span className="font-semibold block mb-1">Required Skills:</span>
                                        {company.requirements.required_skills}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No requirements specified yet.</p>
                            )}
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3 border-b pb-2">Remarks</h2>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {company.remarks && company.remarks.length > 0 ? (
                                    company.remarks.map(r => (
                                        <div key={r.remark_id} className="bg-gray-50 p-3 rounded border text-sm">
                                            <p className="text-gray-800">{r.remark_text}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                By {r.username} on {new Date(r.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No remarks yet.</p>
                                )}
                            </div>

                            {isOfficer && (
                                <form onSubmit={handleAddRemark} className="mt-4 flex gap-2">
                                    <input
                                        type="text"
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                        placeholder="Add a remark..."
                                        className="flex-1 border rounded px-3 py-2 text-sm"
                                    />
                                    <button type="submit" className="bg-gray-700 text-white px-3 py-2 rounded text-sm hover:bg-gray-800">Add</button>
                                </form>
                            )}
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <section>
                            <h2 className="text-xl font-bold mb-3 border-b pb-2">HR Contacts</h2>
                            <div className="space-y-3">
                                {company.contacts && company.contacts.length > 0 ? (
                                    company.contacts.map(contact => (
                                        <div key={contact.hr_id} className={`p-3 rounded border ${contact.is_primary ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                                            <p className="font-semibold text-gray-800">{contact.hr_name}</p>
                                            <p className="text-sm text-gray-600">{contact.hr_designation}</p>
                                            <div className="mt-2 text-xs space-y-1">
                                                <p>📧 <a href={`mailto:${contact.hr_email}`} className="text-blue-600 hover:underline">{contact.hr_email}</a></p>
                                                <p>📱 {contact.hr_phone}</p>
                                            </div>
                                            {contact.is_primary && <span className="text-xs bg-blue-200 text-blue-800 px-1 rounded ml-auto block w-fit mt-1">Primary</span>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 text-sm">No contacts added.</div>
                                )}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3 border-b pb-2">Placement History</h2>
                            {company.placement_history && company.placement_history.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="text-gray-500 border-b">
                                            <th className="pb-1">Year</th>
                                            <th className="pb-1">Hired</th>
                                            <th className="pb-1">Avg</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {company.placement_history.map(h => (
                                            <tr key={h.history_id} className="border-b last:border-0">
                                                <td className="py-2">{h.year}</td>
                                                <td className="py-2">{h.students_hired}</td>
                                                <td className="py-2">{h.avg_package}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-500 text-sm">No placement history.</p>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetails;
