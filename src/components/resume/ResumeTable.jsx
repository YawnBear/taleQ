import React from 'react';
import EmailButton from '../ui/EmailButton';

export default function ResumeTable({
    filteredResumes,
    selectedColumns,
    handleStatusChange,
    notifiedCandidates,
    setNotifiedCandidates
}) {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden relative">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {Object.entries(selectedColumns)
                            .filter(([_, isSelected]) => isSelected)
                            .map(([column]) => (
                                <th 
                                    key={column}
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {column}
                                </th>
                            ))}
                        {/* Always show actions column */}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredResumes.map((resume, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            {Object.entries(selectedColumns)
                                .filter(([_, isSelected]) => isSelected)
                                .map(([column]) => (
                                    <td 
                                        key={column}
                                        className="px-4 py-4 text-sm text-gray-500"
                                    >
                                        {column === 'shortlisted' ? (
                                            <StatusSelector 
                                                resume={resume} 
                                                handleStatusChange={handleStatusChange} 
                                            />
                                        ) : (
                                            resume[column]
                                        )}
                                    </td>
                                ))}
                            {/* Always show email button */}
                            <td className="px-4 py-4 text-sm text-gray-500">
                                <div className="flex justify-center gap-2">
                                    {resume.shortlisted?.toLowerCase() === 'yes' ? (
                                        <EmailButton 
                                            candidateId={`${resume.ID}-accept`}
                                            email={resume['email address']}
                                            name={resume.name}
                                            type="accepted"
                                            onEmailSent={(id) => setNotifiedCandidates(prev => new Set([...prev, id]))}
                                            isNotified={notifiedCandidates.has(`${resume.ID}-accept`)}
                                        />
                                    ) : ['rejected', 'no'].includes(resume.shortlisted?.toLowerCase()) ? (
                                        <EmailButton 
                                            candidateId={`${resume.ID}-reject`}
                                            email={resume['email address']}
                                            name={resume.name}
                                            type="rejected"
                                            onEmailSent={(id) => setNotifiedCandidates(prev => new Set([...prev, id]))}
                                            isNotified={notifiedCandidates.has(`${resume.ID}-reject`)}
                                        />
                                    ) : (
                                        <EmailDisabled 
                                            status={resume.shortlisted?.toLowerCase()} 
                                        />
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function StatusSelector({ resume, handleStatusChange }) {
    return (
        <div className="flex justify-center items-center">
            <select
                value={resume.shortlisted?.toLowerCase() || 'pending'}
                onChange={(e) => handleStatusChange(resume.ID, e.target.value)}
                className={`py-1.5 rounded-full text-xs font-medium cursor-pointer border-0 outline-none w-28 text-center
                    ${resume.shortlisted?.toLowerCase() === 'yes' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : resume.shortlisted?.toLowerCase() === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : resume.shortlisted?.toLowerCase() === 'rejected'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : ['interviewed', 'offered'].includes(resume.shortlisted?.toLowerCase())
                              ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                    transition-colors duration-200`}
                style={{ WebkitAppearance: 'none', appearance: 'none' }}
            >
                <option value="pending" className="bg-yellow-100 text-yellow-800 font-medium">
                    Pending
                </option>
                <option value="rejected" className="bg-red-100 text-red-800 font-medium">
                    Rejected
                </option>
                <option value="yes" className="bg-green-100 text-green-800 font-medium">
                    Shortlisted
                </option>
                <option value="interviewed" className="bg-gray-100 text-gray-800 font-medium">
                    Interviewed
                </option>
                <option value="offered" className="bg-gray-100 text-gray-800 font-medium">
                    Offered
                </option>
            </select>
        </div>
    );
}

function EmailDisabled({ status }) {
    return (
        <button
            disabled
            className="p-1.5 rounded-full text-xs bg-gray-100 text-gray-400 cursor-not-allowed"
            title={['interviewed', 'offered'].includes(status) 
                ? "Email already sent during shortlisting phase" 
                : "Select status first"}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
        </button>
    );
}