"use client";

import * as React from "react";

type ColorSpace = "hsb" | "hsl" | "rgb";
type ColorChannel = "hue" | "saturation" | "brightness" | "lightness" | "red" | "green" | "blue" | "alpha";
type ColorValue = {
  h: number;
  s: number;
  b: number;
  a: number;
  toString: (format?: "hex" | "css" | "hsl" | "hsb" | "rgb") => string;
  toFormat: (format: string) => ColorValue;
};

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hsbToRgb(h: number, s: number, b: number) {
  s /= 100;
  b /= 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  return { r: Math.round(255 * f(5)), g: Math.round(255 * f(3)), b: Math.round(255 * f(1)) };
}

function rgbToHsb(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  return { h: (h + 360) % 360, s: max === 0 ? 0 : (delta / max) * 100, b: max * 100 };
}

function hslToHsb(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const bright = l + s * Math.min(l, 1 - l);
  const sat = bright === 0 ? 0 : 2 * (1 - l / bright);
  return { h, s: sat * 100, b: bright * 100 };
}

function hsbToHsl(color: Pick<ColorValue, "h" | "s" | "b">) {
  const s = color.s / 100;
  const b = color.b / 100;
  const l = b * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (b - l) / Math.min(l, 1 - l);
  return { h: color.h, s: sl * 100, l: l * 100 };
}

function makeColor(raw: { h: number; s: number; b: number; a?: number }): ColorValue {
  const color = {
    h: ((raw.h % 360) + 360) % 360,
    s: clamp(raw.s, 0, 100),
    b: clamp(raw.b, 0, 100),
    a: clamp(raw.a ?? 1, 0, 1),
  };
  return {
    ...color,
    toFormat: () => makeColor(color),
    toString: (format = "hex") => {
      const rgb = hsbToRgb(color.h, color.s, color.b);
      if (format === "rgb") return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      if (format === "hsl") {
        const hsl = hsbToHsl(color);
        return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
      }
      if (format === "hsb") return `hsb(${Math.round(color.h)}, ${Math.round(color.s)}%, ${Math.round(color.b)}%)`;
      if (format === "css") return color.a < 1 ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${color.a.toFixed(2)})` : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      return `#${[rgb.r, rgb.g, rgb.b].map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
    },
  };
}

export function parseColor(input: string | ColorValue): ColorValue {
  if (typeof input !== "string") return makeColor(input);
  const value = input.trim();
  const hex = value.match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i);
  if (hex) {
    const full = hex[1].length === 3 ? hex[1].split("").map((x) => x + x).join("") : hex[1];
    return makeColor(rgbToHsb(parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)));
  }
  const hsl = value.match(/^hsla?\(([\d.]+),\s*([\d.]+)%?,\s*([\d.]+)%?(?:,\s*([\d.]+))?\)$/i);
  if (hsl) return makeColor({ ...hslToHsb(Number(hsl[1]), Number(hsl[2]), Number(hsl[3])), a: hsl[4] ? Number(hsl[4]) : 1 });
  const rgb = value.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/i);
  if (rgb) return makeColor({ ...rgbToHsb(Number(rgb[1]), Number(rgb[2]), Number(rgb[3])), a: rgb[4] ? Number(rgb[4]) : 1 });
  return makeColor({ h: 208, s: 98, b: 97 });
}

