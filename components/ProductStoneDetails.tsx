import { DiamondIcon } from "@/app/components/icons";
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
      className="scroll-mt-24 border-t border-neutral-200 pt-5"
      aria-labelledby="product-stone-details-heading"
    >
      <h2
        id="product-stone-details-heading"
        className="mb-5 flex items-center gap-2 text-sm font-medium text-neutral-800"
      >
        <DiamondIcon className="h-4 w-4" />
        Stone Details
      </h2>
      <div className="sm:hidden">
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
                  <td className="py-2 text-neutral-900">
                    {detail[column.value] ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[34rem] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-300">
              {columns.map((column) => (
                <th
                  key={column.value}
                  scope="col"
                  className="px-2 pb-3 font-semibold text-neutral-700 first:pl-0 last:pr-0"
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
                      "px-2 py-3 align-top text-neutral-800 first:pl-0 last:pr-0",
                      column.value === "type" || column.value === "shape"
                        ? "uppercase"
                        : "",
                    ].join(" ")}
                  >
                    {detail[column.value] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
