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
        const res = await fetch('/api/jobs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const result = await res.json();
        
        if (result.success) {
          setJobs(result.jobs || []);
        } else {
          console.error('Failed to fetch jobs:', result.error);
        }
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
  }, []);

  // Filter jobs based on search query
  useEffect(() => {
    const filtered = jobs.filter((job) => {
      if (!job || !job.jobPosition) return false;
      if (!searchQuery) return true;
      return job.jobPosition.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredJobs(filtered);
  }, [jobs, searchQuery]);

  const deleteJob = async (jobId, event) => {
    // Stop event propagation to prevent card click
    event.stopPropagation();
    
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      // Use your API route for deletion
      const response = await fetch(`/api/jobs?id=${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        console.log('Job deleted successfully');
        // Remove job from state instead of reloading page
        setJobs(prevJobs => prevJobs.filter(job => job.ID !== jobId));
        setFilteredJobs(prevFiltered => prevFiltered.filter(job => job.ID !== jobId));
        
        // Close overlay if deleted job was selected
        if (selectedJobId === jobId) {
          setSelectedJobId(null);
        }
      } else {
        console.error('Failed to delete job:', result.error);
        alert('Failed to delete job. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job. Please try again.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[10vh]">
      <p className="text-gray-600">Loading job info...</p>
    </div>
  );

   return (
    <div className="flex flex-col items-center justify-center min-h-[10vh] rounded py-10 px-4 sm:px-8">
      <div className="w-full">
        <div className="container mx-auto mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {filteredJobs.map((job) => (
            <Card
              key={job.ID}
              className="w-full min-h-[130px] shadow-lg hover:shadow-xl transition-all duration-300 border-green-500 border-t border-r border-b border-gray-100 bg-white hover:bg-green-50 group cursor-pointer relative"
              onClick={() => setSelectedJobId(job.ID)}
            >
              <button
                onClick={(e) => deleteJob(job.ID, e)}
                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                title="Delete job"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              <CardHeader className="rounded-lg px-5 py-4 flex flex-col justify-center pr-10">
                <CardTitle className="text-gray-800 text-xl font-semibold group-hover:text-green-600 transition-colors duration-300">
                  {job.jobPosition || "Untitled Position"}
                </CardTitle>
                <p className="text-gray-500 mt-1 text-sm">
                  Click to view details
                </p>
              </CardHeader>
            </Card>
          ))}

          <div className="w-full border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 transition-colors duration-300 bg-white hover:bg-green-50 transform hover:scale-[1.02]">
            <button
              onClick={handleToggleForm}
              className="w-full h-full py-8 flex flex-col items-center justify-center"
            >
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="text-green-600 font-medium">Add New Job</span>
            </button>
          </div>
        </div>

        {selectedJobId && (
          <div className="fixed inset-0 bg-opacity-40 backdrop-blur-md z-50 flex items-center justify-center">
            <JobDetailsOverlay
              jobId={selectedJobId}
              onClose={() => setSelectedJobId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}