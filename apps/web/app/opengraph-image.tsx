import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = 'WanderWrap — Make every gift feel personal';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const emblem = await readFile(join(process.cwd(), 'public', 'landing', 'wanderwrap-emblem.png'), 'base64');
const emblemSrc = `data:image/png;base64,${emblem}`;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8f3ea', background: '#173f35', padding: '64px' }}>
        <div style={{ position: 'absolute', inset: '28px', display: 'flex', border: '1px solid rgba(216,188,142,.35)' }} />
        <div style={{ position: 'absolute', width: '540px', height: '540px', right: '-170px', top: '-190px', display: 'flex', borderRadius: '50%', background: 'rgba(217,160,170,.08)' }} />
        <div style={{ position: 'absolute', width: '430px', height: '430px', left: '-180px', bottom: '-230px', display: 'flex', borderRadius: '50%', background: 'rgba(216,188,142,.08)' }} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '48px' }}>
            <img src={emblemSrc} width={68} height={68} alt="" />
            <span style={{ fontFamily: 'serif', fontSize: '34px', letterSpacing: '8px', textTransform: 'uppercase' }}>WanderWrap</span>
          </div>
          <div style={{ display: 'flex', fontFamily: 'serif', fontSize: '74px', lineHeight: 1.02, letterSpacing: '-2px' }}>Make every gift feel personal.</div>
          <div style={{ width: '680px', display: 'flex', justifyContent: 'center', marginTop: '30px', color: 'rgba(248,243,234,.72)', fontSize: '23px', lineHeight: 1.45 }}>Thoughtful gifts, shaped around the people who matter.</div>
          <div style={{ width: '72px', height: '1px', display: 'flex', marginTop: '42px', background: '#d8bc8e' }} />
        </div>
      </div>
    ),
    size
  );
}
