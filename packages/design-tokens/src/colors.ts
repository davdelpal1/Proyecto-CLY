/**
 * Paleta propia de Proyecto CLY (DESIGN.md §3): fondo marino casi negro, acento turquesa y
 * coral cálido. Deliberadamente distinta del azul dominante de las referencias televisivas.
 * Un único tema oscuro por ahora (tema claro: decisión pendiente en DESIGN.md).
 */
export const colors = {
  background: '#0A1022',
  backgroundAlt: '#101A38',
  surface: '#151F3D',
  surfaceRaised: '#1D2A52',
  surfaceOverlay: '#26356A',
  border: '#34447F',
  borderStrong: '#5668B0',

  text: '#F4F6FF',
  textMuted: '#B4BDDF',
  textSubtle: '#9AA5D2',

  accent: '#1FE0CF',
  accentPressed: '#14B8A9',
  onAccent: '#04211F',

  highlight: '#FF7A59',
  highlightPressed: '#E8603E',
  onHighlight: '#2A0E05',

  gold: '#FFC857',
  onGold: '#2A1D00',

  /** Ficha de número pequeña: papel claro con tinta oscura (alto contraste). */
  tilePaper: '#F6F0E1',
  onTilePaper: '#17203F',

  success: '#46E2A0',
  warning: '#FFC857',
  danger: '#FF6B8A',

  focusRing: '#8CF5EC',
  scrim: 'rgba(5, 8, 20, 0.72)',
} as const;

export type ColorToken = keyof typeof colors;
