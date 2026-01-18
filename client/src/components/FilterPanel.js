import React, { useState } from 'react';

const FilterPanel = ({ onFilter, onReset }) => {
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        industry: '',
        city: '',
        job_type: '',
        sort_by: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Debounce or just update state and let parent handle submit?
        // For simplicity, we'll update state and trigger parent on form submission or effect
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilter(filters);
    };

    const handleReset = () => {
        setFilters({
            search: '',
            status: '',
            industry: '',
            city: '',
            job_type: '',
            sort_by: ''
        });
        onReset();
    };

    // Debouncing search could be done here with useEffect, but simple submit for now

    return (
        <div className="bg-white p-4 rounded shadow mb-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">

                <input
                    type="text"
                    name="search"
                    placeholder="Search company..."
                    value={filters.search}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                />

                <select
                    name="status"
                    value={filters.status}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Prospective">Prospective</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blacklisted">Blacklisted</option>
                </select>

                <input
                    type="text"
                    name="industry"
                    placeholder="Industry"
                    value={filters.industry}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                />

                <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={filters.city}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                />

                <select
                    name="job_type"
                    value={filters.job_type}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                >
                    <option value="">All Job Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Internship+PPO">Internship + PPO</option>
                </select>

                <select
                    name="sort_by"
                    value={filters.sort_by}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                >
                    <option value="">Sort By</option>
                    <option value="created_at">Date Added</option>
                    <option value="company_name">Name</option>
                    <option value="status">Status</option>
                </select>

                <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2 mt-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Apply Filters
                    </button>
                </div>

            </form>
        </div>
    );
};

export default FilterPanel;
