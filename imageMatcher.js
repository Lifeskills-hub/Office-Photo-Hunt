/* Office Photo Hunt - stricter image matcher v9
   Drop-in replacement for imageMatcher.js
   Main tuning knobs: STRUCTURE_WEIGHT and STRICTNESS.
*/
window.ImageMatcher = (() => {
  const SIZE = 96;
  const COLOUR_WEIGHT = 0.30;
  const STRUCTURE_WEIGHT = 0.70;
  const STRICTNESS = 2.20;

  async function toBitmap(source) {
    if (typeof source === 'string') {
      const blob = await fetch(source).then(r => {
        if (!r.ok) throw new Error('Unable to load target photo');
        return r.blob();
      });
      return createImageBitmap(blob);
    }
    return createImageBitmap(source);
  }

  function pixels(image) {
    const c = document.createElement('canvas');
    c.width = c.height = SIZE;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#777';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Centre-crop instead of stretching. This makes viewpoint/composition matter more.
    const scale = Math.max(SIZE / image.width, SIZE / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    ctx.drawImage(image, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
    return ctx.getImageData(0, 0, SIZE, SIZE).data;
  }

  function grayscale(data) {
    const out = new Float32Array(SIZE * SIZE);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      out[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    return out;
  }

  // Normalised RGB histogram. Less important than structure, but still useful.
  function histogram(data) {
    const bins = new Float32Array(48);
    const count = SIZE * SIZE;
    for (let i = 0; i < data.length; i += 4) {
      bins[Math.min(15, data[i] >> 4)]++;
      bins[16 + Math.min(15, data[i + 1] >> 4)]++;
      bins[32 + Math.min(15, data[i + 2] >> 4)]++;
    }
    for (let i = 0; i < bins.length; i++) bins[i] /= count;
    return bins;
  }

  function cosine(a, b) {
    let dot = 0, aa = 0, bb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      aa += a[i] * a[i];
      bb += b[i] * b[i];
    }
    return dot / Math.sqrt(aa * bb || 1);
  }

  // Sobel-like gradient vector split into a 6x6 spatial grid.
  // Different camera angles/objects therefore reduce similarity more strongly.
  function structureVector(gray) {
    const CELLS = 6;
    const vector = new Float32Array(CELLS * CELLS * 2);
    for (let y = 1; y < SIZE - 1; y++) {
      for (let x = 1; x < SIZE - 1; x++) {
        const i = y * SIZE + x;
        const gx = gray[i + 1] - gray[i - 1];
        const gy = gray[i + SIZE] - gray[i - SIZE];
        const cx = Math.min(CELLS - 1, Math.floor(x * CELLS / SIZE));
        const cy = Math.min(CELLS - 1, Math.floor(y * CELLS / SIZE));
        const off = (cy * CELLS + cx) * 2;
        vector[off] += Math.abs(gx);
        vector[off + 1] += Math.abs(gy);
      }
    }
    return vector;
  }

  async function compare(target, attempt) {
    const [a, b] = await Promise.all([toBitmap(target), toBitmap(attempt)]);
    try {
      const pa = pixels(a), pb = pixels(b);
      const colour = Math.max(0, Math.min(1, cosine(histogram(pa), histogram(pb))));
      const structure = Math.max(0, Math.min(1, cosine(structureVector(grayscale(pa)), structureVector(grayscale(pb)))));

      const raw = COLOUR_WEIGHT * colour + STRUCTURE_WEIGHT * structure;
      const strict = Math.pow(raw, STRICTNESS);
      return Math.max(0, Math.min(100, Math.round(strict * 100)));
    } finally {
      a.close();
      b.close();
    }
  }

  return { compare };
})();
