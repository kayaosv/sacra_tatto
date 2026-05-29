import { useState, useEffect } from 'react';
import { LSCCtx } from './context.js';
import { LSC } from './content.js';
import { LSCMotion } from './motion.js';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakColor } from './tweaks-panel.jsx';
import { Nav, Hero, Estilos, Artistas, Proceso } from './sections-a.jsx';
import { Galeria, Testimonios, Reservas, Localizacion, Footer, WhatsAppFloat } from './sections-b.jsx';

const TWEAK_DEFAULTS = {
  "hero": "editorial",
  "reservas": "pasos",
  "bg": "warm",
  "accentOn": true,
  "blood": "#8b0000"
};

export default function App() {
  const { content, data } = LSC;
  const [lang, setLangRaw] = useState(() => localStorage.getItem("lsc-lang") || "es");
  const setLang = (l) => { setLangRaw(l); try { localStorage.setItem("lsc-lang", l); } catch (e) {} };
  const c = content[lang];

  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--lsc-bg", tw.bg === "pure" ? "var(--lsc-bg-pure)" : "var(--lsc-bg-warm)");
    root.style.setProperty("--lsc-accent", tw.blood || "#8b0000");
    root.setAttribute("data-accent", tw.accentOn ? "on" : "off");
  }, [tw.bg, tw.blood, tw.accentOn]);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  useEffect(() => {
    const markReady = () => setReady(true);
    try {
      LSCMotion.init(markReady);
    } catch (e) {
      markReady();
    }
    const t = setTimeout(markReady, 3500);
    return () => clearTimeout(t);
  }, []);

  const ctx = { lang, setLang, c, data, tw, ready };

  return (
    <LSCCtx.Provider value={ctx}>
      <div className="lsc-vignette" aria-hidden="true"></div>
      <Nav />
      <main>
        <Hero />
        <Proceso />
        <Estilos />
        <Artistas />
        <Galeria />
        <Testimonios />
        <Reservas />
        <Localizacion />
      </main>
      <Footer />
      <WhatsAppFloat />
      <div className="lsc-grain" aria-hidden="true"></div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Composición" />
        <TweakRadio label="Hero" value={tw.hero}
          options={[{ value: "editorial", label: "Editorial" }, { value: "sello", label: "Sello" }, { value: "retrato", label: "Retrato" }]}
          onChange={(v) => setTweak("hero", v)} />
        <TweakRadio label="Reservas" value={tw.reservas}
          options={[{ value: "pasos", label: "Pasos" }, { value: "ficha", label: "Ficha" }]}
          onChange={(v) => setTweak("reservas", v)} />

        <TweakSection label="Atmósfera" />
        <TweakRadio label="Fondo" value={tw.bg}
          options={[{ value: "warm", label: "Cálido" }, { value: "pure", label: "Negro" }]}
          onChange={(v) => setTweak("bg", v)} />
        <TweakToggle label="Acento sangre" value={tw.accentOn} onChange={(v) => setTweak("accentOn", v)} />
        <TweakColor label="Intensidad" value={tw.blood}
          options={["#6e0000", "#8b0000", "#a81414"]}
          onChange={(v) => setTweak("blood", v)} />
      </TweaksPanel>
    </LSCCtx.Provider>
  );
}
