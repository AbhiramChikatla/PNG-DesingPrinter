import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import blackTshirtImg from "@/assets/ChatGPT Image May 16, 2026, 11_43_55 PM.png";
import navyTshirtImg from "@/assets/ChatGPT Image May 16, 2026, 11_46_41 PM.png";
import heatherTshirtImg from "@/assets/ChatGPT Image May 16, 2026, 11_48_26 PM.png";
import sandTshirtImg from "@/assets/ChatGPT Image May 16, 2026, 11_50_13 PM.png";
import burgundyTshirtImg from "@/assets/ChatGPT Image May 16, 2026, 11_51_00 PM.png";
import pinkTshirtImg from "@/assets/ChatGPT Image May 16, 2026, 11_51_53 PM.png";
import whiteTshirtImg from "@/assets/white-tshirt.webp";


const DEFAULT_CODE = `import ibtisam as mom
import boaz as dad

class Sophia(mom.genes, dad.genes):
    """
    Welcome home
    """
    def init(self):
        print('hello world!')

    def live(self):
        while True:
            self.go_to_sleep()
            yield Bardak()
            self.be_awesome()

    def be_awesome(self):
        # Nothing to do.. already awesome
        pass`;

type ThemeKey =
  | "classic"
  | "mono"
  | "darkink"
  | "vsdark"
  | "vslight"
  | "monokai"
  | "dracula"
  | "solarizedDark"
  | "solarizedLight"
  | "githubDark"
  | "githubLight"
  | "nightOwl"
  | "oneDark"
  | "tokyoNight"
  | "nord"
  | "gruvbox"
  | "custom";

type ThemeDef = { keyword: string; string: string; comment: string; yieldKw: string; def: string; label: string; bg?: string };

const TSHIRT_COLORS: { key: string; label: string; hex: string }[] = [
  { key: "white",   label: "White",        hex: "#FFFFFF" },
  { key: "black",   label: "Black",        hex: "#111111" },
  { key: "navy",    label: "Navy",         hex: "#1B2A4A" },
  { key: "heather", label: "Heather Gray", hex: "#9CA3AF" },
  { key: "sand",    label: "Sand",         hex: "#D8C9A8" },
  { key: "olive",   label: "Olive",        hex: "#5B6A3A" },
  { key: "burgundy",label: "Burgundy",     hex: "#6B1F2E" },
  { key: "pink",    label: "Dusty Pink",   hex: "#E8B4BC" },
];

const TSHIRT_IMAGES: Record<string, string> = {
  white: whiteTshirtImg,
  black: blackTshirtImg,
  navy: navyTshirtImg,
  heather: heatherTshirtImg,
  sand: sandTshirtImg,
  olive: sandTshirtImg,
  burgundy: burgundyTshirtImg,
  pink: pinkTshirtImg,
};

const EXPORT_SIZES: { key: string; label: string; scale: number }[] = [
  { key: "1x", label: "Standard (1×)", scale: 6 },
  { key: "2x", label: "High (2×)",     scale: 12 },
  { key: "4x", label: "Ultra (4×)",    scale: 24 },
];

type Placement = { horizontal: number; vertical: number };

const SHIRT_COLOR_PLACEMENTS: Record<string, Placement> = {
  white: { horizontal: 50, vertical: 50 },
  black: { horizontal: 50, vertical: 50 },
  navy: { horizontal: 50, vertical: 50 },
  heather: { horizontal: 50, vertical: 50 },
  sand: { horizontal: 50, vertical: 50 },
  olive: { horizontal: 50, vertical: 50 },
  burgundy: { horizontal: 50, vertical: 50 },
  pink: { horizontal: 50, vertical: 50 },
};

const EXPORT_SIZE_PLACEMENT_OFFSETS: Record<string, Placement> = {
  "1x": { horizontal: 0, vertical: 0 },
  "2x": { horizontal: 0, vertical: 0 },
  "4x": { horizontal: 0, vertical: 0 },
};

function getRecommendedPlacement(tshirtColorKey: string, exportSizeKey: string): Placement {
  const base = SHIRT_COLOR_PLACEMENTS[tshirtColorKey] ?? SHIRT_COLOR_PLACEMENTS.white;
  const offset = EXPORT_SIZE_PLACEMENT_OFFSETS[exportSizeKey] ?? EXPORT_SIZE_PLACEMENT_OFFSETS["2x"];

  return {
    horizontal: base.horizontal + offset.horizontal,
    vertical: base.vertical + offset.vertical,
  };
}

