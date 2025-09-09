'use client';

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { SubsList } from "@/components/subs/SubsList";
import { SubsWizard } from "@/components/subs/SubsWizard";
import { Button } from "@/components/ui/button";

export type Subscription = {
  hashed_dir: string;
  canonical_id: string;
  email_alert: boolean;
  last_ts: number;
  last_kwh: number;
  last_kw: number;
};

export default function SubsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

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

  function handleSubAdded() {
    setIsAdding(false);
    fetchSubs();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>Add Subscription</Button>
        )}
      </div>

      {isAdding && (
        <div className="mb-4">
          <SubsWizard onSubAdded={handleSubAdded} />
        </div>
      )}

      {isLoading && <p>Loading subscriptions...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && (
        <SubsList subs={subs} onSubDeleted={fetchSubs} />
      )}
    </div>
  );
}