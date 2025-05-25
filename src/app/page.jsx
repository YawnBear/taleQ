"use client";

import { useState } from "react";
import JobDesc from "@/components/jobs/JobDesc";
import UploadResume from "@/components/resume/UploadResume";
import Calendar from "@/components/calendar/Calendar";
import Settings from "@/components/Settings";

export default function Home() {
    const [currentPage, setCurrentPage] = useState("Resume");

    return (
        <>
        <div className="flex h-screen">
            <nav className="fixed w-48 h-screen bg-neutral-50 border-r border-gray-300 flex flex-col justify-between shadow-lg">
                <div>
                    <ul className="space-y-2">
                        <div>
                            <li className="p-4">
                                <img src="/logo.png" alt="Logo" className="mx-auto" onClick={() => setCurrentPage("jobPosition")}/>
                            </li>
                        </div>
                        <li className="mt-20">
                            <button
                                className={`w-full text-left px-4 py-2 rounded ${
                                    currentPage === "Resume" ? "bg-green-100 text-emerald-500" : "hover:bg-slate-200"
                                }`}
                                onClick={() => setCurrentPage("Resume")}
                            >
                                Resume
                            </button>
                        </li>
                        <li>
                            <button
                                className={`w-full text-left px-4 py-2 rounded ${
                                    currentPage === "jobPosition" ? "bg-green-100 text-emerald-500" : "hover:bg-slate-200"
                                }`}
                                onClick={() => setCurrentPage("jobPosition")}
                            >
                                Job Position
                            </button>
                        </li>
                        <li>
                            <button
                                className={`w-full text-left px-4 py-2 rounded ${
                                    currentPage === "Calendar" ? "bg-green-100 text-emerald-500" : "hover:bg-slate-200"
                                }`}
                                onClick={() => setCurrentPage("Calendar")}
                            >
                                Calendar
                            </button>
                        </li>
                    </ul>
                </div>
                
                {/* Settings button at bottom */}
                <div className="mb-4">
                    <button
                        className={`w-full text-left px-4 py-2 rounded flex items-center ${
                            currentPage === "Settings" ? "bg-green-500 text-white" : "hover:bg-slate-300"
                        }`}
                        onClick={() => setCurrentPage("Settings")}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                    </button>
                </div>
            </nav>
            <main className="flex-1 ml-48">
                {currentPage === "jobPosition" && <JobDesc />}
                {currentPage === "Resume" && <UploadResume />}
                {currentPage === "Calendar" && <Calendar />}
                {currentPage === "Settings" && <Settings />}
            </main>
        </div>
        </>
    );
}