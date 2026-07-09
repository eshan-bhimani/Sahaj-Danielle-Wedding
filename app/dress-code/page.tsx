import type { Metadata } from "next";
import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Dress Code — Danielle & Sahaj",
};

export default function DressCodePage() {
  return (
    <PlaceholderPage
      title="Dress Code"
      accent="text-magenta"
      message="We're putting together attire guidance for each celebration — Western and Pakistani options for every event. Check back soon!"
    />
  );
}
