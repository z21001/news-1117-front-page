// Builds page.html: a 1024x1024 front page of the world's news of Tuesday 17 November 2026.
// Every illustration is drawn here as inline SVG; the map is Natural Earth 110m land (public domain).
const fs = require('fs');
const path = require('path');
const map = JSON.parse(fs.readFileSync(path.join(__dirname, 'map.json'), 'utf8'));

const C = { eu: '#2257a8', me: '#c95f12', as: '#7b3aa3', af: '#24804a', am: '#c0332a', gl: '#13808a' };
const REGION = { eu: 'Europe', me: 'Middle East', as: 'Asia', af: 'Africa', am: 'Americas', gl: 'Global' };

// ---------- small drawing helpers ----------
const flag = {
  us: (x, y, w, h) => {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>`;
    for (let i = 0; i < 7; i++) s += `<rect x="${x}" y="${y + (i * 2 * h) / 13}" width="${w}" height="${h / 13}" fill="#b22234"/>`;
    s += `<rect x="${x}" y="${y}" width="${w * 0.42}" height="${(h * 7) / 13}" fill="#3c3b6e"/>`;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) s += `<circle cx="${x + w * 0.06 + c * w * 0.1}" cy="${y + h * 0.08 + r * h * 0.15}" r="${h * 0.025}" fill="#fff"/>`;
    return s + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#0003"/>`;
  },
  in: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h / 3}" fill="#ff9933"/><rect x="${x}" y="${y + h / 3}" width="${w}" height="${h / 3}" fill="#fff"/><rect x="${x}" y="${y + (2 * h) / 3}" width="${w}" height="${h / 3}" fill="#138808"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="${h / 8}" fill="none" stroke="#000080" stroke-width="1.2"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#0003"/>`,
  jp: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#0003"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="${h * 0.3}" fill="#bc002d"/>`,
  au: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#012169"/><path d="M${x},${y} L${x + w / 2},${y + h / 2} M${x + w / 2},${y} L${x},${y + h / 2}" stroke="#fff" stroke-width="${h * 0.1}"/><path d="M${x + w / 4},${y} V${y + h / 2} M${x},${y + h / 4} H${x + w / 2}" stroke="#fff" stroke-width="${h * 0.14}"/><path d="M${x + w / 4},${y} V${y + h / 2} M${x},${y + h / 4} H${x + w / 2}" stroke="#c8102e" stroke-width="${h * 0.07}"/>${[[0.75, 0.25], [0.62, 0.55], [0.86, 0.48], [0.75, 0.82], [0.25, 0.76]].map(([a, b]) => `<circle cx="${x + w * a}" cy="${y + h * b}" r="${h * 0.055}" fill="#fff"/>`).join('')}`,
  mx: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w / 3}" height="${h}" fill="#006847"/><rect x="${x + w / 3}" y="${y}" width="${w / 3}" height="${h}" fill="#fff"/><rect x="${x + (2 * w) / 3}" y="${y}" width="${w / 3}" height="${h}" fill="#ce1126"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="${h * 0.14}" fill="#8a5a1c"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#0003"/>`,
  bo: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h / 3}" fill="#d52b1e"/><rect x="${x}" y="${y + h / 3}" width="${w}" height="${h / 3}" fill="#f9e300"/><rect x="${x}" y="${y + (2 * h) / 3}" width="${w}" height="${h / 3}" fill="#007934"/>`,
  mn: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w / 3}" height="${h}" fill="#c4272f"/><rect x="${x + w / 3}" y="${y}" width="${w / 3}" height="${h}" fill="#015197"/><rect x="${x + (2 * w) / 3}" y="${y}" width="${w / 3}" height="${h}" fill="#c4272f"/><g fill="#f9cf02"><circle cx="${x + w / 6}" cy="${y + h * 0.22}" r="${h * 0.07}"/><rect x="${x + w / 6 - h * 0.08}" y="${y + h * 0.36}" width="${h * 0.16}" height="${h * 0.42}"/></g>`,
  rs: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h / 3}" fill="#c6363c"/><rect x="${x}" y="${y + h / 3}" width="${w}" height="${h / 3}" fill="#0c4076"/><rect x="${x}" y="${y + (2 * h) / 3}" width="${w}" height="${h / 3}" fill="#fff"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#0003"/>`,
  cd: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#007fff"/><path d="M${x},${y + h} L${x + w},${y}" stroke="#f7d618" stroke-width="${h * 0.42}"/><path d="M${x},${y + h} L${x + w},${y}" stroke="#ce1021" stroke-width="${h * 0.26}"/><circle cx="${x + w * 0.2}" cy="${y + h * 0.25}" r="${h * 0.12}" fill="#f7d618"/>`,
  il: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#0003"/><rect x="${x}" y="${y + h * 0.12}" width="${w}" height="${h * 0.14}" fill="#0038b8"/><rect x="${x}" y="${y + h * 0.74}" width="${w}" height="${h * 0.14}" fill="#0038b8"/><path d="M${x + w / 2},${y + h * 0.33} l${h * 0.15},${h * 0.26} h-${h * 0.3}z M${x + w / 2},${y + h * 0.67} l${h * 0.15},-${h * 0.26} h-${h * 0.3}z" fill="none" stroke="#0038b8" stroke-width="1.2"/>`,
  tr: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e30a17"/><circle cx="${x + w * 0.38}" cy="${y + h / 2}" r="${h * 0.25}" fill="#fff"/><circle cx="${x + w * 0.43}" cy="${y + h / 2}" r="${h * 0.2}" fill="#e30a17"/><circle cx="${x + w * 0.6}" cy="${y + h / 2}" r="${h * 0.09}" fill="#fff"/>`,
  xk: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#244aa5"/><path d="M${x + w * 0.38},${y + h * 0.4} l${w * 0.18},-${h * 0.05} l${w * 0.08},${h * 0.2} l-${w * 0.06},${h * 0.32} l-${w * 0.17},-${h * 0.06}z" fill="#d0a650"/>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${x + w * (0.3 + i * 0.08)}" cy="${y + h * 0.22 - Math.sin((i / 5) * Math.PI) * h * 0.06}" r="${h * 0.035}" fill="#fff"/>`).join('')}`,
  bd: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#006a4e"/><circle cx="${x + w * 0.45}" cy="${y + h / 2}" r="${h * 0.3}" fill="#f42a41"/>`,
};
const drone = (x, y, s = 1, col = '#1d1f24') => `<path transform="translate(${x},${y}) scale(${s})" d="M0,0 L-10,-4 L-7,0 L-10,4 Z M-4,0 L-8,-8 L-6,0 L-8,8Z" fill="${col}"/>`;
const jet = (x, y, s = 1, rot = 0, col = '#33465e') => `<path transform="translate(${x},${y}) rotate(${rot}) scale(${s})" d="M10,0 L-8,-2 L-12,-8 L-14,-8 L-12,-1 L-14,0 L-12,1 L-14,8 L-12,8 L-8,2Z M2,-1 L-4,-11 L-7,-11 L-4,-1Z M2,1 L-4,11 L-7,11 L-4,1Z" fill="${col}"/>`;
const blast = (x, y, r = 8) => { let p = ''; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, rr = i % 2 ? r * 0.5 : r; p += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1); } return `<path d="${p}Z" fill="#ffb21f" stroke="#e2540f" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="${r * 0.3}" fill="#fff3b0"/>`; };
const smoke = (x, y, n = 4, s = 1) => { let o = ''; for (let i = 0; i < n; i++) o += `<circle cx="${x + i * 4 * s}" cy="${y - i * 9 * s}" r="${(6 + i * 2.5) * s}" fill="#555b63" opacity="${0.85 - i * 0.13}"/>`; return o; };
const cap = (w, h, text, col) => `<rect x="0" y="${h - 15}" width="${w}" height="15" fill="${col}"/><text x="${w / 2}" y="${h - 4.6}" text-anchor="middle" font-family="Segoe UI" font-weight="700" font-size="${w < 200 ? 7.6 : 9}" letter-spacing="${w < 200 ? 0.3 : 0.8}"fill="#fff">${text}</text>`;
const label = (x, y, t, fill = '#fff', bg = '#1d1f24', fs = 9) => { const w = t.length * fs * 0.62 + 10; return `<rect x="${x - w / 2}" y="${y - fs - 2}" width="${w}" height="${fs + 6}" rx="2.5" fill="${bg}"/><text x="${x}" y="${y + 0.5}" text-anchor="middle" font-family="Segoe UI" font-weight="700" font-size="${fs}" fill="${fill}">${t}</text>`; };
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

