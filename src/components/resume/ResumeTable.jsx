import React, { useState } from 'react';
import EmailButton from '../ui/EmailButton';

export default function ResumeTable({
    filteredResumes,
    selectedColumns,
    handleStatusChange,
    notifiedCandidates,
    setNotifiedCandidates,
    onDeleteResume
}) {
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(new Set(filteredResumes.map(resume => resume.ID)));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleRowSelect = (resumeId) => {
        const newSelectedRows = new Set(selectedRows);
        if (newSelectedRows.has(resumeId)) {
            newSelectedRows.delete(resumeId);
        } else {
            newSelectedRows.add(resumeId);
        }
        setSelectedRows(newSelectedRows);
    };

    const handleDeleteSelected = async () => {
        if (selectedRows.size === 0) {
            alert("Please select at least one resume to delete.");
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${selectedRows.size} resume(s)? This action cannot be undone.`
        );

        if (!confirmDelete) return;

        setIsDeleting(true);
        
        try {
            // Delete each selected resume
            const deletePromises = Array.from(selectedRows).map(async (resumeId) => {
                const response = await fetch('/api/delete-resume', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ resumeId })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Failed to delete resume ${resumeId}: ${errorData.message}`);
                }

                return resumeId;
            });

            const deletedIds = await Promise.all(deletePromises);
            
            // Notify parent component to update the resume list
            if (onDeleteResume) {
                onDeleteResume(deletedIds);
            }

            // Clear selection
            setSelectedRows(new Set());
            
            alert(`Successfully deleted ${deletedIds.length} resume(s).`);
        } catch (error) {
            console.error("Delete error:", error);
            alert(`Failed to delete resumes: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden relative">
            {/* Delete Button */}
            {selectedRows.size > 0 && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex justify-between items-center">
                    <span className="text-red-700 text-sm font-medium">
                        {selectedRows.size} resume(s) selected
                    </span>
                    <button
                        onClick={handleDeleteSelected}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 
                                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Selected
                            </>
                        )}
                    </button>
                </div>
            )}

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {/* Select All Checkbox */}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                            <input
                                type="checkbox"
                                checked={selectedRows.size === filteredResumes.length && filteredResumes.length > 0}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                        </th>
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
                        {/* Actions column - made wider to fit both buttons */}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredResumes.map((resume, index) => {

                        
                        return (
                            <tr key={resume.ID || index} className="hover:bg-gray-50">
                                {/* Individual Row Checkbox */}
                                <td className="px-4 py-4 text-sm text-gray-500">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.has(resume.ID)}
                                        onChange={() => handleRowSelect(resume.ID)}
                                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                </td>
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
                                {/* Actions column with email and view PDF buttons */}
                                <td className="px-4 py-4 text-sm text-gray-500">
                                    <div className="flex justify-center gap-2">
                                        {/* Email Button - unchanged */}
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
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function StatusSelector({ resume, handleStatusChange }) {
    // Get the current status, defaulting to 'pending' if null/undefined
    const currentStatus = resume.shortlisted?.toLowerCase() || 'pending';
    
    return (
        <div className="flex justify-center items-center">
            <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(resume.ID, e.target.value)}
                className={`py-1.5 rounded-full text-xs font-medium cursor-pointer border-0 outline-none w-28 text-center
                    ${currentStatus === 'yes' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : currentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : currentStatus === 'rejected'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : ['interviewed', 'offered'].includes(currentStatus)
                              ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'} // Default fallback to pending style
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