import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


export default function JobPosting() {
    return (
        <div className="flex flex-col items-center justify-center">
            <Card>
            <CardHeader>
                <CardTitle>Job Position</CardTitle>
                <CardDescription>Skill Set</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Job Description</p>
            </CardContent>
            </Card>
        </div>
    );
}