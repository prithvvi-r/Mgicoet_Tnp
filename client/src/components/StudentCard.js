import React from 'react';
import { Link } from 'react-router-dom';

const StudentCard = ({ student }) => {
    return (
        <Link to={`/students/${student.student_id}`} className="block">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{student.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${student.placement_status === 'Placed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {student.placement_status}
                    </span>
                </div>

                <div className="text-sm text-gray-600 mb-2">
                    <p>{student.branch} • {student.batch_year}</p>
                    <p>Roll No: {student.roll_number}</p>
                </div>

                <div className="mt-2 text-sm text-gray-800">
                    <span className="font-semibold">CGPA:</span> {student.cgpa}
                </div>

                <div className="mt-4 flex flex-wrap gap-1">
                    {student.skills && student.skills.split(',').slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{skill.trim()}</span>
                    ))}
                    {student.skills && student.skills.split(',').length > 3 && (
                        <span className="text-xs text-gray-400 px-2 py-1">+more</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default StudentCard;
