import { useState } from 'react';

export default function ClusteringPanel({ clusteringPrompt, setClusteringPrompt, handleClustering, isClustering }) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div className="bg-white rounded-lg shadow-md mt-8 overflow-hidden">
            <div 
                className="p-4 flex justify-between items-center border-b cursor-pointer bg-gradient-to-r from-green-50 to-white"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-800">Resume Clustering (AI-Powered)</h2>
                </div>
                
                <div className="text-gray-500">
                    {isExpanded ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
            </div>
            
            {isExpanded && (
                <div className="p-5">
                    <p className="text-sm text-gray-600 mb-4">
                        Describe what you're looking for, and the AI will group candidates accordingly. Try prompts like:
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button 
                            className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
                            onClick={() => setClusteringPrompt("Group candidates with Computer Science degrees and Python skills")}
                        >
                            CS degree + Python
                        </button>
                        <button 
                            className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
                            onClick={() => setClusteringPrompt("Find candidates with over 5 years of experience and leadership skills")}
                        >
                            5+ years exp + Leadership
                        </button>
                        <button 
                            className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
                            onClick={() => setClusteringPrompt("Group by years of experience: 0-2, 3-5, 5+")}
                        >
                            Group by experience level
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="clusteringPrompt" className="block text-sm font-medium text-gray-700">
                                Clustering Criteria
                            </label>
                            <textarea
                                id="clusteringPrompt"
                                placeholder="E.g., 'Group candidates with a degree in Computer Science and Python skills'"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                                rows="3"
                                value={clusteringPrompt}
                                onChange={(e) => setClusteringPrompt(e.target.value)}
                            ></textarea>
                        </div>
                        
                        <div className="flex justify-end">
                            <button
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-[#1c843e] text-white rounded-md shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 flex items-center gap-2"
                                onClick={handleClustering}
                                disabled={isClustering || !clusteringPrompt.trim()}
                            >
                                {isClustering ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                        Cluster Resumes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}