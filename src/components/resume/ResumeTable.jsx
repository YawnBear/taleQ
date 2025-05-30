import React, { useState } from 'react';
import { ChevronDown, ChevronUp} from 'lucide-react';
import EmailButton from '../ui/EmailButton';
import ResumeDetailsOverlay from './ResumeDetailsOverlay';
import {
  parseContactLinks,
  parseEducation,
  parseJobExperience,
  parseCurriculumActivities,
  parseSkills,
  parseAchievements,
  parseShortlistedReasons
} from '../../utils/resumeParser';

export default function ResumeTable({
    filteredResumes,
    selectedColumns,
    handleStatusChange,
    notifiedCandidates,
    setNotifiedCandidates,
    handleColumnChange,
    onDeleteResume
}) {
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicateChecking, setIsDuplicateChecking] = useState(false);
    const [selectedResumeId, setSelectedResumeId] = useState(null);

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

    const findDuplicates = () => {
        const duplicates = [];
        const seen = new Map();
        
        filteredResumes.forEach((resume) => {
            const name = resume.name?.toLowerCase().trim();
            const email = resume['email address']?.toLowerCase().trim();
            
            // Skip if name or email is missing
            if (!name || !email) return;
            
            const key = `${name}|${email}`;
            
            if (seen.has(key)) {
                // Mark both the original and duplicate
                const original = seen.get(key);
                duplicates.push({
                    original: original,
                    duplicate: resume,
                    name: resume.name,
                    email: resume['email address']
                });
            } else {
                seen.set(key, resume);
            }
        });
        
        return duplicates;
    };

    const handleRemoveDuplicates = async () => {
        setIsDuplicateChecking(true);
        
        try {
            const duplicates = findDuplicates();
            
            if (duplicates.length === 0) {
                alert("No duplicates found!");
                return;
            }

            const duplicateDetails = duplicates.map(dup => 
                `${dup.name} (${dup.email})`
            ).join('\n');

            const confirmDelete = window.confirm(
                `Found ${duplicates.length} duplicate resume(s):\n\n${duplicateDetails}\n\nDelete the duplicate entries? This action cannot be undone.`
            );

            if (!confirmDelete) return;

            // Extract IDs of duplicate resumes to delete (keep the original, delete the duplicate)
            const duplicateIds = duplicates.map(dup => dup.duplicate.ID);

            // Delete duplicates from backend
            const deletePromises = duplicateIds.map(async (resumeId) => {
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

            alert(`Successfully removed ${deletedIds.length} duplicate resume(s).`);
        } catch (error) {
            console.error("Duplicate removal error:", error);
            alert(`Failed to remove duplicates: ${error.message}`);
        } finally {
            setIsDuplicateChecking(false);
        }
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

    // Get duplicate count for display
    const duplicateCount = findDuplicates().length;

    // Helper function to get parsed cell value
    const getCellValue = (resume, column) => {
        const rawValue = resume[column]?.value || resume[column];
        
        try {
            switch (column) {
                case 'contact links':
                    return parseContactLinks(rawValue);
                case 'education':
                    return parseEducation(rawValue);
                case 'job experience':
                    return parseJobExperience(rawValue);
                case 'curriculum activities':
                    return parseCurriculumActivities(rawValue);
                case 'skills':
                    return parseSkills(rawValue);
                case 'achievements':
                    return parseAchievements(rawValue);
                case 'shortlisted reasons':
                    return parseShortlistedReasons(rawValue);
                case 'projects':
                    return rawValue === null || rawValue === 'null' || !rawValue ? 'No projects listed' : rawValue;
                case 'email address':
                    return rawValue === null || rawValue === 'null' || !rawValue ? 'No email listed' : rawValue;
                default:
                    return rawValue || '';
            }
        } catch (error) {
            console.error(`Error parsing ${column}:`, error);
            console.error('Raw value:', rawValue);
            return `Error parsing ${column}`;
        }
    };
    //displace column
    const [showColumns, setShowColumns] = useState(false);

    
    // Helper function to render skills with special formatting
    const renderSkillsContent = (skillsText) => {
        if (!skillsText || skillsText === 'No skills listed') {
            return <span className="text-gray-400 italic">{skillsText}</span>;
        }

        const sections = skillsText.split('\n\n');
        
        return (
            <div className="space-y-3">
                {sections.map((section, index) => {
                    const lines = section.split('\n');
                    const category = lines[0];
                    const skills = lines[1];
                    
                    if (!skills) return null;
                    
                    const skillArray = skills.split(', ');
                    
                    return (
                        <div key={index} className="space-y-1">
                            <div className="text-sm text-gray-700">
                                {category}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {skillArray.map((skill, skillIndex) => (
                                    <span
                                        key={skillIndex}
                                        className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                                    >
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden relative">
            {/* Action Bar */}
            <div className="bg-gray-50 px-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {/* Selected resumes info */}
                    {selectedRows.size > 0 && (
                        <span className="text-red-700 text-sm font-medium">
                            {selectedRows.size} resume(s) selected
                        </span>
                    )}
                    
                    {/* Duplicate info */}
                    {duplicateCount > 0 && (
                        <span className="text-orange-700 text-sm font-medium">
                            {duplicateCount} duplicate(s) found
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    {/* Remove Duplicates Button */}
                    {duplicateCount > 0 && (
                        <button
                            onClick={handleRemoveDuplicates}
                            disabled={isDuplicateChecking}
                            className="px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 
                                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isDuplicateChecking ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Removing...
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Remove Duplicates ({duplicateCount})
                                </>
                            )}
                        </button>
                    )}

                    {/* Delete Selected Button */}
                    {selectedRows.size > 0 && (
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
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                    )}
                </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200">       
                <thead className="bg-gray-50">
                    {/* Display Columns Toggle Section */}
                     <tr>
                        <th
                            colSpan={Object.values(selectedColumns).filter(Boolean).length + 2}
                            className="bg-gray-50 px-4 py-4"
                        >
                            <div className="bg-gray-50">
                                <div 
                                    className="flex justify-between items-center cursor-pointer"
                                    onClick={() => setShowColumns(!showColumns)}
                                >
                                    <h3 className="text-sm font-medium text-gray-700">Display Columns:</h3>
                                    {showColumns ? (
                                        <ChevronUp className="w-4 h-4 text-gray-600" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                    )}
                                </div>

                                {showColumns && (
                                    <div className="flex flex-wrap gap-4 mt-3">
                                        {Object.entries(selectedColumns).map(([column, isSelected]) => (
                                            <button 
                                                key={column}
                                                onClick={() => handleColumnChange(column)}
                                                disabled={column === 'name' || column === 'shortlisted'}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200
                                                    ${isSelected
                                                        ? 'bg-emerald-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    } ${(column === 'name' || column === 'shortlisted') 
                                                        ? 'cursor-not-allowed bg-emerald-100 text-green-800' 
                                                        : 'cursor-pointer'}`}
                                            >
                                                <span className="capitalize">
                                                    {column}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </th>
                    </tr>
                    <tr>
                        {/* Select All Checkbox */}
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
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
                                    className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                        column === 'name' ? 'text-center' : 'text-left'
                                    }`}
                                >
                                    {column}
                                </th>
                            ))}
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredResumes.map((resume, index) => {
                        const isDuplicate = findDuplicates().some(dup => dup.duplicate.ID === resume.ID);

                        return (
                            <tr key={resume.ID || index} className={`hover:bg-gray-50 ${isDuplicate ? 'bg-orange-50' : ''}`}>
                                <td className="px-4 py-4 text-sm text-gray-500 text-center">
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
                                            className={`px-4 py-4 text-sm text-gray-500 align-top ${
                                                column === 'name' ? 'text-center' : 'text-left'
                                            }`}
                                        >
                                            {column === 'name' ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedResumeId(resume.ID)}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium focus:outline-none"
                                                    >
                                                        {getCellValue(resume, column)}
                                                    </button>
                                                    {isDuplicate && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                                            Duplicate
                                                        </span>
                                                    )}
                                                </div>
                                            ) : column === 'shortlisted' ? (
                                                <StatusSelector 
                                                    resume={resume} 
                                                    handleStatusChange={handleStatusChange} 
                                                />
                                            ) : column === 'skills' ? (
                                                renderSkillsContent(getCellValue(resume, column))
                                            ) : (
                                                <div 
                                                    className="whitespace-pre-line text-sm leading-relaxed" 
                                                    title={getCellValue(resume, column)}
                                                >
                                                    {getCellValue(resume, column)}
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                <td className="px-4 py-4 text-sm text-gray-500 align-top text-center">
                                    <div className="flex justify-center gap-2">
                                        {resume.shortlisted?.toLowerCase() === 'yes' ? (
                                            <EmailButton 
                                                candidateId={`${resume.ID}-accept`}
                                                email={resume['email address']?.value || resume['email address']}
                                                name={resume.name?.value || resume.name}
                                                type="accepted"
                                                onEmailSent={(id) => setNotifiedCandidates(prev => new Set([...prev, id]))}
                                                isNotified={notifiedCandidates.has(`${resume.ID}-accept`)}
                                            />
                                        ) : ['rejected', 'no'].includes(resume.shortlisted?.toLowerCase()) ? (
                                            <EmailButton 
                                                candidateId={`${resume.ID}-reject`}
                                                email={resume['email address']?.value || resume['email address']}
                                                name={resume.name?.value || resume.name}
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

            {/* Resume Details Overlay */}
            {selectedResumeId && (
                <ResumeDetailsOverlay
                    resumeId={selectedResumeId}
                    onClose={() => setSelectedResumeId(null)}
                />
            )}
        </div>
    );
}

function StatusSelector({ resume, handleStatusChange }) {
    const currentStatus = resume.shortlisted?.toLowerCase() || 'pending';
    
    return (
        <div className="flex justify-center items-center">
            <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(resume.ID, e.target.value)}
                className={`py-1.5 px-3 rounded-full text-xs font-medium cursor-pointer 
                    border-0 outline-none w-32 text-center
                    focus:ring-2 focus:ring-offset-1
                    ${currentStatus === 'yes' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-300'
                        : currentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-300'
                          : currentStatus === 'rejected'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-300'
                            : ['interviewed', 'offered'].includes(currentStatus)
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-300'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-300'}
                    transition-all duration-200 shadow-sm hover:shadow-md
                    appearance-none bg-no-repeat bg-right bg-[length:12px_12px]`}
                style={{ 
                    WebkitAppearance: 'none', 
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 8px center',
                    paddingRight: '28px'
                }}
            >
                <option 
                    value="pending" 
                    className="bg-yellow-100 text-yellow-800 font-medium"
                    style={{ backgroundColor: '#fef3c7', color: '#92400e' }}
                >
                    Pending
                </option>
                <option 
                    value="rejected" 
                    className="bg-red-100 text-red-800 font-medium"
                    style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
                >
                    Rejected
                </option>
                <option 
                    value="yes" 
                    className="bg-green-100 text-green-800 font-medium"
                    style={{ backgroundColor: '#dcfce7', color: '#166534' }}
                >
                    Shortlisted
                </option>
                <option 
                    value="interviewed" 
                    className="bg-blue-100 text-blue-800 font-medium"
                    style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}
                >
                    Interviewed
                </option>
                <option 
                    value="offered" 
                    className="bg-blue-100 text-blue-800 font-medium"
                    style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}
                >
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