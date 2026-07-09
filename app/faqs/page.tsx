import type { Metadata } from "next";
import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "FAQs — Danielle & Sahaj",
};

export default function FaqsPage() {
  return (
    <PlaceholderPage
      title="FAQs"
      accent="text-poppy"
      message="Answers to your questions about travel, parking, the schedule, and more are on their way. Check back soon!"
    />
  );
}
