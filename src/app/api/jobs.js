export default async function handler(req, res) {
  if (req.method === "POST") {
    const { jobPosition, jobDesc, skillSet, remarks } = req.body;

    // Basic validation
    if (!jobPosition || !jobDesc || !skillSet) {
      return res.status(400).json({ error: "Please fill in all required fields." });
    }

    // Simulate saving to a database (replace this with real DB logic)
    try {
      // Example log — replace with DB call
      console.log("Job received:", {
        jobPosition,
        jobDesc,
        skillSet,
        remarks,
      });

      return res.status(200).json({ message: "Job successfully created!" });
    } catch (error) {
      console.error("Error saving job:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  } else {
    // Only allow POST
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