// ---------- lead illustrations (300 x 112) ----------
const W1 = 300, H1 = 112;
const artBridge = svg(W1, H1, `
<defs><linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9cfe0"/><stop offset="1" stop-color="#e3ecf2"/></linearGradient>
<linearGradient id="sea1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f7aa3"/><stop offset="1" stop-color="#1d4766"/></linearGradient></defs>
<rect width="300" height="112" fill="url(#sky1)"/>
<rect y="66" width="300" height="46" fill="url(#sea1)"/>
<path d="M0,64 Q20,58 40,62 L40,66 L0,66Z" fill="#6f7f62"/><path d="M262,62 Q282,57 300,60 L300,66 L262,66Z" fill="#6f7f62"/>
<!-- rail bridge behind -->
<rect x="0" y="50" width="300" height="3" fill="#7c8794"/>${[20, 60, 100, 140, 180, 220, 260].map(x => `<rect x="${x}" y="53" width="3" height="14" fill="#7c8794"/>`).join('')}
<!-- road bridge in front, a span fallen -->
<rect x="0" y="58" width="128" height="6" fill="#2b3038"/><rect x="186" y="58" width="114" height="6" fill="#2b3038"/>
${[14, 50, 86, 122, 192, 228, 264].map(x => `<rect x="${x}" y="64" width="6" height="22" fill="#2b3038"/>`).join('')}
<path d="M110,48 Q157,22 204,48" fill="none" stroke="#2b3038" stroke-width="3"/>
<path d="M132,63 L184,80 L183,86 L130,69Z" fill="#3a4049"/>
<path d="M126,90 q8,-5 16,0 q8,5 16,0 q8,-5 16,0 q8,5 16,0" fill="none" stroke="#cfe3f1" stroke-width="1.6"/>
${smoke(150, 52, 5, 1)}${blast(156, 60, 9)}
${drone(70, 22, 1.1)}${drone(92, 32, 0.9)}${drone(236, 18, 1)}
<text x="8" y="80" font-family="Segoe UI" font-weight="700" font-size="8.5" fill="#fff" opacity=".9">CRIMEA</text>
<text x="292" y="80" text-anchor="end" font-family="Segoe UI" font-weight="700" font-size="8.5" fill="#fff" opacity=".9">RUSSIA</text>
${label(156, 84, 'ROAD SECTION REPORTED IN THE STRAIT', '#fff', '#b3261e', 8)}
${cap(300, 112, 'KERCH STRAIT · HIT FOR A SECOND DAY', C.eu)}`);

