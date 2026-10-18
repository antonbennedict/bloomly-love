import Builder from "@/components/Builder";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Design Your Bouquet — Bloomly",
  description: "Arrange hand-drawn flowers, wraps and greenery into a bouquet, write a card, and share it with a link, email or QR code.",
};

export default function CreatePage() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-background">
      <Navbar />
      <Builder />
    </div>
  );
}
