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
      // 1. Fetch all bouquet IDs
      const { data: allItems } = await supabase.from('bouquets').select('id');
      if (allItems && allItems.length > 0) {
        const ids = allItems.map(item => item.id);
        const { error: delError } = await supabase.from('bouquets').delete().in('id', ids);
        if (delError) {
          // Fallback: delete using date filter
          await supabase.from('bouquets').delete().gt('created_at', '1970-01-01T00:00:00Z');
        }
      }
    }
    return NextResponse.json({ success: true, message: 'All database records deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