const artGulf = svg(W1, H1, `
<rect width="300" height="112" fill="#8ec3df"/>
<path d="M0,0 H300 V40 Q262,44 240,36 Q222,30 206,40 Q180,30 150,26 Q110,22 80,14 Q40,8 0,10Z" fill="#e6d7b5"/>
<path d="M0,112 V56 Q30,60 46,72 Q60,80 72,74 L80,112Z" fill="#e6d7b5"/>
<path d="M300,112 V58 Q270,56 250,66 Q236,72 232,86 Q230,100 238,112Z" fill="#e6d7b5"/>
<ellipse cx="62" cy="64" rx="5" ry="7" fill="#e6d7b5" stroke="#b9a77f"/>
<ellipse cx="212" cy="46" rx="16" ry="4" fill="#e6d7b5" stroke="#b9a77f" transform="rotate(-12 212 46)"/>
<text x="110" y="12" font-family="Segoe UI" font-weight="700" font-size="9" fill="#6b5a36" letter-spacing="2">IRAN</text>
<text x="44" y="88" font-family="Segoe UI" font-weight="700" font-size="7.5" fill="#6b5a36">BAHRAIN</text>
<text x="196" y="36" font-family="Segoe UI" font-weight="700" font-size="7.5" fill="#6b5a36">QESHM</text>
<text x="262" y="84" font-family="Segoe UI" font-weight="700" font-size="7.5" fill="#6b5a36">OMAN</text>
<path d="M120,26 Q96,40 72,58" fill="none" stroke="#b3261e" stroke-width="1.6" stroke-dasharray="4 3"/>
${drone(96, 40, 0.8, '#b3261e')}<path d="M68,52 l8,8 m0,-8 l-8,8" stroke="#b3261e" stroke-width="2.4"/>
${label(108, 60, 'DRONES INTERCEPTED', '#fff', '#b3261e', 7.5)}
<path d="M150,92 Q180,70 206,50" fill="none" stroke="#1f3f66" stroke-width="1.6" stroke-dasharray="4 3"/>
${jet(176, 72, 0.8, -40, '#1f3f66')}${blast(212, 45, 7)}${blast(222, 42, 5)}
${label(166, 86, 'US STRIKES ON QESHM', '#fff', '#1f3f66', 7.5)}
<path d="M248,52 h22 l-3,6 h-17z" fill="#46505c"/><rect x="262" y="46" width="4" height="6" fill="#46505c"/>${smoke(262, 44, 3, 0.6)}
<path d="M258,49 q3,-7 6,0" fill="#ff8a1e"/>
${cap(300, 112, 'BAHRAIN · QESHM ISLAND · GULF OF OMAN', C.me)}`);

const artQuad = svg(W1, H1, `
<rect width="300" height="112" fill="#efe9f4"/>
<rect x="64" y="8" width="172" height="20" rx="3" fill="${C.as}"/>
<text x="150" y="22" text-anchor="middle" font-family="Segoe UI" font-weight="700" font-size="10" letter-spacing="1.6" fill="#fff">QUAD LEADERS · MANILA</text>
${[['us', 'US'], ['in', 'INDIA'], ['jp', 'JAPAN'], ['au', 'AUSTRALIA']].map(([k, n], i) => { const x = 22 + i * 68; return `<rect x="${x + 25}" y="36" width="2" height="34" fill="#666"/>${flag[k](x + 27, 36, 34, 21)}<rect x="${x}" y="70" width="56" height="12" fill="#fff" stroke="#c9bfd4"/><text x="${x + 28}" y="79" text-anchor="middle" font-family="Segoe UI" font-weight="700" font-size="7.5" fill="#333">${n}</text>`; }).join('')}
<rect x="10" y="82" width="280" height="6" fill="#6d4c33"/>
<g transform="translate(150,90)"><path d="M-7,0 L0,-6 L7,0 L0,4Z" fill="#7fd1c7" stroke="#2f7f77"/></g>
${cap(300, 112, 'CRITICAL-MINERALS DEALS · TRUMP ON TO SHENZHEN', C.as)}`);

