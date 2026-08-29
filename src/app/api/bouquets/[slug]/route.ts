import { NextResponse } from 'next/server';
import { getBouquetBySlug } from '@/lib/supabase';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const bouquet = await getBouquetBySlug(slug);
    if (!bouquet) {
      return NextResponse.json({ error: 'Bouquet not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, bouquet });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
