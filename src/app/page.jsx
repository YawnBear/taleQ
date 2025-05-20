"use client";

import { useEffect, useState } from "react";
import JobDesc from "@/components/JobDesc";
import UploadResume from "@/components/UploadResume"
import TextField from "@mui/material/TextField";
import ResumeTable from "@/components/ResumeTable";

export default function Home() {
    const [tableData, setTableData] = useState();
    const [currentPage, setCurrentPage] = useState("jobPosition");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/jamai");
                if (response.ok) {
                    const data = await response.json();
                    setTableData(data);
                } else {
                    console.error("Failed to fetch data:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <>
        {/* Sidebar */}
        <div className="flex h-screen">
            <nav className="w-48 bg-gray-100 border-r border-gray-300">
                <ul className="space-y-2">
                    <div>
                    <li className="p-4">
                        <img src="/logo.png" alt="Logo" className=" mx-auto" onClick={() => setCurrentPage("jobPosition")}/>
                    </li>
                    </div>
                    <li className="mt-20">
                        <button
                        className={`w-full text-left px-4 py-2 rounded ${
                            currentPage === "jobPosition" ? "bg-green-600 text-white" : "hover:bg-gray-200"
                        }`}
                        onClick={() => setCurrentPage("jobPosition")}
                        >
                        Job Position
                        </button>
                    </li>
                    <li>
                        <button
                        className={`w-full text-left px-4 py-2 rounded ${
                            currentPage === "Resume" ? "bg-green-600 text-white" : "hover:bg-gray-200"
                        }`}
                        onClick={() => setCurrentPage("Resume")}
                        >
                        Resume
                        </button>
                    </li>
                    <li>
                        <button
                        className={`w-full text-left px-4 py-2 rounded ${
                            currentPage === "Shortlisted" ? "bg-green-600 text-white" : "hover:bg-gray-200"
                        }`}
                        onClick={() => setCurrentPage("Shortlisted")}
                        >
                        Shortlisted
                        </button>
                    </li>
                </ul>
            </nav>
            <main className="flex-1">
                {currentPage === "jobPosition" && <JobDesc />}
                {currentPage === "Resume" && <UploadResume />}
                {currentPage === "Shortlisted" && <p>dk man</p>}
            </main>
        </div>
        </>
    );
}