type PickerContextValue = {
  color: ColorValue;
  setColor: (color: ColorValue) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const PickerContext = React.createContext<PickerContextValue | null>(null);

function usePicker() {
  const context = React.useContext(PickerContext);
  if (!context) throw new Error("ColorPicker subcomponents must be used inside ColorPicker");
  return context;
}

function ColorPickerStyles() {
  return (
    <style>{`
      .color-picker{position:relative;display:inline-flex}
      .color-picker__trigger{display:inline-flex;align-items:center;gap:.75rem;border-radius:.5rem;color:hsl(var(--foreground,240 10% 3.9%));font-size:.875rem;line-height:1.25rem;outline:none;transition:background-color 150ms cubic-bezier(.4,0,.2,1),box-shadow 150ms ease-out;cursor:pointer}
      .color-picker__trigger[data-focus-visible=true]{box-shadow:0 0 0 2px hsl(var(--ring,240 5% 65%) / .55)}
      .color-picker__popover{position:absolute;left:0;top:calc(100% + .5rem);z-index:50;display:flex;min-width:15.5rem;max-width:15.5rem;flex-direction:column;gap:.75rem;overflow:hidden;border-radius:min(32px,1.25rem);background:hsl(var(--popover,0 0% 100%));padding:.5rem .5rem .75rem;box-shadow:0 18px 55px rgba(0,0,0,.18),0 4px 18px rgba(0,0,0,.08);transform-origin:top left;animation:color-picker-in 150ms cubic-bezier(.16,1,.3,1)}
      @keyframes color-picker-in{from{opacity:0;transform:translateY(-4px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
      .color-swatch{display:inline-block;flex:none;border:1px solid rgba(0,0,0,.12);background:var(--swatch-color);box-shadow:inset 0 0 0 1px rgba(255,255,255,.26)}
      .color-swatch--xs{width:1rem;height:1rem}.color-swatch--sm{width:1.5rem;height:1.5rem}.color-swatch--lg{width:2rem;height:2rem}
      .color-area{position:relative;width:100%;aspect-ratio:1/1;border-radius:1rem;background:var(--area-bg);box-shadow:inset 0 0 0 1px rgba(0,0,0,.10);touch-action:none;outline:none}
      .color-area__thumb{position:absolute;left:calc(var(--x)*1%);top:calc(var(--top)*1%);width:1rem;height:1rem;transform:translate(-50%,-50%);border:3px solid white;border-radius:.75rem;background:var(--thumb-color);box-shadow:0 0 0 1px rgba(0,0,0,.14),inset 0 0 0 1px rgba(0,0,0,.12);transition:width 150ms ease-out,height 150ms ease-out}
      .color-area__thumb[data-dragging=true]{width:1.25rem;height:1.25rem}
      .color-area__thumb[data-focus-visible=true],.color-slider__thumb[data-focus-visible=true]{outline:2px solid hsl(var(--ring,240 5% 65%));outline-offset:2px}
      .color-slider{display:grid;grid-template-columns:1fr auto;gap:.25rem .5rem;align-items:center;color:hsl(var(--foreground,240 10% 3.9%));font-size:.875rem}
      .color-slider__output{color:hsl(var(--muted-foreground,240 3.8% 46.1%));font-size:.875rem}
      .color-slider__track{grid-column:1/-1;position:relative;height:.75rem;border-radius:9999px;background:var(--track-bg);box-shadow:inset 0 0 0 1px rgba(0,0,0,.1);touch-action:none}
      .color-slider__thumb{position:absolute;left:calc(var(--percent)*1%);top:50%;width:1rem;height:1rem;transform:translate(-50%,-50%);border:3px solid white;border-radius:9999px;background:var(--thumb-color);box-shadow:0 0 0 1px rgba(0,0,0,.14),inset 0 0 0 1px rgba(0,0,0,.12);outline:none;transition:width 150ms ease-out,height 150ms ease-out}
      .color-slider__thumb[data-dragging=true]{width:1.25rem;height:1.25rem}
      .cp-label{font-size:.875rem;line-height:1.25rem;font-weight:500;color:hsl(var(--foreground,240 10% 3.9%))}
      .swatch-picker{display:flex;flex-wrap:wrap;gap:.375rem}.swatch-picker__item{display:inline-flex;border:0;background:transparent;padding:.125rem;border-radius:.5rem;cursor:pointer;outline:none}.swatch-picker__item[data-selected=true]{box-shadow:0 0 0 2px hsl(var(--ring,240 5% 65%) / .55)}
    `}</style>
  );
}

function ColorPickerRoot({
  children,
  className,
  defaultValue = "#0485F7",
  value,
  onChange,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string | ColorValue;
  value?: string | ColorValue;
  onChange?: (color: ColorValue) => void;
  defaultOpen?: boolean;
}) {
  const [internalColor, setInternalColor] = React.useState(() => parseColor(defaultValue));
  const [open, setOpen] = React.useState(defaultOpen);
  const color = value === undefined ? internalColor : parseColor(value);
  const setColor = React.useCallback((next: ColorValue) => {
    setInternalColor(next);
    onChange?.(next);
  }, [onChange]);
  return (
    <PickerContext.Provider value={{ color, setColor, open, setOpen }}>
      <ColorPickerStyles />
      <div className={cn("color-picker", className)} data-slot="color-picker">
        {children}
      </div>
    </PickerContext.Provider>
  );
}

function ColorPickerTrigger({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = usePicker();
  return (
    <button
      type="button"
      className={cn("color-picker__trigger", className)}
      aria-expanded={open}
      data-slot="color-picker-trigger"
      onClick={(event) => {
        props.onClick?.(event);
        setOpen(!open);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function ColorPickerPopover({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = usePicker();
  if (!open) return null;
  return <div className={cn("color-picker__popover", className)} data-slot="color-picker-popover" {...props}>{children}</div>;
}

function channelValue(color: ColorValue, channel: ColorChannel) {
  if (channel === "hue") return color.h;
  if (channel === "saturation") return color.s;
  if (channel === "brightness") return color.b;
  return color.a;
}

function rangeFor(channel: ColorChannel) {
  if (channel === "hue") return 360;
  if (channel === "alpha") return 1;
  if (["red", "green", "blue"].includes(channel)) return 255;
  return 100;
}

function areaBackground(color: ColorValue) {
  const hue = `hsl(${color.h} 100% 50%)`;
  return `linear-gradient(to top, black, transparent), linear-gradient(to right, white, ${hue})`;
}

function trackBackground(color: ColorValue, channel: ColorChannel) {
  if (channel === "hue") return "linear-gradient(to right, rgb(255,0,0), rgb(255,255,0), rgb(0,255,0), rgb(0,255,255), rgb(0,0,255), rgb(255,0,255), rgb(255,0,0))";
  return `linear-gradient(to right, transparent, ${color.toString("css")})`;
}

function ColorAreaRoot({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { colorSpace?: ColorSpace; xChannel?: ColorChannel; yChannel?: ColorChannel }) {
  const { color, setColor } = usePicker();
  const [dragging, setDragging] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const updateFromPoint = React.useCallback((clientX: number, clientY: number) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    const s = clamp(((clientX - box.left) / box.width) * 100, 0, 100);
    const b = clamp(100 - ((clientY - box.top) / box.height) * 100, 0, 100);
    setColor(makeColor({ ...color, s, b }));
  }, [color, setColor]);
  return (
    <div
      ref={ref}
      className={cn("color-area", className)}
      data-slot="color-area"
      style={{ "--area-bg": areaBackground(color), "--x": color.s, "--top": 100 - color.b } as React.CSSProperties}
      onPointerDown={(event) => {
        setDragging(true);
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        updateFromPoint(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => dragging && updateFromPoint(event.clientX, event.clientY)}
      onPointerUp={() => setDragging(false)}
    >
      {React.Children.map(children, (child) => React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { dragging }) : child)}
    </div>
  );
}

function ColorAreaThumb({ dragging }: { dragging?: boolean }) {
  const { color } = usePicker();
  return <div className="color-area__thumb" data-dragging={dragging || undefined} data-slot="color-area-thumb" style={{ "--thumb-color": color.toString("css") } as React.CSSProperties} />;
}

const SliderContext = React.createContext<{ channel: ColorChannel; dragging: boolean; setDragging: (value: boolean) => void } | null>(null);

function ColorSliderRoot({ children, channel, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { channel: ColorChannel; colorSpace?: ColorSpace }) {
  const [dragging, setDragging] = React.useState(false);
  return <SliderContext.Provider value={{ channel, dragging, setDragging }}><div className={cn("color-slider", className)} data-slot="color-slider" {...props}>{children}</div></SliderContext.Provider>;
}

function ColorSliderOutput({ className }: { className?: string }) {
  const { color } = usePicker();
  const ctx = React.useContext(SliderContext)!;
  const value = channelValue(color, ctx.channel);
  return <span className={cn("color-slider__output", className)}>{Math.round(value)}{ctx.channel === "hue" ? "°" : "%"}</span>;
}

function ColorSliderTrack({ children }: { children: React.ReactNode }) {
  const { color, setColor } = usePicker();
  const ctx = React.useContext(SliderContext)!;
  const ref = React.useRef<HTMLDivElement>(null);
  const max = rangeFor(ctx.channel);
  const value = channelValue(color, ctx.channel);
  const update = React.useCallback((clientX: number) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    const next = clamp(((clientX - box.left) / box.width) * max, 0, max);
    setColor(makeColor({ ...color, h: ctx.channel === "hue" ? next : color.h }));
  }, [color, ctx.channel, max, setColor]);
  return (
    <div
      ref={ref}
      className="color-slider__track"
      data-slot="color-slider-track"
      style={{ "--track-bg": trackBackground(color, ctx.channel), "--percent": (value / max) * 100 } as React.CSSProperties}
      onPointerDown={(event) => {
        ctx.setDragging(true);
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        update(event.clientX);
      }}
      onPointerMove={(event) => ctx.dragging && update(event.clientX)}
      onPointerUp={() => ctx.setDragging(false)}
    >
      {children}
    </div>
  );
}

function ColorSliderThumb() {
  const { color } = usePicker();
  const ctx = React.useContext(SliderContext)!;
  const max = rangeFor(ctx.channel);
  const value = channelValue(color, ctx.channel);
  return (
    <div
      className="color-slider__thumb"
      data-dragging={ctx.dragging || undefined}
      data-slot="color-slider-thumb"
      style={{ "--percent": (value / max) * 100, "--thumb-color": color.toString("css") } as React.CSSProperties}
    />
  );
}

function ColorSwatch({ color, size = "sm", className }: { color?: string | ColorValue; size?: "xs" | "sm" | "lg"; className?: string }) {
  const picker = React.useContext(PickerContext);
  const value = color ? parseColor(color) : picker?.color ?? parseColor("#0485F7");
  return <span className={cn("color-swatch", `color-swatch--${size}`, className)} data-slot="color-swatch" style={{ "--swatch-color": value.toString("css"), borderRadius: size === "xs" ? ".375rem" : ".6rem" } as React.CSSProperties} />;
}

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("cp-label", className)} data-slot="label" {...props} />;
}

function ColorSwatchPickerRoot({ children, className }: React.HTMLAttributes<HTMLDivElement> & { size?: string }) {
  return <div className={cn("swatch-picker", className)} data-slot="color-swatch-picker">{children}</div>;
}

function ColorSwatchPickerItem({ children, color }: { children: React.ReactNode; color: string }) {
  const { color: selected, setColor } = usePicker();
  const parsed = parseColor(color);
  const isSelected = selected.toString("hex") === parsed.toString("hex");
  return (
    <button type="button" className="swatch-picker__item" data-selected={isSelected || undefined} onClick={() => setColor(parsed)}>
      {React.Children.map(children, (child) => React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { color }) : child)}
    </button>
  );
}

function ColorSwatchPickerSwatch({ color }: { color?: string }) {
  return <ColorSwatch color={color} size="xs" />;
}

export const ColorPicker = Object.assign(ColorPickerRoot, { Trigger: ColorPickerTrigger, Popover: ColorPickerPopover });
export const ColorArea = Object.assign(ColorAreaRoot, { Thumb: ColorAreaThumb });
export const ColorSlider = Object.assign(ColorSliderRoot, { Output: ColorSliderOutput, Track: ColorSliderTrack, Thumb: ColorSliderThumb });
export const ColorSwatchPicker = Object.assign(ColorSwatchPickerRoot, { Item: ColorSwatchPickerItem, Swatch: ColorSwatchPickerSwatch });
export { ColorSwatch, Label };
export type { ColorChannel, ColorSpace, ColorValue };
