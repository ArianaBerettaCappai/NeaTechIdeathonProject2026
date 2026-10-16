import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailCard } from "@/components/ProductDetailCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aberdeen Angus · Origen Sustentable verificado" },
      { name: "description", content: "Novillo Angus 100% pastura con trazabilidad, mapa de origen cero deforestación y ruta de potreros." },
      { property: "og:title", content: "Aberdeen Angus · Origen Sustentable verificado" },
      { property: "og:description", content: "Perfil trazable premium: peso, alimentación, origen y bienestar animal." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <ProductDetailCard />
    </main>
  ),
});
