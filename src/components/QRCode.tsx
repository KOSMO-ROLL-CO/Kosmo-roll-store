interface QRCodeProps {
  value: string;
  size?: number;
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildMatrix(seed: number, cells: number): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: cells }, () => Array(cells).fill(false));

  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const border = r === 0 || r === 6 || c === 0 || c === 6;
        const center = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[r0 + r][c0 + c] = border || center;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, cells - 7);
  drawFinder(cells - 7, 0);

  let state = seed;
  const rand = () => {
    state = (Math.imul(state, 1103515245) + 12345) % 2147483648;
    return state / 2147483648;
  };

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const inFinder =
        (r < 7 && c < 7) ||
        (r < 7 && c >= cells - 7) ||
        (r >= cells - 7 && c < 7);
      if (!inFinder) {
        matrix[r][c] = rand() > 0.5;
      }
    }
  }

  return matrix;
}

export default function QRCode({ value, size = 176 }: QRCodeProps) {
  const cells = 25;
  const matrix = buildMatrix(hashString(value), cells);
  const cellSize = size / cells;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="bg-white rounded-xl"
      role="img"
      aria-label="QR Code de autenticação"
    >
      {matrix.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0A0A1A"
            />
          ) : null
        )
      )}
    </svg>
  );
}
