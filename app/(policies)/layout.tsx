import { SiteFooter } from "../components/homepage/SiteFooter";

export default function InformationLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
