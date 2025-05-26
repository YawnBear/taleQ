import React from 'react';
import SearchBar from '../ui/SearchBar';

export default function ResumeFilters({ 
    searchQuery, 
    setSearchQuery, 
    filterStatus, 
    setFilterStatus, 
    selectedColumns, 
    handleColumnChange 
}) {
    return (
        <>
            {/* Header Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-white rounded-2xl p-8 shadow-xl mb-10 flex flex-col md:flex-row justify-between items-center">
                <div className="border-b border-green-300 pb-4 mb-4">
                    <h1 className="text-4xl font-bold">Resume</h1>
                    <p>Write something.........................................................</p>
                </div>
            </div>
            <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Display Columns:</h3>
                <div className="flex flex-wrap gap-7">
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
            </div>
            <div className="flex items-center justify-between py-4 px-4">
                
                    <div className="w-1/2">
                        <SearchBar value={searchQuery} onChange={setSearchQuery} />
                    </div>
                                <div className="flex items-center gap-2">
                                    <label htmlFor="statusFilter" className="text-sm text-gray-600">
                                        Filter By Status:
                                    </label>
                                    <select
                                        id="statusFilter"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="py-1.5 px-3 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="all">All Candidates</option>
                                        <option value="pending">Pending Only</option>
                                        <option value="yes">Shortlisted Only</option>
                                        <option value="rejected">Rejected Only</option>
                                        <option value="interviewed">Interviewed Only</option>
                                        <option value="offered">Offered Only</option>
                                    </select>
                                </div>                                
                            </div>          
        </>
    );
}