import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const CompanyCard = ({ company }) => {
    return (
        <Link to={`/companies/${company.company_id}`} className="block">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{company.company_name}</h3>
                    <StatusBadge status={company.status} />
                </div>

                <div className="text-sm text-gray-600 mb-2">
                    <p>{company.industry} • {company.city}</p>
                </div>

                {company.latest_remark && (
                    <div className="text-xs bg-yellow-50 p-2 rounded text-gray-700 italic mb-3">
                        "{company.latest_remark}"
                    </div>
                )}

                <div className="flex justify-between items-center text-sm">
                    <div className="text-blue-600 font-medium">
                        View Details
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CompanyCard;
