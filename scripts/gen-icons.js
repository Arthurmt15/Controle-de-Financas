const sharp = require('sharp');
const fs = require('fs');

const svgAny = `
<svg width='512' height='512' viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'>
  <defs>
    <linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#6366f1'/>
      <stop offset='45%' stop-color='#06b6d4'/>
      <stop offset='100%' stop-color='#8b5cf6'/>
    </linearGradient>
    <linearGradient id='shine' x1='0%' y1='0%' x2='0%' y2='100%'>
      <stop offset='0%' stop-color='white' stop-opacity='0.22'/>
      <stop offset='28%' stop-color='white' stop-opacity='0'/>
    </linearGradient>
    <filter id='shadow' x='-20%' y='-20%' width='140%' height='140%'>
      <feDropShadow dx='0' dy='16' stdDeviation='24' flood-color='#6366f1' flood-opacity='0.35'/>
    </filter>
  </defs>
  <rect width='512' height='512' rx='112' fill='url(#g)'/>
  <rect width='512' height='512' rx='112' fill='url(#shine)'/>
  <rect x='24' y='24' width='464' height='1' rx='0.5' fill='white' opacity='0.18'/>
  <text x='256' y='325' text-anchor='middle' font-family='Inter, Geist, system-ui, sans-serif' font-size='280' font-weight='700' letter-spacing='-10' fill='white' filter='url(#shadow)'>$</text>
</svg>
`;

const svgMaskable = `
<svg width='512' height='512' viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'>
  <defs>
    <linearGradient id='g2' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#6366f1'/>
      <stop offset='45%' stop-color='#06b6d4'/>
      <stop offset='100%' stop-color='#8b5cf6'/>
    </linearGradient>
    <linearGradient id='shine2' x1='0%' y1='0%' x2='0%' y2='100%'>
      <stop offset='0%' stop-color='white' stop-opacity='0.18'/>
      <stop offset='30%' stop-color='white' stop-opacity='0'/>
    </linearGradient>
  </defs>
  <rect width='512' height='512' rx='0' fill='url(#g2)'/>
  <rect width='512' height='512' rx='0' fill='url(#shine2)'/>
  <g transform='translate(64,64)'>
    <rect width='384' height='384' rx='84' fill='url(#g2)'/>
    <rect width='384' height='384' rx='84' fill='url(#shine2)'/>
    <text x='192' y='252' text-anchor='middle' font-family='Inter, Geist, system-ui, sans-serif' font-size='210' font-weight='700' fill='white'>$</text>
  </g>
</svg>
`;

async function gen(){
  for(const s of [16,32,180,192,512]){
    await sharp(Buffer.from(svgAny)).resize(s,s).png().toFile(`public/icon-${s}.png`);
    console.log(`wrote icon-${s}.png`);
  }
  await sharp(Buffer.from(svgMaskable)).resize(512,512).png().toFile('public/icon-512-maskable.png');
  await sharp(Buffer.from(svgMaskable)).resize(192,192).png().toFile('public/icon-192-maskable.png');
  await sharp(Buffer.from(svgAny)).resize(180,180).png().toFile('public/apple-touch-icon.png');
  await sharp(Buffer.from(svgAny)).resize(32,32).png().toFile('public/favicon-32x32.png');
  await sharp(Buffer.from(svgAny)).resize(16,16).png().toFile('public/favicon-16x16.png');
  // Ensure standard names
  await sharp(Buffer.from(svgAny)).resize(192,192).png().toFile('public/icon-192.png');
  await sharp(Buffer.from(svgAny)).resize(512,512).png().toFile('public/icon-512.png');
  // favicon.ico as png copy (browsers accept png ico)
  await sharp(Buffer.from(svgAny)).resize(32,32).png().toFile('public/favicon.ico');
  console.log('done');
}
gen().catch(e=>{console.error(e);process.exit(1)});