// ---------- grid illustrations (160 x 64) ----------
const W2 = 160, H2 = 64;
const virus = (x, y, r) => { let s = `<circle cx="${x}" cy="${y}" r="${r}" fill="#d64545"/>`; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; s += `<line x1="${x + Math.cos(a) * r}" y1="${y + Math.sin(a) * r}" x2="${x + Math.cos(a) * (r + 4)}" y2="${y + Math.sin(a) * (r + 4)}" stroke="#d64545" stroke-width="1.6"/><circle cx="${x + Math.cos(a) * (r + 4.5)}" cy="${y + Math.sin(a) * (r + 4.5)}" r="1.8" fill="#d64545"/>`; } return s; };
const art = {
  measles: svg(W2, H2, `<rect width="160" height="64" fill="#fbecec"/>${flag.us(14, 12, 30, 19)}${flag.mx(65, 12, 30, 19)}${flag.bo(116, 12, 30, 19)}<path d="M10,38 L150,38" stroke="#b3261e" stroke-width="0"/>${virus(29, 42, 3)}${virus(80, 42, 3)}${virus(131, 42, 3)}${cap(160, 64, 'MEASLES-FREE STATUS LOST', C.am)}`),
  nvidia: svg(W2, H2, `<rect width="160" height="64" fill="#15191d"/><rect x="12" y="10" width="34" height="34" rx="3" fill="#2a3138" stroke="#76b900" stroke-width="1.5"/><rect x="20" y="18" width="18" height="18" fill="#76b900"/>${[0, 1, 2, 3].map(i => `<rect x="${15 + i * 8}" y="6" width="2" height="4" fill="#9aa"/><rect x="${15 + i * 8}" y="44" width="2" height="4" fill="#9aa"/>`).join('')}${[12, 18, 25, 33].map((h, i) => `<rect x="${56 + i * 9}" y="${46 - h}" width="6" height="${h}" fill="${i === 3 ? '#76b900' : '#4c6b2a'}"/>`).join('')}<text x="152" y="22" text-anchor="end" font-family="Segoe UI" font-weight="800" font-size="12.5" fill="#9be13a">$115.8bn</text><text x="152" y="34" text-anchor="end" font-family="Segoe UI" font-weight="700" font-size="8" fill="#cfd8c0">+103% IN A YEAR</text>${cap(160, 64, 'NVIDIA · QUARTERLY SALES', '#2f3a20')}`),
  ebola: svg(W2, H2, `<rect width="160" height="64" fill="#eef5ee"/>${flag.cd(10, 10, 34, 22)}<path d="M54,44 Q90,42 110,30 T150,8" fill="none" stroke="#b3261e" stroke-width="2.5"/><path d="M54,44 Q90,42 110,30 T150,8 V49 H54Z" fill="#b3261e" opacity=".12"/><text x="58" y="20" font-family="Segoe UI" font-weight="800" font-size="11" fill="#7a1a14">11,254 CASES</text><text x="10" y="44" font-family="Segoe UI" font-weight="700" font-size="7.5" fill="#24804a">5,505 DEAD</text>${cap(160, 64, 'DR CONGO · EBOLA', C.af)}`),
  mongolia: svg(W2, H2, `<rect width="160" height="64" fill="#e9eff7"/>${flag.mn(12, 10, 46, 28)}<g transform="rotate(-6 112 26)"><rect x="80" y="6" width="58" height="40" fill="#fff" stroke="#9aa6b5"/><text x="109" y="17" text-anchor="middle" font-family="Georgia" font-weight="700" font-size="7.5" fill="#222">RESIGNATION</text>${[22, 27, 32, 37].map(y => `<line x1="86" y1="${y}" x2="132" y2="${y}" stroke="#c4cbd4"/>`).join('')}<path d="M112,41 q6,-6 10,0 t10,-2" fill="none" stroke="#1d3c88" stroke-width="1.2"/></g>${cap(160, 64, 'ULAANBAATAR', C.as)}`),
  serbia: svg(W2, H2, `<rect width="160" height="64" fill="#f3f0ee"/>${(() => { let s = ''; let n = 0; for (let r = 0; r < 4; r++) { const R = 18 + r * 7, k = 9 + r * 3; for (let i = 0; i <= k; i++) { const a = Math.PI + (i / k) * Math.PI; s += `<circle cx="${80 + Math.cos(a) * R}" cy="${46 + Math.sin(a) * R}" r="2.2" fill="${(i / k) < 0.56 ? '#c6363c' : '#8a95a3'}"/>`; n++; } } return s; })()}${flag.rs(8, 8, 26, 16)}<text x="152" y="16" text-anchor="end" font-family="Segoe UI" font-weight="800" font-size="7" fill="#c6363c">NEW</text><text x="152" y="25" text-anchor="end" font-family="Segoe UI" font-weight="800" font-size="7" fill="#c6363c">MAJORITY</text>${cap(160, 64, 'BELGRADE · PARLIAMENT', C.eu)}`),
  bangladesh: svg(W2, H2, `<rect width="160" height="64" fill="#eef3ee"/><path d="M8,46 V26 l12,-7 v7 l12,-7 v7 l12,-7 v27Z" fill="#7a838c"/><rect x="38" y="8" width="5" height="12" fill="#7a838c"/>${smoke(70, 24, 3, 0.8).replace(/#555b63/g, '#c9ccd0')}${[60, 76, 92, 108].map((x, i) => `<circle cx="${x}" cy="${36 - (i % 2) * 2}" r="3.2" fill="#3b2b25"/><rect x="${x - 3}" y="${39 - (i % 2) * 2}" width="6" height="8" fill="#2d6a8e"/>`).join('')}<rect x="110" y="10" width="46" height="20" fill="#fff" stroke="#006a4e" stroke-width="1.4"/><text x="133" y="19.5" text-anchor="middle" font-family="Segoe UI" font-weight="800" font-size="7.5" fill="#006a4e">TK 30,000</text><text x="133" y="27" text-anchor="middle" font-family="Segoe UI" font-size="5.6" fill="#333">MIN. WAGE</text><line x1="132" y1="30" x2="132" y2="40" stroke="#555"/>${cap(160, 64, 'DHAKA · GAZIPUR', C.as)}`),
  an12: svg(W2, H2, `<rect width="160" height="64" fill="#dfe7ee"/><rect y="38" width="160" height="26" fill="#f4f7fa"/>${[10, 26, 120, 136, 150].map(x => `<path d="M${x},40 l6,-14 l6,14z" fill="#3f5a4a"/>`).join('')}<g transform="translate(70,30) rotate(14)"><path d="M-34,0 Q-30,-5 -20,-5 L22,-4 Q30,-3 32,0 Q30,3 22,4 L-20,5 Q-30,5 -34,0Z" fill="#6c7782"/><path d="M-6,-4 L-12,-24 L-4,-24 L6,-4Z M-6,4 L-10,18 L-4,18 L4,4Z" fill="#59636d"/><path d="M24,-3 L32,-12 L35,-12 L32,0Z" fill="#59636d"/></g>${smoke(104, 36, 4, 0.8)}${cap(160, 64, 'KEMEROVO · 19 KILLED', '#5b2f2f')}`),
  knesset: svg(W2, H2, `<rect width="160" height="64" fill="#edf1f8"/>${flag.il(10, 8, 36, 24)}<path d="M80,46 V20 M66,46 h28" stroke="#556" stroke-width="2"/><rect x="62" y="10" width="36" height="14" rx="2" fill="#2d4c8a"/><text x="80" y="20" text-anchor="middle" font-family="Segoe UI" font-weight="700" font-size="7" fill="#fff">SPEAKER</text><text x="148" y="22" text-anchor="end" font-family="Segoe UI" font-weight="800" font-size="11" fill="#2d4c8a">66–52</text><text x="148" y="34" text-anchor="end" font-family="Segoe UI" font-weight="600" font-size="7" fill="#445">KAHANA ELECTED</text>${cap(160, 64, 'JERUSALEM · KNESSET', C.me)}`),
  sozcu: svg(W2, H2, `<rect width="160" height="64" fill="#f5eeee"/>${flag.tr(10, 8, 30, 20)}<rect x="52" y="6" width="62" height="38" rx="3" fill="#222"/><rect x="56" y="10" width="54" height="30" fill="#3a3f45"/><text x="83" y="29" text-anchor="middle" font-family="Segoe UI" font-weight="800" font-size="9" fill="#ff5b4f">OFF AIR</text><rect x="78" y="44" width="10" height="4" fill="#222"/><rect x="124" y="22" width="22" height="18" rx="2" fill="#c08a1e"/><path d="M128,22 v-6 a7,7 0 0 1 14,0 v6" fill="none" stroke="#7d6a4a" stroke-width="3"/>${cap(160, 64, 'ISTANBUL · SÖZCÜ TV', C.eu)}`),
  thaci: svg(W2, H2, `<rect width="160" height="64" fill="#eef1f7"/>${flag.xk(10, 8, 36, 24)}<g transform="rotate(-25 92 26)"><rect x="76" y="18" width="32" height="12" rx="3" fill="#7a4b26"/><rect x="90" y="30" width="4" height="20" fill="#5e3a1d"/></g><rect x="70" y="44" width="40" height="5" fill="#5e3a1d"/><text x="150" y="22" text-anchor="end" font-family="Segoe UI" font-weight="800" font-size="11" fill="#244aa5">+17</text><text x="150" y="33" text-anchor="end" font-family="Segoe UI" font-weight="700" font-size="7" fill="#334">MONTHS</text>${cap(160, 64, 'THE HAGUE · THAÇI', C.eu)}`),
  cop31: svg(W2, H2, `<rect width="160" height="64" fill="#e8f3f3"/><circle cx="34" cy="26" r="18" fill="#4b8fc7"/><path d="M22,16 q8,-4 12,4 q-4,6 -10,4z M36,30 q8,-2 10,6 q-6,6 -12,0z" fill="#6cb36a"/><rect x="70" y="8" width="8" height="34" rx="4" fill="#fff" stroke="#888"/><rect x="72" y="20" width="4" height="22" fill="#d64545"/><circle cx="74" cy="44" r="6" fill="#d64545"/><path d="M118,10 q-12,16 -12,22 a12,12 0 0 0 24,0 q0,-6 -12,-22z" fill="#222"/><text x="118" y="36" text-anchor="middle" font-family="Segoe UI" font-weight="800" font-size="10" fill="#fff">?</text>${cap(160, 64, 'COP31 · ANTALYA', C.gl)}`),
  akvan: svg(W2, H2, `<rect width="160" height="64" fill="#21344a"/><path d="M0,10 Q30,14 52,30 Q60,40 58,49 L0,49Z" fill="#4f6b3f"/><path d="M160,6 Q130,16 128,34 L134,49 H160Z" fill="#4f6b3f"/>${[16, 12, 8, 4].map((r, i) => `<path d="M${92 + r},36 a${r},${r * 0.8} 0 1 0 -${r * 0.4},${r * 0.7}" fill="none" stroke="#fff" stroke-width="${2.6 - i * 0.4}" opacity="${0.55 + i * 0.12}" transform="rotate(${i * 50} 92 36)"/>`).join('')}<circle cx="92" cy="36" r="2.5" fill="#21344a"/><text x="8" y="22" font-family="Segoe UI" font-weight="700" font-size="7" fill="#e6edd8">INDIA</text><text x="152" y="12" text-anchor="end" font-family="Segoe UI" font-weight="800" font-size="8" fill="#fff">AKVAN</text>${cap(160, 64, 'BAY OF BENGAL', C.as)}`),
};

