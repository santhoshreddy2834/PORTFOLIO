/* ------------------------------------------------------------
   Hero visual: nearest-neighbour search in a 2D embedding space.
   Greyscale only. Respects prefers-reduced-motion.
   ------------------------------------------------------------ */

(function () {
  var cv = document.getElementById('knn');
  if (!cv) return;

  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var BLACK = '#000000';
  var EDGE  = 'rgba(0,0,0,0.13)';
  var EDGE_MATCH = 'rgba(0,0,0,0.55)';
  var DOT   = 'rgba(0,0,0,0.35)';
  var AXIS  = '#D6D6D6';

  var S = 800;      // canvas coordinate space
  var N = 42;       // number of points
  var K = 2;        // neighbours drawn per point

  var pts = [];
  var centres = [[250, 270], [560, 330], [400, 590]];

  for (var i = 0; i < N; i++) {
    var c = centres[i % 3];
    var r = 90 + Math.random() * 80;
    var a = Math.random() * Math.PI * 2;
    pts.push({
      x: c[0] + Math.cos(a) * r * (0.5 + Math.random() * 0.6),
      y: c[1] + Math.sin(a) * r * (0.5 + Math.random() * 0.6),
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      r: 2.4 + Math.random() * 2.2
    });
  }

  var query = { x: 400, y: 400, vx: 0.11, vy: -0.09, r: 6 };

  function neighbours(p, k) {
    var d = [];
    for (var i = 0; i < pts.length; i++) {
      var q = pts[i];
      if (q === p) continue;
      d.push({ q: q, d: (q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y) });
    }
    d.sort(function (a, b) { return a.d - b.d; });
    return d.slice(0, k);
  }

  function step(p) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 70 || p.x > S - 70) p.vx *= -1;
    if (p.y < 70 || p.y > S - 70) p.vy *= -1;
  }

  function draw() {
    ctx.clearRect(0, 0, S, S);

    // axes
    ctx.strokeStyle = AXIS;
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(52, S - 52); ctx.lineTo(S - 40, S - 52); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(52, S - 52); ctx.lineTo(52, 40); ctx.stroke();

    // k-nearest-neighbour edges
    ctx.lineWidth = 1;
    ctx.strokeStyle = EDGE;
    for (var i = 0; i < pts.length; i++) {
      var ns = neighbours(pts[i], K);
      for (var j = 0; j < ns.length; j++) {
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(ns[j].q.x, ns[j].q.y);
        ctx.stroke();
      }
    }

    // the query point's four matches
    var qn = neighbours(query, 4);
    ctx.lineWidth = 2;
    ctx.strokeStyle = EDGE_MATCH;
    for (var m = 0; m < qn.length; m++) {
      ctx.beginPath();
      ctx.moveTo(query.x, query.y);
      ctx.lineTo(qn[m].q.x, qn[m].q.y);
      ctx.stroke();
    }

    // points
    for (var p = 0; p < pts.length; p++) {
      var pt = pts[p];
      var isMatch = false;
      for (var z = 0; z < qn.length; z++) {
        if (qn[z].q === pt) { isMatch = true; break; }
      }
      ctx.fillStyle = isMatch ? BLACK : DOT;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // query marker: filled dot with a ring
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(query.x, query.y, query.r + 7, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = BLACK;
    ctx.beginPath(); ctx.arc(query.x, query.y, query.r, 0, Math.PI * 2); ctx.fill();
  }

  function loop() {
    for (var i = 0; i < pts.length; i++) step(pts[i]);
    step(query);
    draw();
    requestAnimationFrame(loop);
  }

  draw();
  if (!reduce) loop();
})();