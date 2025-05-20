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
          "https://api.jamaibase.com/api/v1/gen_tables/knowledge/jobs/rows?columns=jobPosition&columns=ID",
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
      console.log("Current jobs:", jobs);
console.log("Search query:", searchQuery);

  return (
    <div className="flex flex-col items-center justify-center min-h-[10vh] bg-[var(--background)] py-8">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
        {filteredJobs.map((job) => (
            <Card
              key={job.ID}
              className="w-full h-[120px] shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-400 bg-white hover:border-green-500 group cursor-pointer"
              onClick={() => setSelectedJobId(job.ID)}
            >
              <CardHeader className="h-full rounded-lg px-5 py-4 bg-white flex flex-col justify-center">
                <CardTitle className="text-gray-800 text-xl font-semibold group-hover:text-green-600 transition-colors duration-300 line-clamp-2">
                  {job.jobPosition || "Untitled Position"}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        <div className="w-full h-[120px] border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 transition-colors duration-300">
          <button 
            onClick={handleToggleForm} 
            className="w-full h-full flex items-center justify-center text-3xl text-green-400 hover:text-green-600 transition-colors duration-300"
          >
            +
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