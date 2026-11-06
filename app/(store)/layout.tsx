export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="flex flex-1 flex-col lg:min-h-0">{children}</main>;
}