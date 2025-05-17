import { useState } from "react";

export default function JobDesc() {
    
    const [toggleForm, setToggleForm] = useState(false);

    function handleToggleForm() {
    setToggleForm(!toggleForm);
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-screen">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <button onClick={handleToggleForm} className="mt-4">+</button>
                </div>
                {toggleForm && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/5 flex items-center justify-center z-50 transition-opacity">
                        <div className="bg-black p-8 rounded-2xl shadow-2xl border border-gray-300 w-full max-w-md text-center">
                        <h2 className="text-2xl font-semibold mb-4 ">Create New Job</h2>
                        
                        {/* Form elements or inputs can go here */}
                        <form className="space-y-4">
                    <div className="text-left">
                        <label className="block text-white mb-1" htmlFor="jobTitle">Job Position</label>
                        <input
                            id="jobPosition"
                            type="text"
                            className="w-full px-3 py-2 rounded border border-gray-400 focus:outline-none"
                            placeholder="Enter job position"
                        />
                    </div>
                    <div className="text-left">
                        <label className="block text-white mb-1" htmlFor="jobDesc">Job Description</label>
                        <textarea
                            id="jobDesc"
                            className="w-full px-3 py-2 rounded border border-gray-400 focus:outline-none"
                            placeholder="Enter job description"
                            rows={4}
                        />
                    </div>
                    <div className="text-left">
                        <label className="block text-white mb-1" htmlFor="location">Skill Set Required</label>
                        <input
                            id="location"
                            type="text"
                            className="w-full px-3 py-2 rounded border border-gray-400 focus:outline-none"
                            placeholder="Enter location"
                        />
                    </div>
                    <div className="text-left">
                        <label className="block text-white mb-1" htmlFor="location">Remarks</label>
                        <input
                            id="remarks"
                            type="text"
                            className="w-full px-3 py-2 rounded border border-gray-400 focus:outline-none"
                            placeholder="Enter remarks"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Submit
                    </button>
                </form>

                        <button
                            onClick={handleToggleForm}
                            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
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
