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
    const [showColumns, setShowColumns] = useState(false);
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
            {/* Header Section */}
            <div className="px-2 py-8">
                <div className="border-b border-green-300 pb-4 mb-4">
                    <h1 className="text-4xl font-bold">Resume</h1>
                </div>
            </div>

            {/* Column Selection */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-md mx-2">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Display Columns:</h3>
                <div className="flex flex-wrap gap-2">
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

            {/* Search and Filter Section */}
            <div className="flex items-center justify-between py-4 px-2">
                <div className="w-1/2">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
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