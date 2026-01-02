import { useState, useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';

type Language = 'en' | 'ru';

const content = {
  en: {
    title: 'Degeneracy Collapse Simulator',
    explanation: [
      'This demonstrates how degenerate solutions (multiple equivalent minima) collapse when an auxiliary constraint is added.',
      'Base function f(x, y) = (x² + y² - 1)² has infinitely many minima along a ring of radius 1.',
      'Adding constraint g(x, y) = α·x² breaks symmetry and selects a unique minimum.',
      'Note: This is an illustrative demonstration, not a mathematical proof.'
    ],
    constraintStrength: 'Constraint strength (α)',
    enableConstraint: 'Enable auxiliary constraint',
    xAxis: 'x',
    yAxis: 'y'
  },
  ru: {
    title: 'Симулятор коллапса вырожденных решений',
    explanation: [
      'Это демонстрация коллапса вырожденных решений (множественных эквивалентных минимумов) при добавлении вспомогательного ограничения.',
      'Базовая функция f(x, y) = (x² + y² - 1)² имеет бесконечно много минимумов вдоль кольца радиуса 1.',
      'Добавление ограничения g(x, y) = α·x² нарушает симметрию и выбирает уникальный минимум.',
      'Примечание: Это иллюстрация, не математическое доказательство.'
    ],
    constraintStrength: 'Сила ограничения (α)',
    enableConstraint: 'Включить вспомогательное ограничение',
    xAxis: 'x',
    yAxis: 'y'
  }
};

function App() {
  const [lang, setLang] = useState<Language>('en');
  const [alpha, setAlpha] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.createImageData(width, height);

    const xMin = -2, xMax = 2;
    const yMin = -2, yMax = 2;

    let minLoss = Infinity;
    let maxLoss = -Infinity;

    const losses: number[][] = [];

    for (let py = 0; py < height; py++) {
      losses[py] = [];
      for (let px = 0; px < width; px++) {
        const x = xMin + (px / width) * (xMax - xMin);
        const y = yMin + ((height - py) / height) * (yMax - yMin);

        const f = Math.pow(x * x + y * y - 1, 2);
        const g = enabled ? alpha * x * x : 0;
        const loss = f + g;

        losses[py][px] = loss;
        minLoss = Math.min(minLoss, loss);
        maxLoss = Math.max(maxLoss, loss);
      }
    }

    const clampedMax = Math.min(maxLoss, minLoss + 0.5);

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const loss = losses[py][px];
        const normalized = Math.min((loss - minLoss) / (clampedMax - minLoss), 1);

        const idx = (py * width + px) * 4;

        const r = Math.floor(255 * normalized);
        const g = Math.floor(100 * (1 - normalized));
        const b = Math.floor(255 * (1 - normalized));

        imageData.data[idx] = r;
        imageData.data[idx + 1] = g;
        imageData.data[idx + 2] = b;
        imageData.data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText(content[lang].xAxis, width - 15, height / 2 - 5);
    ctx.fillText(content[lang].yAxis, width / 2 + 5, 15);
  }, [alpha, enabled, lang]);

  const t = content[lang];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-light text-gray-900">{t.title}</h1>
          <button
            onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            <Globe size={18} />
            <span className="text-sm font-medium">{lang.toUpperCase()}</span>
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          {t.explanation.map((para, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
              {para}
            </p>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="border border-gray-300"
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-gray-700 font-medium">{t.enableConstraint}</span>
              </label>
            </div>

            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">{t.constraintStrength}: </span>
                <span className="text-gray-900 font-mono">{alpha.toFixed(3)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.001"
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                disabled={!enabled}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          L(x, y) = (x² + y² - 1)² + α·x²
        </div>
      </div>
    </div>
  );
}

export default App;
