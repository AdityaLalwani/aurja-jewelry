import { SiteFooter } from "../components/homepage/SiteFooter";

export default function InformationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
