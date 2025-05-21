import { useEffect, useState } from "react";
import { FileUpload } from "@/components/ui/UploadFile"
import { Switch } from "@/components/ui/switch"
import SearchBar from "./SearchBar";
import EmailButton from './EmailButton';

export default function UploadResume() {
    const [showOverlay, setShowOverlay] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showShortlisted, setShowShortlisted] = useState(false);
    const [notifiedCandidates, setNotifiedCandidates] = useState(() => {
        const savedNotified = localStorage.getItem('notifiedCandidates');
        return savedNotified ? new Set(JSON.parse(savedNotified)) : new Set();
    });
    const [selectedColumns, setSelectedColumns] = useState({
        name: true,
        birthdate: false,
        location: false,
        'contact number': false,
        'email address': false,
        'contact links': false,
        education: true,
        'job experience': true,
        'curriculum activities': false,
        projects: false,
        skills: true,
        achievements: false,
        shortlisted: true
    });

    const handleColumnChange = (columnName) => {
        if (columnName === 'name' || columnName === 'shortlisted') return;
        setSelectedColumns(prev => ({
            ...prev,
            [columnName]: !prev[columnName]
        }));
    };

    const [emailSettings, setEmailSettings] = useState({
        autoSendEmails: false
    });

    // Update the nextInterviewTime state initialization
    const [nextInterviewTime, setNextInterviewTime] = useState(() => {
        const savedTime = localStorage.getItem('nextInterviewTime');
        if (savedTime) {
            return new Date(savedTime);
        }
        // Default to next Monday at 10 AM if no saved time
        const date = new Date();
        date.setDate(date.getDate() + ((1 + 7 - date.getDay()) % 7));  // Next Monday
        date.setHours(10, 0, 0, 0);  // Set to 10:00 AM
        return date;
    });

    useEffect(() => {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            setEmailSettings(JSON.parse(savedSettings));
        }
    }, []);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                // Get visible columns for display
                const visibleColumns = Object.entries(selectedColumns)
                    .filter(([_, isSelected]) => isSelected)
                    .map(([column]) => column);

                // Always include email address and name for functionality
                const requiredColumns = ['email address', 'name'];
                const allColumns = [...new Set([...visibleColumns, ...requiredColumns])];

                const columnsQuery = allColumns
                    .map(column => `columns=${encodeURIComponent(column)}`)
                    .join('&');

                const response = await fetch(
                    `https://api.jamaibase.com/api/v1/gen_tables/action/resume1/rows?${columnsQuery}`,
                    {
                        method: 'GET',
                        headers: {
                            accept: 'application/json',
                            authorization: `Bearer ${process.env.NEXT_PUBLIC_JAMAI_API_KEY}`,
                            'X-PROJECT-ID': process.env.NEXT_PUBLIC_JAMAI_PROJECT_ID
                        }
                    }
                );
                const data = await response.json();
                setResumes(data.items || []);
            } catch (error) {
                console.error('Error fetching resumes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResumes();
    }, [selectedColumns]); // Remove emailSettings and notifiedCandidates from dependencies

    // Add loading state
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!uploadedFiles.length) {
            alert("Please upload a file.");
            return;
        }

        setIsUploading(true); // Set loading state to true when upload starts
        const formData = new FormData();
        formData.append("file", uploadedFiles[0]);

        try {
            const response = await fetch("/api/upload-resume", {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            alert(result.message);
            setShowOverlay(false);
        } catch (error) {
            console.error("Error uploading:", error);
            alert("Upload failed");
        } finally {
            setIsUploading(false); // Reset loading state when upload completes
        }
    };

    const filteredResumes = resumes.filter(resume => {
        if (!resume) return false;
        if (showShortlisted && resume.shortlisted?.toLowerCase() !== 'yes') return false;
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return Object.entries(selectedColumns)
                .filter(([_, isSelected]) => isSelected) // Only search through selected columns
                .some(([column]) => {
                    const value = resume[column];
                    if (!value) return false;
                    return value.toString().toLowerCase().includes(query);
                });
        }
        return true;
    });

    const handleStatusChange = async (rowId, newStatus) => {
        try {
            const response = await fetch('https://api.jamaibase.com/api/v1/gen_tables/action/rows/update', {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    authorization: `Bearer ${process.env.NEXT_PUBLIC_JAMAI_API_KEY}`,
                    'X-PROJECT-ID': process.env.NEXT_PUBLIC_JAMAI_PROJECT_ID
                },
                body: JSON.stringify({
                    data: { shortlisted: newStatus },
                    table_id: 'resume1',
                    row_id: rowId
                })
            });

            if (!response.ok) throw new Error('Failed to update status');

            const updatedResumes = resumes.map(resume => 
                resume.ID === rowId 
                    ? { ...resume, shortlisted: newStatus }
                    : resume
            );
            setResumes(updatedResumes);

            const candidate = updatedResumes.find(r => r.ID === rowId);
            
            // Use the correct notification ID format for checking
            const notificationId = `${rowId}-${newStatus === 'yes' ? 'accept' : 'reject'}`;
            
            if (candidate && emailSettings.autoSendEmails && 
                newStatus === 'yes' && 
                !notifiedCandidates.has(notificationId)) {
                try {
                    await handleAutomatedEmail({
                        ...candidate,
                        ID: notificationId // Pass the correct notification ID
                    });
                    console.log('Automated email sent successfully');
                } catch (error) {
                    console.error('Failed to send automated email:', error);
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    // Update the handleAutomatedEmail function
    const handleAutomatedEmail = async (resume) => {
        if (notifiedCandidates.has(resume.ID)) {
            console.log('Email already sent to:', resume.name);
            return;
        }

        try {
            console.log('Sending automated email to:', resume.name, resume['email address']);
            
            // Get current time and calculate next time
            const currentTime = new Date(nextInterviewTime);
            let newTime = new Date(currentTime);
            newTime.setMinutes(newTime.getMinutes() + 90); // Add 1.5 hours

            // If time goes past 5 PM, move to next day at 10 AM
            if (newTime.getHours() >= 17) {
                newTime.setDate(newTime.getDate() + 1);
                newTime.setHours(10, 0, 0, 0);
            }

            // Skip weekends
            while (newTime.getDay() === 0 || newTime.getDay() === 6) {
                newTime.setDate(newTime.getDate() + 1);
                if (newTime.getDay() === 1) { // If Monday, reset to 10 AM
                    newTime.setHours(10, 0, 0, 0);
                }
            }

            // Define email content based on status
            const emailContent = resume.shortlisted?.toLowerCase() === 'yes' 
                ? {
                    subject: "Interview Invitation from TaleQ",
                    details: `Interview Schedule: ${currentTime.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}, ${currentTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    })}\n` +
                            "Location: TaleQ Office, Level 2, Building A\n" +
                            "Type: In-person interview\n" +
                            "Duration: 1 hour"
                }
                : {
                    subject: "Application Status Update from TaleQ",
                    details: "Thank you for your interest in joining TaleQ.\n" +
                            "After careful consideration, we regret to inform you that we will not be proceeding with your application at this time.\n" +
                            "We appreciate the time you invested in applying and wish you success in your future endeavors."
                };

            const response = await fetch('/api/notify-interview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: resume['email address'],
                    name: resume.name,
                    subject: emailContent.subject,
                    details: emailContent.details
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send automated email');
            }

            // Only update interview time for accepted candidates
            if (resume.shortlisted?.toLowerCase() === 'yes') {
                setNextInterviewTime(newTime);
                localStorage.setItem('nextInterviewTime', newTime.toISOString());
                console.log('Updated next interview time to:', newTime.toLocaleString());
            }

            // Add to notified set after successful send
            setNotifiedCandidates(prev => new Set([...prev, resume.ID]));
            console.log('Email sent and candidate marked as notified:', resume.name);
        } catch (error) {
            console.error('Error sending automated email:', error);
            throw error;
        }
    };

    // Save notified candidates whenever it changes
    useEffect(() => {
        localStorage.setItem('notifiedCandidates', JSON.stringify([...notifiedCandidates]));
    }, [notifiedCandidates]);

    // Add effect to save nextInterviewTime changes
    useEffect(() => {
        localStorage.setItem('nextInterviewTime', nextInterviewTime.toISOString());
    }, [nextInterviewTime]);

    if (loading) return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;

    return (
        <>
            <div className="w-full max-w-[100rem] mx-auto px-2 py-8">
                <div className="flex items-center justify-between mb-6 mt-3">
                    <div className="w-1/2">
                        <SearchBar value={searchQuery} onChange={setSearchQuery}/>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="shortlisted" className="text-sm text-gray-600">
                            Show Shortlisted Only
                        </label>
                        <Switch
                            id="shortlisted"
                            checked={showShortlisted}
                            onCheckedChange={setShowShortlisted}
                        />
                    </div>
                </div>

                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Display Columns:</h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedColumns).map(([column, isSelected]) => (
                            <button 
                                key={column}
                                onClick={() => handleColumnChange(column)}
                                disabled={column === 'name' || column === 'shortlisted'}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200
                                    ${isSelected
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    } ${(column === 'name' || column === 'shortlisted') 
                                        ? 'cursor-not-allowed bg-green-100 text-green-800' 
                                        : 'cursor-pointer'}`}
                            >
                                <span className="capitalize">
                                    {column}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

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
                                {/* Add the actions column header */}
                                {!emailSettings.autoSendEmails && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                        Actions
                                    </th>
                                )}
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
                                                    <div className="flex justify-center items-center">
                                                        <select
                                                            value={resume.shortlisted?.toLowerCase() || 'rejected'}
                                                            onChange={(e) => handleStatusChange(resume.ID, e.target.value)}
                                                            className={`py-1.5 rounded-full text-xs font-medium cursor-pointer border-0 outline-none w-28 text-center
                                                                ${['interviewed', 'offered', 'yes'].includes(resume.shortlisted?.toLowerCase())
                                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                                                                transition-colors duration-200`}
                                                            style={{ WebkitAppearance: 'none', appearance: 'none' }}
                                                        >
                                                            <option value="rejected" className="bg-gray-100 text-gray-800 font-medium">
                                                                Rejected
                                                            </option>
                                                            <option value="yes" className="bg-green-100 text-green-800 font-medium">
                                                                Shortlisted
                                                            </option>
                                                            <option value="interviewed" className="bg-green-100 text-green-800 font-medium">
                                                                Interviewed
                                                            </option>
                                                            <option value="offered" className="bg-green-100 text-green-800 font-medium">
                                                                Offered
                                                            </option>
                                                        </select>
                                                    </div>
                                                ) : (
                                                    resume[column]
                                                )}
                                            </td>
                                        ))}
                                    {!emailSettings.autoSendEmails && (
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
                                                    <button
                                                        disabled
                                                        className="p-1.5 rounded-full text-xs bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        title={['interviewed', 'offered'].includes(resume.shortlisted?.toLowerCase()) 
                                                            ? "Email already sent during shortlisting phase" 
                                                            : "Select status first"}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <button
                onClick={() => setShowOverlay(true)}
                className="fixed bottom-8 right-8 w-14 h-14 rounded-full 
                    bg-gradient-to-r from-green-600 to-[#1c843e] text-white 
                    shadow-lg hover:shadow-xl 
                    transition-all duration-300 
                    flex items-center justify-center text-2xl
                    hover:scale-110 hover:rotate-90
                    active:scale-95"
            >
                +
            </button>

            {showOverlay && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowOverlay(false)}
                >
                    <div
                        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Upload Resume
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="border-2 border-dashed border-gray-200 rounded-md p-4 hover:border-green-600 transition-colors">
                                <FileUpload onChange={(files) => setUploadedFiles(files)} />
                            </div>

                            <div className="flex gap-4 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowOverlay(false)}
                                    className="px-6 py-2 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                    disabled={isUploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-[#1c843e] text-white rounded-md 
                                        hover:from-[#1c843e] hover:to-green-600 transition-all duration-300 
                                        font-medium shadow-md hover:shadow-lg disabled:opacity-50 
                                        disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle 
                                                    className="opacity-25" 
                                                    cx="12" 
                                                    cy="12" 
                                                    r="10" 
                                                    stroke="currentColor" 
                                                    strokeWidth="4"
                                                />
                                                <path 
                                                    className="opacity-75" 
                                                    fill="currentColor" 
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                />
                                            </svg>
                                            Uploading...
                                        </>
                                    ) : (
                                        'Upload'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}