import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Subscription } from "@/app/(app)/subs/page";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";

type SubsCardProps = {
  sub: Subscription;
  onSubDeleted: () => void;
};

export function SubsCard({ sub, onSubDeleted }: SubsCardProps) {
  async function handleDelete() {
    if (confirm("Are you sure you want to delete this subscription?")) {
      try {
        await apiClient.delete(`/subs/${sub.hashed_dir}`);
        onSubDeleted();
      } catch (err) {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert("An unknown error occurred");
        }
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{sub.canonical_id}</CardTitle>
        <CardDescription>
          Last updated: {new Date(sub.last_ts * 1000).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-4xl font-bold">{sub.last_kwh} kWh</div>
          <Badge variant={sub.email_alert ? "default" : "outline"}>
            {sub.email_alert ? "Alerts On" : "Alerts Off"}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href={`/series/${sub.hashed_dir}`}>View Trends</Link>
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          Unsubscribe
        </Button>
      </CardFooter>
    </Card>
  );
}