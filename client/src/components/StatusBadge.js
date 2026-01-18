import React from 'react';

const StatusBadge = ({ status }) => {
    let colorClass = 'bg-gray-100 text-gray-800';

    switch (status) {
        case 'Active':
            colorClass = 'bg-green-100 text-green-800';
            break;
        case 'Inactive':
            colorClass = 'bg-gray-100 text-gray-800';
            break;
        case 'Blacklisted':
            colorClass = 'bg-red-100 text-red-800';
            break;
        case 'Prospective':
            colorClass = 'bg-blue-100 text-blue-800';
            break;
        default:
            break;
    }

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
