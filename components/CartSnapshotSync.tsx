"use client";

import { useEffect } from "react";
import { useStore } from "@/components/StoreProvider";

export function CartSnapshotSync({
  slugs,
  count,
  variantKeys = [],
}: {
  slugs: string[];
  count: number;
  variantKeys?: string[];
}) {
  const { setCartSnapshot } = useStore();

  useEffect(() => {
    setCartSnapshot(slugs, count, variantKeys);
  }, [count, slugs, variantKeys, setCartSnapshot]);

  return null;
}
