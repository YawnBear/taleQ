import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import UploadResume from "./UploadResume";

export default function JobPosting({ handleToggleForm }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(
          "https://api.jamaibase.com/api/v1/gen_tables/action/resume/rows?columns=name&columns=location",
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
    fetchJobs();
  }, []);

  if (loading) return <p>Loading job info...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[10vh] bg-[var(--background)] py-8">
      <div className="mt-10 w-1/2 mx-auto">
        <SearchBar />
        <UploadResume />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{job.name}</TableCell>
              <TableCell>{job.location}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