// ---------- content ----------
const leads = [
  { n: 1, r: 'eu', field: 'Ukraine war', art: artBridge, h: 'Crimean Bridge hit again; a road span is reported in the sea', d: 'Ukrainian drones strike the Kerch bridge for a second day, killing two. Russia shuts traffic and vows to rebuild.' },
  { n: 2, r: 'me', field: 'Iran war', art: artGulf, h: 'Iran fires drones at a US radar site in Bahrain; US hits Qeshm', d: 'Third such attack in five days, intercepted. US jets strike Qeshm Island; a gas tanker is hit off Oman.' },
  { n: 3, r: 'as', field: 'Diplomacy', art: artQuad, h: 'Quad leaders meet in Manila, unveil a critical-minerals plan', d: 'Trump, Modi, Takaichi and Albanese at their first summit in two years. Trump next meets Xi and Putin in Shenzhen.' },
];
const grid = [
  { n: 4, r: 'am', f: 'Health', art: art.measles, h: 'US, Mexico and Bolivia lose measles-free status', d: 'PAHO cites over a year of spread; 5,700+ US cases.' },
  { n: 5, r: 'am', f: 'Business', art: art.nvidia, h: 'Nvidia’s quarterly sales double to $115.8bn', d: 'Beats forecasts; data centres bring $107.6bn.' },
  { n: 6, r: 'af', f: 'Health', art: art.ebola, h: 'DR Congo’s Ebola outbreak passes 11,000 cases', d: 'Reuters data: spreading at record pace in 6 months.' },
  { n: 7, r: 'as', f: 'Politics', art: art.mongolia, h: 'Mongolia’s president says he will resign', d: 'Khürelsükh denies a $25m railway bribe claim.' },
  { n: 8, r: 'eu', f: 'Politics', art: art.serbia, h: 'Serbia’s student-led parliament meets', d: 'First sitting since the protest movement’s win.' },
  { n: 9, r: 'as', f: 'Labour', art: art.bangladesh, h: 'Tear gas for Bangladesh garment strikers', d: 'They seek Tk 30,000 a month; 37 factories shut.' },
  { n: 10, r: 'eu', f: 'Air crash', art: art.an12, h: 'Russian An-12 crashes in Siberia, 19 die', d: 'Military cargo plane down near Kemerovo.' },
  { n: 11, r: 'me', f: 'Politics', art: art.knesset, h: 'Eisenkot ally Kahana is Knesset speaker', d: 'Likud’s Amir Ohana loses the post, 66–52.' },
  { n: 12, r: 'eu', f: 'Press', art: art.sozcu, h: 'Turkey seizes opposition channel Sözcü TV', d: 'Taken off air; trustee named, 4 executives held.' },
  { n: 13, r: 'eu', f: 'Justice', art: art.thaci, h: 'Kosovo’s Thaçi gets 17 more months', d: 'EU-backed court: obstruction of justice.' },
  { n: 14, r: 'gl', f: 'Climate', art: art.cop31, h: 'COP31 split over a fossil-fuel exit', d: 'Draft urges “accelerated action”; talks end Friday.' },
  { n: 15, r: 'as', f: 'Weather', art: art.akvan, h: 'Cyclone Akvan strengthens in Bay of Bengal', d: 'Odisha evacuates; landfall due around 20 Nov.' },
];
const more = [
  ['me', 'Gaza', 'Israeli strikes kill five, including a child'],
  ['me', 'West Bank', 'settlers kill a woman, 72, near Jericho'],
  ['eu', 'UK', 'sanctions 8 settlement builders and Tzav 9'],
  ['me', 'Israel', 'attorney general freezes E1 settlement tender'],
  ['me', 'Iraq', 'troops told to ring militia town Jurf al-Sakhar'],
  ['me', 'Yemen', 'Houthis say Saudi strike killed 7 in Hudaydah'],
  ['me', 'Hormuz', 'three more ships catch fire, one a supertanker'],
  ['me', 'Iran', 'IRGC claims it downed a US Reaper near Qeshm'],
  ['eu', 'Kyiv', 'Russian strikes damage two Dnipro bridges, metro'],
  ['eu', 'Russia', 'claims 2,000+ Ukrainian drones downed in a day'],
  ['eu', 'Moldova', 'Sandu: a Russian drone flew over Chișinău'],
  ['eu', 'Prague', 'two trains collide; 46 people injured'],
  ['eu', 'N. Macedonia', '5 held over Iran-linked plot in Athens'],
  ['as', 'Bangladesh', 'crowd storms, burns Tungipara police station'],
    ['am', 'Canada–China', 'more tariff cuts after Carney–Xi talks'],
  ['as', 'Malaysia', 'Macron seals strategic pact, rare-earth deal'],
  ['as', 'Indonesia', 'M6.6 quake, deep under the Banda Sea'],
  ['af', 'Guinea', '22 ex-officials, 202 miners jailed over gold'],
  ['am', 'Costa Rica', 'journalist Camilo Rodríguez shot dead'],
  ['am', 'Haiti', 'marches back Salvadoran troops fighting gangs'],
  ['am', 'Ecuador', '16 fishermen sue US over strike on their boat'],
  ['am', 'Alaska', 'Democrat Peltola unseats Sen. Dan Sullivan'],
  ['am', 'Pentagon', 'fails its audit for a ninth year running'],
  ['am', 'US', 'NSA network crashes; Apple Pay, iCloud go down'],
  ['am', 'Washington', 'Trump “looking into” dirty-bomb claim; Iran denies'],
  ['gl', 'Pacific', 'Cyclone Xavier nears the northern Cook Islands'],
  ['eu', 'Ukraine', 'Russian strikes leave 50,000 without power'],
  ['af', 'DR Congo', 'Ebola deaths reach 5,505 as hunger spreads'],
];
const total = leads.length + grid.length + more.length;

