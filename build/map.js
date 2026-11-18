// Decode Natural Earth 110m land (TopoJSON) into one SVG path, equirectangular, for a W x H box.
const fs = require('fs');
const topo = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const W = +process.argv[3], H = +process.argv[4], LAT0 = 78, LAT1 = -56, LON0 = -170, LON1 = 190;
const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
const P = ([lon, lat]) => { if (lon < LON0) lon += 360; return [((lon - LON0) / (LON1 - LON0)) * W, ((LAT0 - lat) / (LAT0 - LAT1)) * H]; };
const ring = r => { let pts = []; r.forEach(i => { const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; pts = pts.concat(pts.length ? a.slice(1) : a); }); return pts; };
let d = '';
const geoms = topo.objects.land.geometries || [topo.objects.land];
for (const g of geoms) { const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs; for (const poly of polys) for (const r of poly) {
  const pts = ring(r).map(P); let prev = null; let seg = '';
  for (const p of pts) { if (prev && Math.abs(p[0] - prev[0]) > W / 2) { seg += 'Z'; seg += 'M' + p[0].toFixed(1) + ',' + p[1].toFixed(1); } else seg += (seg ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); prev = p; }
  d += seg + 'Z'; } }
fs.writeFileSync(process.argv[5], JSON.stringify({ d, W, H, LAT0, LAT1, LON0, LON1 }));
console.log('path chars', d.length);
