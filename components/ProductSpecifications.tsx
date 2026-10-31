type ProductSpecification = {
  label: string;
  value: string;
};

export function ProductSpecifications({
  specifications,
}: {
  specifications: ProductSpecification[];
}) {
  return (
    <table className="w-full border-collapse text-left text-sm">
      <tbody>
        {specifications.map((spec) => (
          <tr key={spec.label} className="border-b border-neutral-200">
            <th
              scope="row"
              className="w-1/2 py-2 pr-4 font-normal text-neutral-500"
            >
              {spec.label}
            </th>
            <td className="py-2 text-neutral-900">{spec.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
