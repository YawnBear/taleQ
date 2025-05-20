import { useEffect, useState } from "react";
import { FileUpload } from "@/components/ui/UploadFile"
import { Switch } from "@/components/ui/switch"
import SearchBar from "./SearchBar";

export default function UploadResume() {
    const [showOverlay, setShowOverlay] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showShortlisted, setShowShortlisted] = useState(false);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const response = await fetch('https://api.jamaibase.com/api/v1/gen_tables/action/resume1/rows?columns=name&columns=contact%20number&columns=email%20address&columns=job%20experience&columns=projects&columns=skills&columns=shortlisted', {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        authorization: `Bearer ${process.env.NEXT_PUBLIC_JAMAI_API_KEY}`,
                        'X-PROJECT-ID': process.env.NEXT_PUBLIC_JAMAI_PROJECT_ID
                    }
                });
                const data = await response.json();
                setResumes(data.items || []);
            } catch (error) {
                console.error('Error fetching resumes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResumes();
    }, []);

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
    // First check if resume exists
    if (!resume) return false;

    // Check shortlisted filter
    if (showShortlisted && resume.shortlisted?.toLowerCase() !== 'yes') return false;

    // Check search query
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
            resume.name?.toLowerCase().includes(query) ||
            resume['contact number']?.toLowerCase().includes(query) ||
            resume['email address']?.toLowerCase().includes(query) ||
            resume['job experience']?.toLowerCase().includes(query) ||
            resume.skills?.toLowerCase().includes(query)
        );
    }

    return true;
});

    return (
        <>
            {/* Search and Filter Controls */}
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
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

                {/* Resume Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Experience
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Skills
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredResumes.map((resume, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {resume.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {resume['contact number']}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {resume['email address']}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {resume['job experience']}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {resume.skills}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            resume.shortlisted?.toLowerCase() === 'yes' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {resume.shortlisted?.toLowerCase() === 'yes' ? 'Shortlisted' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upload Button */}
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

            {/* Upload Overlay */}
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