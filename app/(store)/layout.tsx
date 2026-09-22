export default async function StoreLayout({
  children,
}: LayoutProps<"/">) {
  return <main className="flex flex-1 flex-col">{children}</main>;
}