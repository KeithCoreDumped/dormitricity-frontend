import React from "react";
import { SubsCard } from "./SubsCard";
import type { Subscription } from "@/lib/types";

type SubsListProps = {
  subs: Subscription[];
  onSubDeleted: () => void;
  onChanged: () => void;
};

export function SubsList({ subs, onSubDeleted, onChanged }: SubsListProps) {
  if (subs.length === 0) {
    return <p>You have no subscriptions yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subs.map((sub) => (
        <SubsCard
          key={sub.hashed_dir}
          sub={sub}
          onSubDeleted={onSubDeleted}
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}
