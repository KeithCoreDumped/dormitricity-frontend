'use client';

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/apiClient";
import { Subscription } from "@/lib/types";
import { SubsCard } from "@/components/subs/SubsCard";
import { AddSubCard } from "@/components/subs/AddSubCard";
import Loading from "./loading";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { t } = useTranslation();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubs = useCallback(async () => {
    // Don't set loading to true here to avoid flicker when refetching
    setError(null);
    try {
      const data = await apiClient.get("/subs");
      setSubs(data.items);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('unknown_error'));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  if (isLoading) {
    return Loading();
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {subs.map((sub) => (
        <SubsCard key={sub.hashed_dir} sub={sub} onSubDeleted={fetchSubs} onChanged={fetchSubs} />
      ))}
      {subs.length < 3 && (
        <AddSubCard onSubAdded={fetchSubs} />
      )}
    </div>
  );
}