import type { ReactElement } from "react";
import { DateRangeBar } from "@buttery/react";

/** The bar in Spanish, with its own words for every part. */
export function SpanishLabels(): ReactElement {
  return (
    <DateRangeBar
      label="Periodo"
      labels={{
        range: "Rango de fechas",
        interval: "Intervalo",
        comparison: "Comparación",
        comparedTo: "comparado con",
        customRange: "Rango propio",
        start: "Inicio",
        end: "Fin",
        presets: {
          today: "Hoy",
          "last-7-days": "Últimos 7 días",
          "last-4-weeks": "Últimas 4 semanas",
          "last-3-months": "Últimos 3 meses",
          "last-12-months": "Últimos 12 meses",
          "month-to-date": "Mes en curso",
          "year-to-date": "Año en curso",
          custom: "Propio",
        },
        intervals: { daily: "Diario", weekly: "Semanal", monthly: "Mensual" },
        comparisons: {
          "previous-period": "Periodo anterior",
          "previous-year": "Año anterior",
          none: "Sin comparación",
        },
      }}
    />
  );
}
