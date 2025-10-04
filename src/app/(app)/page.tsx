'use client';

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/apiClient";
import { Subscription } from "@/lib/types";
import { SubsCard } from "@/components/subs/SubsCard";
import { AddSubCard } from "@/components/subs/AddSubCard";
import { SubsListSkeleton } from "@/components/subs/SubsListSkeleton";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { t } = useTranslation();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubs = useCallback(async () => {
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
  }, [t]);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  if (isLoading) {
    return <SubsListSkeleton />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {subs.map((sub, index) => (
        <motion.div key={sub.hashed_dir} variants={cardVariants}>
          <SubsCard 
            sub={sub} 
            onSubDeleted={fetchSubs} 
            onChanged={fetchSubs}
          />
        </motion.div>
      ))}
      {subs.length < 3 && (
        <motion.div variants={cardVariants}>
          <AddSubCard onSubAdded={fetchSubs} />
        </motion.div>
      )}
    </motion.div>
  );
}