// ---------- map ----------
const MX = (lon) => { if (lon < map.LON0) lon += 360; return ((lon - map.LON0) / (map.LON1 - map.LON0)) * map.W; };
const MY = (lat) => ((map.LAT0 - lat) / (map.LAT0 - map.LAT1)) * map.H;
// [n, lat, lon, label dx, label dy]
const pins = [
  [1, 45.3, 36.5, 15, -10], [2, 26.2, 50.6, 6, 13], [3, 14.6, 121, 0, 0], [4, 19.4, -99.1, 0, 0], [5, 37.4, -122, 0, 0],
  [6, 1.5, 29.5, 0, 0], [7, 47.9, 106.9, 0, 0], [8, 44.8, 20.5, -6, -18], [9, 23.8, 90.4, 0, -13], [10, 55.3, 86.1, 0, 0],
  [11, 31.8, 35.2, -10, 15], [12, 41.0, 29.0, 2, -25], [13, 52.1, 4.3, -14, -10], [14, 36.9, 30.7, -17, 8], [15, 15, 87, 6, 8],
];
const dots = [[31.5, 34.4], [31.9, 35.4], [51.5, -0.1], [33.1, 44.1], [14.8, 42.9], [26.5, 56.3], [50.4, 30.5], [55.7, 37.6], [47.0, 28.9], [50.1, 14.4], [42.0, 21.4], [22.9, 89.9], [45.4, -75.7], [3.1, 101.7], [-5.6, 132.7], [9.5, -13.7], [9.9, -84.1], [18.5, -72.3], [-0.9, -80.7], [61.2, -149.9], [38.9, -77.0], [39.1, -76.8], [38.9, -77.04], [-10.4, -161.0], [49.0, 31.0], [-1.7, 29.2]];
const mapSvg = `<svg viewBox="0 0 ${map.W} ${map.H}" width="${map.W}" height="${map.H}" xmlns="http://www.w3.org/2000/svg">
<rect width="${map.W}" height="${map.H}" fill="#dce9f1"/>
${[-30, 0, 30, 60].map(l => `<line x1="0" x2="${map.W}" y1="${MY(l)}" y2="${MY(l)}" stroke="#c4d6e2" stroke-width=".6"/>`).join('')}
<path d="${map.d}" fill="#efe6d2" stroke="#b9ab8c" stroke-width=".5"/>
${dots.map(([la, lo]) => `<circle cx="${MX(lo)}" cy="${MY(la)}" r="2" fill="#2c2f36" opacity=".75"/>`).join('')}
${pins.map(([n, la, lo, dx, dy]) => { const x = MX(lo), y = MY(la), r = (grid.concat(leads).find(s => s.n === n)).r; return `${dx || dy ? `<line x1="${x}" y1="${y}" x2="${x + dx}" y2="${y + dy}" stroke="${C[r]}" stroke-width="1"/><circle cx="${x}" cy="${y}" r="1.8" fill="${C[r]}"/>` : ''}<circle cx="${x + dx}" cy="${y + dy}" r="7" fill="${C[r]}" stroke="#fff" stroke-width="1.2"/><text x="${x + dx}" y="${y + dy + 3.3}" text-anchor="middle" font-family="Segoe UI" font-weight="700" font-size="${n > 9 ? 8 : 9}" fill="#fff">${n}</text>`; }).join('')}
</svg>`;

