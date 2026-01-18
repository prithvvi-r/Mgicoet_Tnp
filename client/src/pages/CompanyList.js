import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { companyAPI } from '../services/api';
import CompanyCard from '../components/CompanyCard';
import FilterPanel from '../components/FilterPanel';
import { AuthContext } from '../context/AuthContext';

const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const { user } = useContext(AuthContext);

    const fetchCompanies = async (filterParams = {}) => {
        setLoading(true);
        try {
            const res = await companyAPI.getAll(filterParams);
            setCompanies(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleFilter = (newFilters) => {
        setFilters(newFilters);
        fetchCompanies(newFilters);
    };

    const handleReset = () => {
        setFilters({});
        fetchCompanies({});
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Companies</h1>
                {['tnp_officer', 'admin'].includes(user.role) && (
                    <Link
                        to="/companies/new"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow"
                    >
                        + Add Company
                    </Link>
                )}
            </div>

            <FilterPanel onFilter={handleFilter} onReset={handleReset} />

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <>
                    {companies.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No companies found.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {companies.map(company => (
                                <CompanyCard key={company.company_id} company={company} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CompanyList;
