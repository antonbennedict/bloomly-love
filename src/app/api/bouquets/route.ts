import { NextResponse } from 'next/server';
import { saveBouquet, getPublicBouquets, BouquetData } from '@/lib/supabase';

export async function GET() {
  try {
    const list = await getPublicBouquets();
    return NextResponse.json({ success: true, bouquets: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch public bouquets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Server-side validation
    if (!body.slug || !body.composition) {
      return NextResponse.json({ error: 'Slug and composition are required' }, { status: 400 });
    }

    const bouquetData: BouquetData = {
      slug: body.slug,
      owner_id: body.owner_id,
      title: body.title || 'Custom Bouquet',
      message: body.message || 'Thinking of you!',
      sender_name: body.sender_name || 'A Secret Admirer',
      recipient_name: body.recipient_name || 'Someone Special',
      composition: body.composition,
      card_style: body.card_style || 'classic',
      is_public: !!body.is_public
    };

    const res = await saveBouquet(bouquetData);
    if (res.success) {
      return NextResponse.json({ success: true, data: res.data });
    } else {
      return NextResponse.json({ error: res.error || 'Failed to save bouquet' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { supabase } = await import('@/lib/supabase');
    if (supabase) {
      const { error } = await supabase
        .from('bouquets')
        .delete()
        .neq('slug', ''); // Delete all rows in bouquets table
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
    return NextResponse.json({ success: true, message: 'Gallery items cleared successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
