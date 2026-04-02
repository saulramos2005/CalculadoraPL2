export function useGraficaUtils(maxCoord: number) {
  const niceTicks = (min: number, max: number, approxCount = 6) => {
    if (!isFinite(min) || !isFinite(max)) return [];
    const span = max - min;
    const rawStep = span / approxCount;
    const pow10 = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const candidates = [1, 2, 2.5, 5, 10];
    const step = candidates.map(c => c * pow10).reduce((a, b) => 
      Math.abs(b - rawStep) < Math.abs(a - rawStep) ? b : a);
    const first = Math.ceil(min / step) * step;
    const ticks = [];
    for (let v = first; v <= max + 1e-9; v += step) ticks.push(Number(v.toFixed(12)));
    return ticks;
  };

 const getExtendedLineSegment = (pts: { x: number; y: number }[]) => {
    if (!pts || pts.length < 2) return null;
    const p1 = pts[0];
    const p2 = pts[1];

    // Define data bounds (include negatives and a margin)
    const marginFactor = 1.2;
    const dataXMin = -maxCoord * marginFactor;
    const dataXMax = maxCoord * marginFactor;
    const dataYMin = -maxCoord / marginFactor;
    const dataYMax = maxCoord * marginFactor;

    const intersections: { x: number; y: number }[] = [];

    const addIfInBounds = (pt: { x: number; y: number } | null) => {
      if (!pt) return;
      const { x, y } = pt;
      if (x >= dataXMin - 1e-8 && x <= dataXMax + 1e-8 && y >= dataYMin - 1e-8 && y <= dataYMax + 1e-8) {
        // avoid duplicates (approx)
        if (!intersections.some(q => Math.hypot(q.x - x, q.y - y) < 1e-6)) intersections.push({ x, y });
      }
    };

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    // Vertical line
    if (Math.abs(dx) < 1e-9) {
      addIfInBounds({ x: p1.x, y: dataYMin });
      addIfInBounds({ x: p1.x, y: dataYMax });
    } else {
      const m = dy / dx;
      const b = p1.y - m * p1.x;

      // intersect with left/right bounds (x = dataXMin / dataXMax)
      addIfInBounds({ x: dataXMin, y: m * dataXMin + b });
      addIfInBounds({ x: dataXMax, y: m * dataXMax + b });

      // intersect with top/bottom bounds (y = dataYMin / dataYMax)
      addIfInBounds({ x: (dataYMin - b) / m, y: dataYMin });
      addIfInBounds({ x: (dataYMax - b) / m, y: dataYMax });
    }

    // If we have at least two intersection points, pick the two farthest apart
    if (intersections.length >= 2) {
      let a = intersections[0];
      let bpt = intersections[1];
      if (intersections.length > 2) {
        let maxd = -1;
        for (let i = 0; i < intersections.length; i++) {
          for (let j = i + 1; j < intersections.length; j++) {
            const d = Math.hypot(intersections[i].x - intersections[j].x, intersections[i].y - intersections[j].y);
            if (d > maxd) {
              maxd = d;
              a = intersections[i];
              bpt = intersections[j];
            }
          }
        }
      }
      return [a, bpt];
    }

    // Fallback: return original two points (works if they are already far enough)
    return [p1, p2];
  };

  return { niceTicks, getExtendedLineSegment };
}