import Builder from "@/components/Builder";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Design Your Bouquet — Bloomly",
  description: "Drag flowers, wrapper wraps, fillers, and accents to build a customizable virtual flower arrangement. Add a card and share.",
};

export default function CreatePage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-background">
      <Navbar />
      <Builder />
    </div>
  );
}
