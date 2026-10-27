"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/app/components/icons";

type ProductSpecification = {
  label: string;
  value: string;
};

export function ProductSpecifications({
  specifications,
}: {
  specifications: ProductSpecification[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleSpecifications = specifications.slice(0, 4);
  const remainingSpecifications = specifications.slice(4);

  return (
    <table className="w-full border-collapse text-left text-sm">
      <tbody>
        {[...visibleSpecifications, ...(isExpanded ? remainingSpecifications : [])].map(
          (spec) => (
            <tr key={spec.label} className="border-b border-neutral-200">
              <th
                scope="row"
                className="w-1/2 py-2 pr-4 font-normal text-neutral-500"
              >
                {spec.label}
              </th>
              <td className="py-2 text-neutral-900">{spec.value}</td>
            </tr>
          ),
        )}
        {remainingSpecifications.length > 0 ? (
          <tr>
            <td colSpan={2}>
              <button
                type="button"
                onClick={() => setIsExpanded((expanded) => !expanded)}
                aria-expanded={isExpanded}
                className="inline-flex items-center gap-2 py-2 text-xs text-neutral-500 transition-colors hover:text-neutral-900"
              >
                {isExpanded ? "Show fewer specifications" : "View all specifications"}
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}
