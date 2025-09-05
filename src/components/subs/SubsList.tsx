import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Subscription } from "@/app/(app)/subs/page";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type SubsListProps = {
  subs: Subscription[];
  onSubDeleted: () => void;
};

export function SubsList({ subs, onSubDeleted }: SubsListProps) {
  async function handleDelete(hashed_dir: string) {
    if (confirm("Are you sure you want to delete this subscription?")) {
      try {
        await apiClient.delete(`/subs/${hashed_dir}`);
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

  async function handleToggleAlert(hashed_dir: string, email_alert: boolean) {
    try {
      await apiClient.put(`/subs/${hashed_dir}`, { email_alert });
    } catch (err) {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert("An unknown error occurred");
        }
    }
  }

  if (subs.length === 0) {
    return <p>You have no subscriptions yet.</p>;
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dormitory</TableHead>
              <TableHead>Email Alert</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subs.map((sub) => (
              <TableRow key={sub.hashed_dir}>
                <TableCell>{sub.canonical_id}</TableCell>
                <TableCell>
                  <Switch
                    checked={sub.email_alert}
                    onCheckedChange={(checked) =>
                      handleToggleAlert(sub.hashed_dir, checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(sub.hashed_dir)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-4 md:hidden">
        {subs.map((sub) => (
          <Card key={sub.hashed_dir}>
            <CardHeader>
              <CardTitle>{sub.canonical_id}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <span>Email Alert</span>
              <Switch
                checked={sub.email_alert}
                onCheckedChange={(checked) =>
                  handleToggleAlert(sub.hashed_dir, checked)
                }
              />
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleDelete(sub.hashed_dir)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}