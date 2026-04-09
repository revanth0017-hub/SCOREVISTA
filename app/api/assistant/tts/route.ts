import { NextResponse } from 'next/server';

/**
 * Proxies OpenAI-style TTS via RapidAPI so the key stays server-side.
 * Set RAPIDAPI_KEY in .env.local (do not commit secrets).
 */
export async function POST(req: Request) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    return NextResponse.json({ success: false, message: 'TTS not configured (missing RAPIDAPI_KEY).' }, { status: 503 });
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const text = (body.text || '').trim().slice(0, 800);
  if (!text) {
    return NextResponse.json({ success: false, message: 'text required' }, { status: 400 });
  }

  try {
    const upstream = await fetch('https://open-ai-text-to-speech1.p.rapidapi.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'open-ai-text-to-speech1.p.rapidapi.com',
        'x-rapidapi-key': key,
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        instructions: 'Speak clearly and briefly, friendly assistant tone.',
        voice: 'alloy',
      }),
    });

    const ct = upstream.headers.get('content-type') || '';

    if (ct.includes('application/json')) {
      const j = await upstream.json().catch(() => ({}));
      const audioB64 =
        (j as { audio?: string }).audio ||
        (j as { data?: string }).data ||
        (j as { result?: string }).result;
      if (audioB64 && typeof audioB64 === 'string') {
        const buf = Buffer.from(audioB64, 'base64');
        return new NextResponse(buf, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'no-store',
          },
        });
      }
      return NextResponse.json(
        { success: false, message: 'Unexpected TTS JSON shape', detail: j },
        { status: 502 }
      );
    }

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      return NextResponse.json(
        { success: false, message: 'TTS upstream error', status: upstream.status, detail: errText.slice(0, 200) },
        { status: 502 }
      );
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': ct.includes('audio') ? ct : 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'TTS failed';
    return NextResponse.json({ success: false, message: msg }, { status: 502 });
  }
}