const THEMES: Record<ThemeKey, ThemeDef> = {
  classic:        { keyword: "#8B0000", string: "#2E8B57", comment: "#2E8B57", yieldKw: "#E05252", def: "#2C2C2C", label: "Classic Python",     bg: "#FFFFFF" },
  mono:           { keyword: "#1A1A1A", string: "#1A1A1A", comment: "#1A1A1A", yieldKw: "#1A1A1A", def: "#1A1A1A", label: "Monochrome",         bg: "#FFFFFF" },
  darkink:        { keyword: "#1B2A4A", string: "#0F7173", comment: "#0F7173", yieldKw: "#1B2A4A", def: "#3D3D3D", label: "Dark Ink",           bg: "#FFFFFF" },
  vsdark:         { keyword: "#569CD6", string: "#CE9178", comment: "#6A9955", yieldKw: "#C586C0", def: "#D4D4D4", label: "VS Code Dark+",      bg: "#1E1E1E" },
  vslight:        { keyword: "#0000FF", string: "#A31515", comment: "#008000", yieldKw: "#AF00DB", def: "#000000", label: "VS Code Light+",     bg: "#FFFFFF" },
  monokai:        { keyword: "#F92672", string: "#E6DB74", comment: "#75715E", yieldKw: "#AE81FF", def: "#F8F8F2", label: "Monokai",            bg: "#272822" },
  dracula:        { keyword: "#FF79C6", string: "#F1FA8C", comment: "#6272A4", yieldKw: "#BD93F9", def: "#F8F8F2", label: "Dracula",            bg: "#282A36" },
  solarizedDark:  { keyword: "#859900", string: "#2AA198", comment: "#586E75", yieldKw: "#D33682", def: "#93A1A1", label: "Solarized Dark",     bg: "#002B36" },
  solarizedLight: { keyword: "#859900", string: "#2AA198", comment: "#93A1A1", yieldKw: "#D33682", def: "#586E75", label: "Solarized Light",    bg: "#FDF6E3" },
  githubDark:     { keyword: "#FF7B72", string: "#A5D6FF", comment: "#8B949E", yieldKw: "#D2A8FF", def: "#C9D1D9", label: "GitHub Dark",        bg: "#0D1117" },
  githubLight:    { keyword: "#CF222E", string: "#0A3069", comment: "#6E7781", yieldKw: "#8250DF", def: "#24292F", label: "GitHub Light",       bg: "#FFFFFF" },
  nightOwl:       { keyword: "#C792EA", string: "#ECC48D", comment: "#637777", yieldKw: "#82AAFF", def: "#D6DEEB", label: "Night Owl",          bg: "#011627" },
  oneDark:        { keyword: "#C678DD", string: "#98C379", comment: "#5C6370", yieldKw: "#61AFEF", def: "#ABB2BF", label: "One Dark",           bg: "#282C34" },
  tokyoNight:     { keyword: "#BB9AF7", string: "#9ECE6A", comment: "#565F89", yieldKw: "#7AA2F7", def: "#C0CAF5", label: "Tokyo Night",        bg: "#1A1B26" },
  nord:           { keyword: "#81A1C1", string: "#A3BE8C", comment: "#616E88", yieldKw: "#B48EAD", def: "#D8DEE9", label: "Nord",               bg: "#2E3440" },
  gruvbox:        { keyword: "#FB4934", string: "#B8BB26", comment: "#928374", yieldKw: "#D3869B", def: "#EBDBB2", label: "Gruvbox Dark",       bg: "#282828" },
  custom:         { keyword: "#8B0000", string: "#2E8B57", comment: "#2E8B57", yieldKw: "#E05252", def: "#2C2C2C", label: "Custom",              bg: "#FFFFFF" },
};

const KEYWORDS = new Set(["import", "as", "class", "def", "while", "True", "False", "None", "pass", "return", "self", "print"]);

function tokenizeLine(line: string, theme: typeof THEMES[ThemeKey]) {
  const commentIdx = line.indexOf("#");
  let codePart = line;
  let commentPart = "";
  if (commentIdx >= 0) {
    codePart = line.slice(0, commentIdx);
    commentPart = line.slice(commentIdx);
  }

  const parts: Array<{ text: string; color?: string; italic?: boolean; weight?: number }> = [];
  const stringRegex = /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|"""[\s\S]*?""")/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = stringRegex.exec(codePart)) !== null) {
    if (m.index > last) parts.push(...tokenizeWords(codePart.slice(last, m.index), theme));
    parts.push({ text: m[0], color: theme.string });
    last = m.index + m[0].length;
  }
  if (last < codePart.length) parts.push(...tokenizeWords(codePart.slice(last), theme));
  if (commentPart) parts.push({ text: commentPart, color: theme.comment, italic: true });
  return parts;
}

