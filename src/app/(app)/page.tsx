'use client';

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { Subscription } from "./subs/page";
import { SubsCard } from "@/components/subs/SubsCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSubs() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get("/subs");
      setSubs(data.items);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSubs();
  }, []);

  if (isLoading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (subs.length === 0) {
    return (
      <div className="text-center">
        <p>You have no subscriptions yet.</p>
        <Button asChild>
          <Link href="/subs">Add Subscription</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {subs.map((sub) => (
        <SubsCard key={sub.hashed_dir} sub={sub} onSubDeleted={fetchSubs} />
      ))}
    </div>
  );
}