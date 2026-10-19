"use client";

import { useEffect } from "react";
import { useStore } from "@/components/StoreProvider";

export function CartSnapshotSync({
  slugs,
  count,
}: {
  slugs: string[];
  count: number;
}) {
  const { setCartSnapshot } = useStore();

  useEffect(() => {
    setCartSnapshot(slugs, count);
  }, [count, setCartSnapshot, slugs]);

  return null;
}