function tokenizeWords(s: string, theme: typeof THEMES[ThemeKey]) {
  const out: Array<{ text: string; color?: string; weight?: number }> = [];
  const re = /([A-Za-z_][A-Za-z0-9_]*)|([^A-Za-z_]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    const word = m[1];
    if (word) {
      if (word === "yield") out.push({ text: word, color: theme.yieldKw, weight: 600 });
      else if (KEYWORDS.has(word)) out.push({ text: word, color: theme.keyword, weight: 600 });
      else out.push({ text: word, color: theme.def });
    } else {
      out.push({ text: m[2], color: theme.def });
    }
  }
  return out;
}

function highlightLines(code: string, theme: typeof THEMES[ThemeKey]) {
  const lines = code.split("\n");
  const tripleRanges: Array<[number, number]> = [];
  let openLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const occurrences = (lines[i].match(/"""/g) || []).length;
    if (openLine === -1 && occurrences >= 1) {
      if (occurrences >= 2) tripleRanges.push([i, i]);
      else openLine = i;
    } else if (openLine !== -1 && occurrences >= 1) {
      tripleRanges.push([openLine, i]);
      openLine = -1;
    }
  }
  const inTriple = (i: number) => tripleRanges.some(([a, b]) => i >= a && i <= b);

  return lines.map((line, i) => {
    if (inTriple(i)) return [{ text: line || " ", color: theme.string }];
    return tokenizeLine(line || " ", theme);
  });
}

type CustomColors = { keyword: string; string: string; comment: string; yieldKw: string; def: string; bg: string };
const DEFAULT_CUSTOM: CustomColors = { keyword: "#8B0000", string: "#2E8B57", comment: "#2E8B57", yieldKw: "#E05252", def: "#2C2C2C", bg: "#FFFFFF" };

export default function PatternPress() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [fontSize, setFontSize] = useState(13);
  const [themeKey, setThemeKey] = useState<ThemeKey>("classic");
  const [customColors, setCustomColors] = useState<CustomColors>(DEFAULT_CUSTOM);
  const [transparentBg, setTransparentBg] = useState(false);
  const [mockupMode, setMockupMode] = useState(false);
  const [tshirtColorKey, setTshirtColorKey] = useState<string>("white");
  const [exportSizeKey, setExportSizeKey] = useState<string>("2x");
  const [horizontalPos, setHorizontalPos] = useState<number>(50);
  const [verticalPos, setVerticalPos] = useState<number>(42);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const theme: ThemeDef = themeKey === "custom"
    ? { ...customColors, label: "Custom" }
    : THEMES[themeKey];
  const selectedTshirtImg = TSHIRT_IMAGES[tshirtColorKey] ?? whiteTshirtImg;
  const exportScale = EXPORT_SIZES.find(s => s.key === exportSizeKey)?.scale || 12;
  const recommendedPlacement = useMemo(
    () => getRecommendedPlacement(tshirtColorKey, exportSizeKey),
    [tshirtColorKey, exportSizeKey],
  );

  const highlighted = useMemo(() => highlightLines(code, theme), [code, theme]);
  const editorHighlighted = useMemo(() => highlightLines(code, THEMES.classic), [code]);

  useEffect(() => { setFlashKey(k => k + 1); }, [code]);

  const handleTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.slice(0, start) + "    " + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 4; });
    }
  };

  const reset = () => {
    setCode(DEFAULT_CODE);
    setFontSize(13);
    setThemeKey("classic");
    setCustomColors(DEFAULT_CUSTOM);
    setTransparentBg(false);
    setMockupMode(false);
    setTshirtColorKey("white");
    setExportSizeKey("2x");
    setHorizontalPos(50);
    setVerticalPos(42);
  };

  const autoCenter = () => {
    setHorizontalPos(recommendedPlacement.horizontal);
    setVerticalPos(recommendedPlacement.vertical);
  };

  const renderCodeToCanvas = useCallback((scale: number) => {
    const lines = code.split("\n");
    const renderFont = fontSize * scale;
    const lineHeight = renderFont * 1.5;
    const padding = renderFont * 2;

    const measureCanvas = document.createElement("canvas");
    const mctx = measureCanvas.getContext("2d")!;
    mctx.font = `${renderFont}px "Courier New", monospace`;
    let maxW = 0;
    for (const l of lines) {
      const w = mctx.measureText(l || " ").width;
      if (w > maxW) maxW = w;
    }

    const W = Math.ceil(maxW + padding * 2);
    const H = Math.ceil(lines.length * lineHeight + padding * 2);
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.textBaseline = "top";
    let y = padding;
    for (const lineParts of highlighted) {
      let x = padding;
      for (const part of lineParts) {
        ctx.fillStyle = part.color || theme.def;
        const weight = part.weight ? "600" : "400";
        const italic = part.italic ? "italic " : "";
        ctx.font = `${italic}${weight} ${renderFont}px "Courier New", monospace`;
        ctx.fillText(part.text, x, y);
        x += ctx.measureText(part.text).width;
      }
      y += lineHeight;
    }
    return canvas;
  }, [code, fontSize, highlighted, theme]);

  const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  const downloadPNG = useCallback(async () => {
    setDownloading(true);
    try {
      if (mockupMode) {
        const tshirt = await loadImage(selectedTshirtImg);
        const upscale = exportScale / 6; // 1x→1, 2x→2, 4x→4
        const W = Math.round(tshirt.naturalWidth * upscale);
        const H = Math.round(tshirt.naturalHeight * upscale);
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(tshirt, 0, 0, W, H);

        const codeCanvas = renderCodeToCanvas(exportScale);
        // Fit code into chest area (~40% width, max ~38% height)
        const maxW = W * 0.40;
        const maxH = H * 0.36;
        const ratio = Math.min(maxW / codeCanvas.width, maxH / codeCanvas.height);
        const drawW = codeCanvas.width * ratio;
        const drawH = codeCanvas.height * ratio;
        const cx = W * (horizontalPos / 100) - drawW / 2;
        const cy = H * (verticalPos / 100) - drawH / 2;
        ctx.drawImage(codeCanvas, cx, cy, drawW, drawH);

        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `pattern-press-tshirt-${exportSizeKey}.png`;
        a.click();
      } else {
        const codeCanvas = renderCodeToCanvas(exportScale);
        if (!transparentBg) {
          const out = document.createElement("canvas");
          out.width = codeCanvas.width;
          out.height = codeCanvas.height;
          const ctx = out.getContext("2d")!;
          ctx.fillStyle = theme.bg || "#FFFFFF";
          ctx.fillRect(0, 0, out.width, out.height);
          ctx.drawImage(codeCanvas, 0, 0);
          const url = out.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = url;
          a.download = `pattern-press-code-${exportSizeKey}.png`;
          a.click();
        } else {
          const url = codeCanvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = url;
          a.download = `pattern-press-code-${exportSizeKey}.png`;
          a.click();
        }
      }
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } finally {
      setDownloading(false);
    }
  }, [mockupMode, transparentBg, renderCodeToCanvas, theme, selectedTshirtImg, exportScale, exportSizeKey, horizontalPos, verticalPos]);

  const lineCount = code.split("\n").length;

  // Transparency checkerboard
  const checker = "repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%) 50% / 20px 20px";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="relative">
        <div className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-border bg-panel/50 backdrop-blur">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight">
              Pattern <span className="text-amber-accent">Press</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 tracking-wide">Wear your code.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-accent/15 text-amber-accent border border-amber-accent/30">
              <span className="size-1.5 rounded-full bg-amber-accent" />
              Premium
            </span>
          </div>
        </div>
        <div className="h-px animated-gradient-border" />
      </header>

      <main className="flex-1 flex flex-col md:flex-row">
        <a href="#preview" className="md:hidden sticky top-0 z-10 mx-4 mt-3 text-center text-xs py-2 rounded-lg bg-panel border border-border text-muted-foreground">
          Preview ↓
        </a>

        {/* Preview */}
        <section
          id="preview"
          className="md:w-1/2 md:h-[calc(100vh-89px)] flex items-center justify-center p-6 md:p-10 bg-preview relative overflow-hidden order-2 md:order-1"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-amber-accent/10 blur-3xl radial-glow" />
          </div>

          {mockupMode ? (
            <div className="relative w-full max-w-md aspect-[4/5] flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <img
                    src={selectedTshirtImg}
                    alt="T-shirt mockup"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
              </div>
              <div
                key={flashKey}
                className="absolute shimmer-flash pointer-events-none flex items-center justify-center"
                style={{
                  left: `${horizontalPos}%`,
                  top: `${verticalPos}%`,
                  transform: "translate(-50%, -50%)",
                  width: "40%",
                  maxHeight: "36%",
                  fontFamily: "'Courier New', monospace",
                  fontSize: `${Math.max(4, fontSize * 0.42)}px`,
                  lineHeight: 1.4,
                  color: theme.def,
                  whiteSpace: "pre",
                  overflow: "hidden",
                  textAlign: "left",
                }}
              >
                <div>
                  {highlighted.map((parts, i) => (
                    <div key={i}>
                      {parts.map((p, j) => (
                        <span key={j} style={{ color: p.color, fontWeight: p.weight ?? 400, fontStyle: p.italic ? "italic" : "normal" }}>
                          {p.text}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="relative w-full max-w-md aspect-[5/7] rounded-2xl flex items-center justify-center p-8 overflow-hidden"
              style={{
                background: transparentBg ? checker : (theme.bg || "#FFFFFF"),
                boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
              }}
            >
              <div
                key={flashKey}
                className="shimmer-flash pointer-events-none"
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.4,
                  color: theme.def,
                  whiteSpace: "pre",
                }}
              >
                {highlighted.map((parts, i) => (
                  <div key={i}>
                    {parts.map((p, j) => (
                      <span key={j} style={{ color: p.color, fontWeight: p.weight ?? 400, fontStyle: p.italic ? "italic" : "normal" }}>
                        {p.text}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Editor + Controls */}
        <section className="md:w-1/2 md:h-[calc(100vh-89px)] flex flex-col bg-panel border-l border-border order-1 md:order-2 overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Code Editor</h2>
              <span className="text-xs text-muted-foreground font-mono">{lineCount} lines</span>
            </div>
            <div className="rounded-xl border border-border bg-editor overflow-hidden">
              <div className="flex">
                <div
                  aria-hidden
                  className="select-none px-3 py-4 text-right text-muted-foreground/60 font-mono bg-black/20 border-r border-border"
                  style={{ fontSize: 13, lineHeight: 1.5, minWidth: 44 }}
                >
                  {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <div className="relative flex-1">
                  <pre
                    aria-hidden
                    className="absolute inset-0 m-0 p-4 font-mono pointer-events-none whitespace-pre overflow-hidden"
                    style={{ fontSize: 13, lineHeight: 1.5, color: "#888" }}
                  >
                    {editorHighlighted.map((parts, i) => (
                      <div key={i}>
                        {parts.map((p, j) => (
                          <span key={j} style={{ color: p.color === "#2C2C2C" ? "#D8D8D8" : p.color, fontWeight: p.weight ?? 400, fontStyle: p.italic ? "italic" : "normal" }}>
                            {p.text}
                          </span>
                        ))}
                        {parts.length === 0 && " "}
                      </div>
                    ))}
                  </pre>
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleTab}
                    spellCheck={false}
                    placeholder="Write your code story..."
                    className="relative w-full h-[360px] p-4 font-mono bg-transparent outline-none resize-none"
                    style={{ fontSize: 13, lineHeight: 1.5, color: "transparent", caretColor: "#F5A623" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 md:px-6 pb-6 grid gap-4">
            {/* Font size */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Font Size</label>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-accent/15 text-amber-accent border border-amber-accent/30">
                  {fontSize}px
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "#F5A623" }}
              />
            </div>

            {/* Theme */}
            <div className="rounded-xl border border-border bg-card p-4">
              <label className="text-sm font-medium block mb-2">Code Theme</label>
              <select
                value={themeKey}
                onChange={(e) => setThemeKey(e.target.value as ThemeKey)}
                className="w-full px-3 py-2 rounded-lg bg-editor border border-border text-sm outline-none focus:border-amber-accent transition-all"
              >
                {Object.entries(THEMES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Custom Theme Builder */}
            {themeKey === "custom" && (
              <div className="rounded-xl border border-amber-accent/40 bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Custom Theme Builder</label>
                  <button
                    onClick={() => setCustomColors(DEFAULT_CUSTOM)}
                    className="text-xs text-muted-foreground hover:text-amber-accent transition-colors"
                  >
                    Reset colors
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    ["keyword", "Keywords"],
                    ["string", "Strings"],
                    ["comment", "Comments"],
                    ["yieldKw", "Yield / Special"],
                    ["def", "Default Text"],
                    ["bg", "Background"],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className="size-5 rounded-full border border-border"
                          style={{ background: customColors[key] }}
                        />
                        <input
                          type="color"
                          value={customColors[key]}
                          onChange={(e) => setCustomColors({ ...customColors, [key]: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* T-Shirt Color (only when mockup mode) */}
            {mockupMode && (
              <div className="rounded-xl border border-border bg-card p-4">
                <label className="text-sm font-medium block mb-3">T-Shirt Color</label>
                <div className="flex flex-wrap gap-2">
                  {TSHIRT_COLORS.map(c => (
                    <button
                      key={c.key}
                      onClick={() => setTshirtColorKey(c.key)}
                      title={c.label}
                      className={`size-9 rounded-full border-2 transition-all ${tshirtColorKey === c.key ? "border-amber-accent scale-110 shadow-lg" : "border-border hover:border-muted-foreground"}`}
                      style={{ background: c.hex }}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {TSHIRT_COLORS.find(c => c.key === tshirtColorKey)?.label}
                </div>
              </div>
            )}

            {/* Auto-center (only when mockup mode) */}
            {mockupMode && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="text-sm font-medium block">Auto-Center</label>
                    <span className="text-xs text-muted-foreground font-mono">
                      {recommendedPlacement.horizontal}% / {recommendedPlacement.vertical}%
                    </span>
                  </div>
                  <button
                    onClick={autoCenter}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-amber-accent/40 bg-amber-accent/15 text-amber-accent hover:bg-amber-accent/25"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* Horizontal Position (only when mockup mode) */}
            {mockupMode && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Horizontal Position</label>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-accent/15 text-amber-accent border border-amber-accent/30">
                    {horizontalPos}%
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={80}
                  value={horizontalPos}
                  onChange={(e) => setHorizontalPos(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: "#F5A623" }}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Left</span><span>Center</span><span>Right</span>
                </div>
              </div>
            )}

            {/* Vertical Position (only when mockup mode) */}
            {mockupMode && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Vertical Position</label>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-accent/15 text-amber-accent border border-amber-accent/30">
                    {verticalPos}%
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={80}
                  value={verticalPos}
                  onChange={(e) => setVerticalPos(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: "#F5A623" }}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Top</span><span>Center</span><span>Bottom</span>
                </div>
              </div>
            )}

            {/* Export Size */}
            <div className="rounded-xl border border-border bg-card p-4">
              <label className="text-sm font-medium block mb-2">Export Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                {EXPORT_SIZES.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setExportSizeKey(s.key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${exportSizeKey === s.key ? "border-amber-accent bg-amber-accent/15 text-amber-accent" : "border-border bg-editor hover:border-muted-foreground"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="rounded-xl border border-border bg-card p-4 grid gap-3">
              <ToggleRow
                label="Mockup Preview"
                hint="See your code printed on a T-shirt"
                checked={mockupMode}
                onChange={setMockupMode}
              />
              <div className="h-px bg-border" />
              <ToggleRow
                label="Transparent Background"
                hint="Export PNG with alpha channel (for dark shirts)"
                checked={transparentBg}
                onChange={setTransparentBg}
                disabled={mockupMode}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={reset}
                className="px-4 py-3 rounded-xl border border-border bg-transparent hover:bg-secondary text-sm font-medium transition-all hover:border-destructive/40 hover:text-destructive"
              >
                Reset to Default
              </button>
              <button
                onClick={downloadPNG}
                disabled={downloading}
                className="px-4 py-3 rounded-xl text-sm font-semibold transition-all relative overflow-hidden disabled:opacity-70"
                style={{
                  background: "linear-gradient(135deg, #F5A623, #E89110)",
                  color: "#1a1407",
                  boxShadow: "0 0 24px rgba(245,166,35,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
                }}
              >
                {downloading ? "Generating..." : downloaded ? "✓ Downloaded!" : mockupMode ? "⬇ Download T-Shirt PNG" : "⬇ Download Code PNG"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ToggleRow({
  label, hint, checked, onChange, disabled,
}: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex items-center justify-between gap-4 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-colors"
        style={{ background: checked ? "#F5A623" : "rgba(255,255,255,0.15)" }}
      >
        <span
          className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </label>
  );
}