// ---------- page ----------
const num = (n, r) => `<span class="num" style="background:${C[r]}">${n}</span>`;
const half = Math.ceil(more.length / 2);
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1024px;height:1024px;background:#f8f4ea;color:#16181c;font-family:'Segoe UI',sans-serif;overflow:hidden}
.page{position:absolute;inset:0;padding:12px 16px}
.top{display:flex;justify-content:space-between;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#a3291f}
.top .r{color:#333}
.mast{font-family:Georgia,serif;font-weight:700;font-size:68px;line-height:1;letter-spacing:-1.5px;text-align:center;margin-top:2px;white-space:nowrap}
.rule{border-top:3px double #16181c;border-bottom:1px solid #16181c;height:5px;margin:5px 0 8px}
.leads{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.art{border-radius:3px;overflow:hidden;border:1px solid #0002;background:#fff}
.lead .art{height:118px}
.tag{font-size:9.5px;font-weight:800;letter-spacing:1.1px;text-transform:uppercase;margin:6px 0 2px;display:flex;align-items:center;gap:5px}
.num{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;border-radius:8px;color:#fff;font-size:9.5px;font-weight:800;padding:0 3px;letter-spacing:0}
.lead h2{font-family:Georgia,serif;font-size:19.5px;line-height:1.12;font-weight:700;letter-spacing:-.2px}
.lead p{font-size:11.6px;line-height:1.3;color:#33363b;margin-top:3px}
.sep{border-top:1.5px solid #16181c;margin:8px 0 7px}
.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:9px 10px}
.card .art{height:72px}
.card .tag{font-size:8.2px;margin:4px 0 1px;gap:4px}
.card .num{min-width:14px;height:14px;font-size:8.5px}
.card h3{font-family:Georgia,serif;font-size:13.2px;line-height:1.13;font-weight:700}
.card p{font-size:9.8px;line-height:1.25;color:#3c3f45;margin-top:2px}
.bottom{display:grid;grid-template-columns:342px 1fr;gap:14px}
.hd{font-size:10.5px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;color:#a3291f;border-bottom:1px solid #16181c;padding-bottom:2px;margin-bottom:5px}
.map{border:1px solid #0003;width:342px;height:238px;padding:0;overflow:hidden}
.legend{display:flex;flex-wrap:wrap;gap:3px 9px;font-size:9.4px;margin-top:4px;color:#333}
.legend i{display:inline-block;width:8px;height:8px;border-radius:4px;margin-right:3px;vertical-align:-0.5px}
.list{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}
.list .col>div{font-size:10.6px;line-height:1.2;padding:2.5px 0;border-bottom:1px dotted #b8b1a2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.list b{font-weight:800}
.list .num{min-width:15px;height:13px;font-size:8px;border-radius:3px;margin-right:4px;vertical-align:0.5px}
.foot{position:absolute;left:16px;right:16px;bottom:8px;display:flex;justify-content:space-between;font-size:9.4px;color:#444;border-top:1px solid #16181c;padding-top:4px}
</style></head><body><div class="page">
<div class="top"><span>The world’s news in one picture · one day only</span><span class="r">${total} stories · 6 continents · all from Tuesday</span></div>
<div class="mast">Tuesday 17 November 2026</div>
<div class="rule"></div>
<div class="leads">${leads.map(s => `<div class="lead"><div class="art">${s.art}</div><div class="tag" style="color:${C[s.r]}">${num(s.n, s.r)}${REGION[s.r]} · ${s.field}</div><h2>${s.h}</h2><p>${s.d}</p></div>`).join('')}</div>
<div class="sep"></div>
<div class="grid">${grid.map(s => `<div class="card"><div class="art">${s.art}</div><div class="tag" style="color:${C[s.r]}">${num(s.n, s.r)}${REGION[s.r]} · ${s.f}</div><h3>${s.h}</h3><p>${s.d}</p></div>`).join('')}</div>
<div class="sep"></div>
<div class="bottom">
<div><div class="hd">Where it happened · 17 Nov 2026</div><div class="map">${mapSvg}</div>
<div class="legend">${Object.keys(C).map(k => `<span><i style="background:${C[k]}"></i>${REGION[k]}</span>`).join('')}<span>● = stories 16–${total}</span></div></div>
<div><div class="hd">Also on Tuesday 17 November</div><div class="list">${[0, 1].map(c => `<div class="col">${more.slice(c * half, c * half + half).map((m, i) => `<div>${num(16 + c * half + i, m[0])}<b>${m[1]}:</b> ${m[2]}</div>`).join('')}</div>`).join('')}</div></div>
</div>
<div class="foot"><span>Each item happened or was first reported on Tuesday 17 November 2026. Claims by one side are given as claims.</span><span>Sources: Reuters, AP, AFP, Al Jazeera, BBC, DW, Anadolu · original drawings</span></div>
</div></body></html>`;
fs.writeFileSync(path.join(__dirname, 'page.html'), html);
console.log('stories', total);
