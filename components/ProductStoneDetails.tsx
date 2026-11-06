import { ChevronDownIcon, DiamondIcon } from "@/app/components/icons";
import type { ProductStoneDetail } from "@/lib/swell";

const columns: { label: string; value: keyof ProductStoneDetail }[] = [
  { label: "Stone", value: "type" },
  { label: "Shape", value: "shape" },
  { label: "Weight", value: "weight" },
  { label: "Color", value: "color" },
  { label: "Clarity", value: "clarity" },
  { label: "Pcs", value: "pieces" },
];

export function ProductStoneDetails({
  details,
}: {
  details: ProductStoneDetail[];
}) {
  if (details.length === 0) {
    return null;
  }

  return (
    <section
      className="scroll-mt-24"
      aria-labelledby="product-stone-details-heading"
    >
      <details className="group border-t border-neutral-200">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
          <h2
            id="product-stone-details-heading"
            className="flex items-center gap-2 text-sm font-medium text-neutral-800"
          >
            <DiamondIcon className="h-4 w-4" />
            Stone Details
          </h2>
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-neutral-600 transition-transform group-open:rotate-180" />
        </summary>
        <div className="pb-3">
          <div className="xl:hidden">
            {details.map((detail, index) => (
              <table
                key={`${detail.type ?? "stone"}-${detail.shape ?? "shape"}-${index}`}
                className="w-full border-collapse text-left text-sm"
              >
                <tbody>
                  {columns.map((column) => (
                    <tr
                      key={column.value}
                      className="border-b border-neutral-200 last:border-b-0"
                    >
                      <th
                        scope="row"
                        className="w-1/2 py-2 pr-4 text-left font-normal text-neutral-500"
                      >
                        {column.label}
                      </th>
                      <td className="break-words py-2 text-neutral-900">
                        {column.value === "weight" && detail.weight
                          ? `${detail.weight} cts`
                          : detail[column.value] ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
          <div className="hidden xl:block">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-300">
                  {columns.map((column) => (
                    <th
                      key={column.value}
                      scope="col"
                      className="break-words px-1 pb-2 font-semibold text-neutral-700 first:pl-0 last:pr-0"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {details.map((detail, index) => (
                  <tr
                    key={`${detail.type ?? "stone"}-${detail.shape ?? "shape"}-${index}`}
                    className="border-b border-neutral-200 last:border-b-0"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.value}
                        className={[
                          "break-words px-1 py-2 align-top text-neutral-800 first:pl-0 last:pr-0",
                          column.value === "type" || column.value === "shape"
                            ? "uppercase"
                            : "",
                        ].join(" ")}
                      >
                        {column.value === "weight" && detail.weight
                          ? `${detail.weight} cts`
                          : detail[column.value] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </section>
  );
}
