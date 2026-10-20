export { celebrate, Confetti } from "./components/confetti/Confetti.tsx";
export { buttery } from "./factory/buttery.tsx";
export type {
  ButteryComponentProps,
  ButteryElementProps,
  ButteryFactory,
  ButteryIntrinsicComponent,
  ButteryIntrinsics,
  ButteryRecipe,
} from "./factory/buttery.tsx";
export { ButteryProvider } from "./provider/ButteryProvider.tsx";
export type {
  ButteryProviderProps,
  ColorSchemePreference,
  ReducedMotionPreference,
} from "./provider/ButteryProvider.tsx";
export { useButtery } from "./provider/context.ts";
export type { ButteryContextValue, Platform } from "./provider/context.ts";
export { useMediaQuery } from "./provider/use-media-query.ts";
