import { getJewelryProductsBySkus } from "@/lib/swell";
import { SectionHeading } from "./SectionHeading";
import { ShopTheLookCarousel } from "./ShopTheLookCarousel";

const shopTheLookScenes = [
  {
    background: "/sbl-bg.png",
    skus: ["ASJ026", "ASJ023", "ASJ049", "ASJ042"],//59,60
  },
  {
    background: "/sbl-bg2.png",
    skus: ["ASJ038"],//52
  },
  {
    background: "/sbl-bg3.png",
    skus: ["ASJ001", "ASJ003"],
  },
] as const;

export async function ShopTheLook() {
  const scenes = await Promise.all(
    shopTheLookScenes.map(async ({ background, skus }) => ({
      background,
      products: await getJewelryProductsBySkus(skus),
    })),
  );

  return (
    <section
      id="shop-by-look"
      aria-label="Shop by Look"
      className="bg-chandan py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Curated for you"
          title="Shop by Look"
          description="Explore the pieces in each look and find the details that make it yours."
        />
      </div>
      <div className="mt-8 sm:mt-10">
        <ShopTheLookCarousel scenes={scenes} />
      </div>
    </section>
  );
}
