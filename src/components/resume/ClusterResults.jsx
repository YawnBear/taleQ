import { useState } from 'react';

export default function ClusterResults({ clusteredResults, handleStatusChange }) {
    const [expandedGroups, setExpandedGroups] = useState({});
    
    if (!clusteredResults) return null;
    
    const { groups, summary } = clusteredResults;
    
    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };
    
    return (
        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-r from-green-50 to-white">
                <h2 className="text-lg font-semibold text-gray-800">Cluster Analysis Results</h2>
            </div>
            
            {summary && (
                <div className="p-4 bg-green-50 border-b border-green-100">
                    <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
                    <p className="text-sm text-gray-700">{summary}</p>
                </div>
            )}
            
            <div className="divide-y divide-gray-200">
                {groups && groups.map((group, index) => (
                    <div key={index} className="bg-white">
                        <div 
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleGroup(index)}
                        >
                            <div>
                                <h3 className="font-medium text-gray-900">{group.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                                <div className="mt-2 text-xs text-gray-500">
                                    {group.candidates.length} candidate{group.candidates.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                                <span className="text-gray-500">
                                    {expandedGroups[index] ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </span>
                            </div>
                        </div>
                        
                        {expandedGroups[index] && (
                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Education</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {group.candidates.map((candidate) => (
                                            <tr key={candidate.ID} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 text-sm text-gray-900">{candidate.name}</td>
                                                <td className="px-3 py-2 text-sm text-gray-500">
                                                    {candidate.education?.length > 100 
                                                        ? `${candidate.education.substring(0, 100)}...` 
                                                        : candidate.education || "N/A"}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-500">
                                                    {candidate.skills?.length > 100 
                                                        ? `${candidate.skills.substring(0, 100)}...` 
                                                        : candidate.skills || "N/A"}
                                                </td>
                                                <td className="px-3 py-2 text-sm">
                                                    <select
                                                        value={candidate.shortlisted?.toLowerCase() || 'pending'}
                                                        onChange={(e) => handleStatusChange(candidate.ID, e.target.value)}
                                                        className={`py-1 px-2 rounded-full text-xs font-medium cursor-pointer border-0 outline-none
                                                            ${candidate.shortlisted?.toLowerCase() === 'yes' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : candidate.shortlisted?.toLowerCase() === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : candidate.shortlisted?.toLowerCase() === 'rejected'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="yes">Shortlisted</option>
                                                        <option value="rejected">Rejected</option>
                                                        <option value="interviewed">Interviewed</option>
                                                        <option value="offered">Offered</option>
                                                    </select>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-500">{candidate.matchReason || "N/A"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}