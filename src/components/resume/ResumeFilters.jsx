import React, { useState } from 'react';
import SearchBar from '../ui/SearchBar';
import { ChevronDown, ListFilter } from 'lucide-react';

export default function ResumeFilters({ 
    searchQuery, 
    setSearchQuery, 
    filterStatus, 
    setFilterStatus, 
    selectedColumns, 
    handleColumnChange
}) { 
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const filterOptions = [
        { label: 'All Candidates', value: 'all' },
        { label: 'Pending Only', value: 'pending' },
        { label: 'Shortlisted Only', value: 'yes' },
        { label: 'Rejected Only', value: 'rejected' },
        { label: 'Interviewed Only', value: 'interviewed' },
        { label: 'Offered Only', value: 'offered' },
    ];

    const handleFilterSelect = (value) => {
        setFilterStatus(value);
        setShowFilterDropdown(false);
    };

    return (
        <>
            <div className="flex items-center justify-between py-4 px-2">
                <div className="w-2/3 items-center">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>
            </div>
            {/* Header Section */}
            

            {/* Search and Filter Section */}
            <div className="flex items-center justify-between py-2 px-2">
                <div className="px-2 py-8">
                    <h1 className="text-4xl font-bold">Resume</h1>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className="flex items-center gap-2 py-1.5 px-3 rounded-md text-sm border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <ListFilter className="w-4 h-4 text-gray-600" />
                        <span>
                            Filter: {
                            filterOptions.find(option => option.value === filterStatus)?.label || 'All Candidates'
                            }
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showFilterDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            {filterOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleFilterSelect(option.value)}
                                    className={`block w-full text-left px-4 py-2 text-sm ${
                                        filterStatus === option.value
                                        ? 'bg-green-100 text-green-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div> 
        </>
    );
}