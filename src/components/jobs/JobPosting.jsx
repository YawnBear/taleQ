import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import JobDetailsOverlay from "./JobDetailsOverlay";

export default function JobPosting({handleToggleForm, searchQuery}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [filteredJobs, setFilteredJobs] = useState([]);

  // Add polling for job updates
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(
          "https://api.jamaibase.com/api/v1/gen_tables/knowledge/jobs/rows?columns=ID&columns=jobPosition",
          {
            method: "GET",
            headers: {
              accept: "application/json",
              authorization: `Bearer ${process.env.NEXT_PUBLIC_JAMAI_API_KEY}`,
              "X-PROJECT-ID": process.env.NEXT_PUBLIC_JAMAI_PROJECT_ID,
            },
          }
        );
        const json = await res.json();
        setJobs(json.items || []);
      } catch (error) {
        console.error("Error fetching job data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchJobs();

    // Set up polling interval (every 2 seconds)
    const pollInterval = setInterval(fetchJobs, 2000);

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(pollInterval);
  }, []); // Empty dependency array since we want to set up polling only once

  // Filter jobs based on search query
  useEffect(() => {
    const filtered = jobs.filter((job) => {
      if (!job || !job.jobPosition) return false;
      if (!searchQuery) return true;
      return job.jobPosition.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredJobs(filtered);
  }, [jobs, searchQuery]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[10vh]">
      <p className="text-gray-600">Loading job info...</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[10vh] bg-[var(--background)] py-8">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
        {filteredJobs.map((job) => (
          <Card
            key={job.ID}
            className="w-full shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 border-t border-r border-b border-gray-100 bg-white hover:bg-green-50 group cursor-pointer"
            onClick={() => setSelectedJobId(job.ID)}
          >
            <CardHeader className="rounded-lg px-5 py-4 flex flex-col justify-center">
              <CardTitle className="text-gray-800 text-xl font-semibold group-hover:text-green-600 transition-colors duration-300">
                {job.jobPosition || "Untitled Position"}
              </CardTitle>
              <p className="text-gray-500 mt-1 text-sm">
                Click to view details
              </p>
            </CardHeader>
          </Card>
        ))}
        
        <div className="w-full border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 transition-colors duration-300 bg-white hover:bg-green-50">
          <button 
            onClick={handleToggleForm} 
            className="w-full h-full py-8 flex flex-col items-center justify-center"
          >
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-green-600 font-medium">Add New Job</span>
          </button>
        </div>
      </div>
            {selectedJobId && (
        <JobDetailsOverlay 
          jobId={selectedJobId} 
          onClose={() => setSelectedJobId(null)} 
        />
      )}
    </div>
  );
}