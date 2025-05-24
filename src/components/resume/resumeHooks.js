import { useState, useEffect } from 'react';

export function useResumeData(selectedColumns) {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                // Get visible columns for display
                const visibleColumns = Object.entries(selectedColumns)
                    .filter(([_, isSelected]) => isSelected)
                    .map(([column]) => column);

                // Always include email address and name for functionality
                const requiredColumns = ['email address', 'name'];
                const allColumns = [...new Set([...visibleColumns, ...requiredColumns])];

                const columnsQuery = allColumns
                    .map(column => `columns=${encodeURIComponent(column)}`)
                    .join('&');

                const response = await fetch(
                    `https://api.jamaibase.com/api/v1/gen_tables/action/${process.env.NEXT_PUBLIC_JAMAI_ACTION_TABLE_ID}/rows?${columnsQuery}`,
                    {
                        method: 'GET',
                        headers: {
                            accept: 'application/json',
                            authorization: `Bearer ${process.env.NEXT_PUBLIC_JAMAI_API_KEY}`,
                            'X-PROJECT-ID': process.env.NEXT_PUBLIC_JAMAI_PROJECT_ID
                        }
                    }
                );
                const data = await response.json();
                setResumes(data.items || []);
            } catch (error) {
                console.error('Error fetching resumes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResumes();

        // Listen for resume refresh events
        const handleRefreshResumes = () => fetchResumes();
        window.addEventListener('fetchResumes', handleRefreshResumes);
        
        return () => {
            window.removeEventListener('fetchResumes', handleRefreshResumes);
        };
    }, [selectedColumns]);

    return { resumes, setResumes, loading };
}

export function useNotifiedCandidates() {
    const [notifiedCandidates, setNotifiedCandidates] = useState(new Set());
    
    useEffect(() => {
        // Initialize from localStorage after component mounts
        const savedNotified = localStorage.getItem('notifiedCandidates');
        if (savedNotified) {
            setNotifiedCandidates(new Set(JSON.parse(savedNotified)));
        }
    }, []);

    useEffect(() => {
        // Save to localStorage when notifiedCandidates changes
        if (typeof window !== 'undefined') {
            localStorage.setItem('notifiedCandidates', JSON.stringify([...notifiedCandidates]));
        }
    }, [notifiedCandidates]);

    return [notifiedCandidates, setNotifiedCandidates];
}

export function useFilteredResumes(resumes, filterStatus, searchQuery, selectedColumns) {
    return resumes.filter(resume => {
        if (!resume) return false;
        
        // Filter by status if not "all"
        if (filterStatus !== "all" && resume.shortlisted?.toLowerCase() !== filterStatus) {
            return false;
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return Object.entries(selectedColumns)
                .filter(([_, isSelected]) => isSelected)
                .some(([column]) => {
                    const value = resume[column];
                    if (!value) return false;
                    return value.toString().toLowerCase().includes(query);
                });
        }
        return true;
    });
}

// Add this function if you want a separate hook for clustering
export function useResumeClustering() {
    const [clusteredResults, setClusteredResults] = useState(null);
    const [isClustering, setIsClustering] = useState(false);
    const [clusteringPrompt, setClusteringPrompt] = useState("");
    
    const performClustering = async (resumes) => {
        if (!clusteringPrompt.trim() || !resumes?.length) {
            return;
        }
        
        setIsClustering(true);
        
        try {
            const response = await fetch("/api/cluster-resumes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: clusteringPrompt,
                    resumes,
                }),
            });
            
            if (!response.ok) {
                throw new Error("Failed to cluster resumes");
            }
            
            const data = await response.json();
            setClusteredResults(data);
            return data;
        } catch (error) {
            console.error("Clustering error:", error);
            throw error;
        } finally {
            setIsClustering(false);
        }
    };
    
    return {
        clusteredResults,
        setClusteredResults,
        isClustering,
        clusteringPrompt,
        setClusteringPrompt,
        performClustering,
    };
}