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
    const [notifiedCandidates, setNotifiedCandidates] = useState(new Set());
    const [selectedColumns, setSelectedColumns] = useState({
        name: true,
        'contact number': false,
        'email address': false,
        'contact links': false,
        education: true,
        'job experience': true,
        'curriculum activities': false,
        projects: false,
        skills: true,
        achievements: false,
        shortlisted: true, 
        status: true, 
        'ai detection' : false
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

                console.log(columnsQuery)

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

                // Handle already shortlisted candidates when auto-email is enabled
                if (emailSettings.autoSendEmails) {
                    const shortlistedCandidates = (data.items || []).filter(
                        resume => resume.shortlisted?.toLowerCase() === 'yes' && !notifiedCandidates.has(resume.ID)
                    );

                    // Send emails to shortlisted candidates who haven't been notified
                    for (const candidate of shortlistedCandidates) {
                        try {
                            await handleAutomatedEmail(candidate);
                            console.log('Sent automated email to previously shortlisted candidate:', candidate.name);
                        } catch (error) {
                            console.error('Failed to send automated email to:', candidate.name, error);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching resumes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResumes();
    }, [selectedColumns, emailSettings.autoSendEmails, notifiedCandidates]); // Added dependencies

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!uploadedFiles.length) {
            alert("Please upload a file.");
            return;
        }

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

            // Update local state with new status
            const updatedResumes = resumes.map(resume => 
                resume.ID === rowId 
                    ? { ...resume, shortlisted: newStatus }
                    : resume
            );
            setResumes(updatedResumes);

            // Find the updated candidate
            const candidate = updatedResumes.find(r => r.ID === rowId);
            console.log(candidate);
            console.log(newStatus);
            
            // Check if candidate exists and automated emails are enabled
            if (candidate && emailSettings.autoSendEmails && newStatus === 'yes' && !notifiedCandidates.has(rowId)) {
                console.log('Triggering automated email for:', candidate.name); // Debug log
                try {
                    await handleAutomatedEmail(candidate);
                    console.log('Automated email sent successfully'); // Debug log
                } catch (error) {
                    console.error('Failed to send automated email:', error);
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleAutomatedEmail = async (resume) => {
        if (notifiedCandidates.has(resume.ID)) {
            console.log('Email already sent to:', resume.name);
            return;
        }

        try {
            console.log('Sending automated email to:', resume.name, resume['email address']); // Debug log
            const response = await fetch('/api/notify-interview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: resume['email address'],
                    name: resume.name,
                    details: "Interview Schedule: Monday, 27 May 2025, 10:00 AM\n" +
                            "Location: TaleQ Office, Level 2, Building A\n" +
                            "Type: In-person interview\n" +
                            "Duration: 1 hour"
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send automated email');
            }

            // Add to notified set after successful send
            setNotifiedCandidates(prev => new Set([...prev, resume.ID]));
            console.log('Email sent and candidate marked as notified:', resume.name);
        } catch (error) {
            console.error('Error sending automated email:', error);
            throw error; // Re-throw to handle in calling function
        }
    };

    // Add this useEffect after your other useEffects
    useEffect(() => {
        // Load notified candidates from localStorage on mount
        const savedNotified = localStorage.getItem('notifiedCandidates');
        if (savedNotified) {
            setNotifiedCandidates(new Set(JSON.parse(savedNotified)));
        }
    }, []);

    // Save notified candidates whenever it changes
    useEffect(() => {
        localStorage.setItem('notifiedCandidates', 
            JSON.stringify([...notifiedCandidates]));
    }, [notifiedCandidates]);

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
                                                            value={resume.shortlisted?.toLowerCase() || 'no'}
                                                            onChange={(e) => handleStatusChange(resume.ID, e.target.value)}
                                                            className={`py-1.5 rounded-full text-xs font-medium cursor-pointer border-0 outline-none w-24 text-center
                                                                ${resume.shortlisted?.toLowerCase() === 'yes' 
                                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                                                                transition-colors duration-200`}
                                                            style={{ WebkitAppearance: 'none', appearance: 'none' }}
                                                        >
                                                            <option value="no" className="bg-gray-100 text-gray-800 font-medium">
                                                                Pending
                                                            </option>
                                                            <option value="yes" className="bg-green-100 text-green-800 font-medium">
                                                                Shortlisted
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
                                            {resume.shortlisted?.toLowerCase() === 'yes' && (
                                                <div className="flex justify-center">
                                                    <EmailButton 
                                                        candidateId={resume.ID}
                                                        email={resume['email address']}
                                                        name={resume.name}
                                                        details="Interview Schedule: Monday, 27 May 2025, 10:00 AM
                                                                Location: TaleQ Office, Level 2, Building A
                                                                Type: In-person interview
                                                                Duration: 1 hour"
                                                        onEmailSent={(id) => setNotifiedCandidates(prev => new Set([...prev, id]))}
                                                        isNotified={notifiedCandidates.has(resume.ID)}
                                                    />
                                                </div>
                                            )}
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
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-[#1c843e] text-white rounded-md hover:from-[#1c843e] hover:to-green-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                                >
                                    Upload
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}