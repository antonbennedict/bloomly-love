import { getBouquetBySlug } from "@/lib/supabase";
import RecipientView from "@/components/RecipientView";
import Navbar from "@/components/Navbar";
import { Gift, Home } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

// Asynchronous Metadata generation for dynamic social media previews (OG images, etc.)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bouquet = await getBouquetBySlug(slug);

  if (!bouquet) {
    return {
      title: "Bouquet Not Found — Bloomly",
      description: "This bouquet may have expired or does not exist."
    };
  }

  const sender = bouquet.sender_name || "A Secret Admirer";
  const recipient = bouquet.recipient_name || "Someone Special";
  
  return {
    title: `💐 Open your gift, ${recipient}!`,
    description: `You've received a custom digital flower bouquet from ${sender}. Open it to see the arrangement and read their card!`,
    openGraph: {
      title: `💐 A bouquet is waiting for ${recipient}!`,
      description: `A custom flower arrangement created just for you by ${sender} via Bloomly.`,
      type: "website"
    }
  };
}

export default async function BouquetPage({ params }: Props) {
  const { slug } = await params;
  const bouquet = await getBouquetBySlug(slug);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <RecipientView initialBouquet={bouquet} slug={slug} />
    </div>
  );
}

