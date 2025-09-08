'use client';

export const runtime = 'edge';

// export default function Page({ params }: { params: { hashed_dir: string }}) {
//   return <pre>OK on Edge: {params.hashed_dir}</pre>;
// }

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { SeriesChart } from "@/components/charts/SeriesChart";
import { Button } from "@/components/ui/button";
import { notFound, useParams } from "next/navigation";

type Point = {
  ts: number;
  kwh: number;
};

export default function SeriesPage() {
  const { hashed_dir } = useParams() as { hashed_dir: string };
  const [points, setPoints] = useState<Point[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("24h");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const since = new Date();
        if (timeRange === "7d") {
          since.setDate(since.getDate() - 7);
        } else if (timeRange === "30d") {
          since.setDate(since.getDate() - 30);
        } else {
          since.setHours(since.getHours() - 24);
        }

        const data = await apiClient.get(
          `/series/${hashed_dir}?since=${since.getTime() / 1000}&limit=5000`
        );
        setPoints(data.points);
      } catch (err) {
        if (err instanceof Error) {
          if (err.message === "NOT_FOUND_OR_EMPTY") {
            setPoints([]);
          } else {
            setError(err.message);
          }
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [hashed_dir, timeRange]);

  if (isLoading) {
    return <p>Loading chart...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  
  if (!points) {
    notFound();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Electricity Consumption</h1>
        <div className="flex gap-2">
          <Button
            variant={timeRange === "24h" ? "default" : "outline"}
            onClick={() => setTimeRange("24h")}
          >
            24h
          </Button>
          <Button
            variant={timeRange === "7d" ? "default" : "outline"}
            onClick={() => setTimeRange("7d")}
          >
            7d
          </Button>
          <Button
            variant={timeRange === "30d" ? "default" : "outline"}
            onClick={() => setTimeRange("30d")}
          >
            30d
          </Button>
        </div>
      </div>
      <SeriesChart data={points} />
    </div>
  );
}