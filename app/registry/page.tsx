import type { Metadata } from "next";
import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Registry — Danielle & Sahaj",
};

export default function RegistryPage() {
  return (
    <PlaceholderPage
      title="Registry"
      accent="text-blue-deep"
      message="Our registry is still in the works. Your presence is the greatest gift — details coming soon!"
    />
  );
}
