import { useState } from "react";

export default function JobDesc() {
    
    const [toggleForm, setToggleForm] = useState(false);
    const [jobPosition, setJobPosition] = useState("");
    const [jobDesc, setJobDesc] = useState("");
    const [skillSet, setskillSet] = useState("");
    const [remarks, setRemarks] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page reload on submit

        setIsSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");

        const jobData = {
        jobPosition,
        jobDesc,
        skillSet,
        remarks,
        };

        try {
        const response = await fetch("/api/jobs", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(jobData),
        });

        const data = await response.json();

        if (response.ok) {
            setSuccessMessage(data.message);
            // Optionally, you can reset form state here
            setJobPosition("");
            setJobDesc("");
            setskillSet("");
            setRemarks("");
        } else {
            setErrorMessage("Failed to submit the job data");
        }
        } catch (error) {
        console.error("Error submitting form:", error);
        setErrorMessage("Error submitting the form");
        }

        setIsSubmitting(false);
    };

    function handleToggleForm() {
    setToggleForm(!toggleForm);
    }
// Function to send email notification, here test only, should be used in other places
    async function notifyCandidate(email, details) {
        const response = await fetch('/api/notify-interview', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, details }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
        } else {
            alert('Failed to send notification: ' + data.error);
        }
    }

    return (
        <div className="w-full p-4">
            <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                    <button onClick={handleToggleForm} className="mt-4">+</button>
                </div>
                {toggleForm && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-50 transition-opacity">
                        <div className="bg-black p-8 rounded-2xl shadow-2xl border border-gray-300 w-full max-w-md text-center">
                        <h2 className="text-2xl font-semibold mb-4 ">Create New Job</h2>
                        
                        {/* Form elements or inputs can go here */}
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="text-left">
                                <label className="block text-white mb-1" htmlFor="jobPosition">Job Position</label>
                                <input
                                id="jobPosition"
                                type="text"
                                className="w-full px-3 py-2 rounded border border-gray-400 focus:outline-none"
                                placeholder="Enter job position"
                                value={jobPosition}
                                onChange={(e) => setJobPosition(e.target.value)}
                                />
                            </div>
                            <div className="text-left">
                                <label className="block text-white mb-1" htmlFor="jobDesc">Job Description</label>
                                <textarea
                                id="jobDesc"
                                className="w-full px-3 py-2 rounded border border-gray-400 focus:outline-none"
                                placeholder="Enter job description"
                                rows={4}
                                value={jobDesc}
                                onChange={(e) => setJobDesc(e.target.value)}
                                />
                            </div>
                            <div className="text-left">
                                <label className="block text-white mb-1" htmlFor="skillSet">Skill Set Required</label>
                                <input
                                id="skillSet"
                                type="text"
                                className="w-full px-3 py-2 rounded border border-gray-400 focus:outline-none"
                                placeholder="Enter skill set required"
                                value={skillSet}
                                onChange={(e) => setskillSet(e.target.value)}
                                />
                            </div>
                            <div className="text-left">
                                <label className="block text-white mb-1" htmlFor="remarks">Remarks</label>
                                <input
                                id="remarks"
                                type="text"
                                className="w-full px-3 py-2 rounded border border-gray-400 focus:outline-none"
                                placeholder="Enter remarks"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                            <button
                            type="submit"
                            className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            disabled={isSubmitting}
                            onClick={() => notifyCandidate("dltyx04@gmail.com", "Interview scheduled for 10 AM tomorrow")} //calling email function
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                            {successMessage && <div className="mt-4 text-green-500">{successMessage}</div>}
                            {errorMessage && <div className="mt-4 text-red-500">{errorMessage}</div>}
                            </form>

                        <button
                            onClick={() => { handleToggleForm(); setSuccessMessage(""); }}
                            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition border border-blue-500"
                        >
                            Close
                        </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
