"use client";

import React, { useState } from "react";
import JobDesc from "@/components/jobs/JobDesc";
import UploadResume from "@/components/resume/UploadResume";
import Calendar from "@/components/calendar/Calendar";
import Settings from "@/components/Settings";
import SearchBar from "../components/ui/SearchBar";

export default function Home({ searchQuery, setSearchQuery }) {
    const [currentPage, setCurrentPage] = useState("Resume");

    const navItems = [
        { label: "Resume", value: "Resume" },
        { label: "JobPosition", value: "jobPosition" },
        { label: "Calendar", value: "Calendar" },
        { label: "Settings", value: "Settings" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#e6ebf4]">
            {/* Top Navigation Bar */}
            <nav className="w-full bg-white shadow-md rounded-b-xl px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                {/* Top Section - Logo and Search */}
                <div className="flex items-center justify-between w-full sm:w-auto">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage("jobPosition")}>
                        <img src="/logo.png" alt="Logo" className="h-10" />
                        <span className="text-xl font-semibold text-green-600">TaleQ</span>
                    </div>
                    <div className="sm:hidden ml-auto">
                        <SearchBar value={searchQuery} onChange={setSearchQuery} />
                    </div>
                </div>

                {/* Center Section - Navigation */}
                <ul className="flex gap-10 mt-4 sm:mt-0 sm:mx-auto text-base font-medium text-gray-600">
                    {navItems.map((item) => (
                        <li
                            key={item.value}
                            onClick={() => setCurrentPage(item.value)}
                            className={`cursor-pointer relative pb-1 transition duration-200 ${
                                currentPage === item.value
                                    ? "text-black after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-gradient-to-t after:from-emerald-500 after:to-transparent"
                                    : "hover:text-black hover:after:content-[''] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-[3px] hover:after:bg-gradient-to-t hover:after:from-emerald-400 hover:after:to-transparent"
                            }`}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
                {/* Right Section - SearchBar for Desktop */}
                <div className="hidden sm:block">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6">
                {currentPage === "jobPosition" && <JobDesc />}
                {currentPage === "Resume" && <UploadResume />}
                {currentPage === "Calendar" && <Calendar />}
                {currentPage === "Settings" && <Settings />}
            </main>
        </div>
    );
}
