import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { useAstro } from "@/i18n/astro";
import { VedicChart } from "@/components/kundali/VedicChart";
import type { PlanetStatus } from "@/components/kundali/VedicChart";
import { SouthIndianChart } from "@/components/kundali/SouthIndianChart";
import { WesternChart } from "@/components/kundali/WesternChart";
import { ChartDisplayOptions } from "@/components/kundali/ChartDisplayOptions";
import { SegmentedControl } from "@/components/vedic-ui/segmented-control";
import { vargaName, vargaSubtitle } from "@/lib/vedic/vargas";
import type { ChartData, Planet } from "@/types/vedic-api";

export const OUTER_ABBRS = new Set(["Ur", "Ne", "Pl"]);

export const HIDE_OUTER_KEY = "jk_hide_outer";

export function loadHideOuter(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(HIDE_OUTER_KEY);
  if (v === null) return true;
  return v === "1";
}

interface Props {
  data: ChartData;
  selectedPlanet: string | null;
  onSelectPlanet: (abbr: string | null) => void;
  onPlanetDetail?: (abbr: string, division: number) => void;
  onHouseDetail?: (house: number, division: number) => void;
  hideOuter: boolean;
  onHideOuterChange: (v: boolean) => void;
  filteredPlanets: Planet[];
}

type ChartStyle = "north" | "south" | "west";

const STYLE_KEY = "jk_chart_style";
const SHOW_DEGREE_KEY = "jk_show_degree";
const SHOW_ASPECTS_KEY = "jk_show_aspects";

function loadStyle(): ChartStyle {
  if (typeof window === "undefined") return "north";
  const v = window.localStorage.getItem(STYLE_KEY);
  if (v === "south" || v === "west") return v;
  return "north";
}

function loadShowDegree(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SHOW_DEGREE_KEY) === "1";
}

function loadShowAspects(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SHOW_ASPECTS_KEY) === "1";
}

export function ChartTabs({
  data,
  selectedPlanet,
  onSelectPlanet,
  onPlanetDetail,
  onHouseDetail,
  hideOuter,
  onHideOuterChange,
  filteredPlanets,
}: Props) {
  const { t, lang } = useI18n();
  const a = useAstro();
  const vargaKeys = data.varga_order ?? [1, 2, 9];
  const [tab, setTab] = useState<string>(`d${vargaKeys[0] ?? 1}`);
  const [chartStyle, setChartStyleState] = useState<ChartStyle>(loadStyle);
  const [showDegrees, setShowDegreesState] = useState<boolean>(loadShowDegree);
  const [showAspects, setShowAspectsState] = useState<boolean>(loadShowAspects);
  const didInitAspects = useRef(false);
  const vargas = data.vargas ?? {};

  useEffect(() => {
    if (didInitAspects.current) return;
    didInitAspects.current = true;
    if (showAspects && !selectedPlanet && data.drishti) {
      onSelectPlanet("Ma");
    }
  }, [showAspects, selectedPlanet, data.drishti, onSelectPlanet]);

  const setChartStyle = (s: ChartStyle) => {
    setChartStyleState(s);
    try {
      window.localStorage.setItem(STYLE_KEY, s);
    } catch {
      /* ignore quota errors */
    }
  };

  const setShowDegrees = (v: boolean) => {
    setShowDegreesState(v);
    try {
      window.localStorage.setItem(SHOW_DEGREE_KEY, v ? "1" : "0");
    } catch {
      /* ignore quota errors */
    }
  };

  const setShowAspects = (v: boolean) => {
    setShowAspectsState(v);
    if (v) {
      onSelectPlanet("Ma");
    } else {
      onSelectPlanet(null);
    }
    try {
      window.localStorage.setItem(SHOW_ASPECTS_KEY, v ? "1" : "0");
    } catch {
      /* ignore quota errors */
    }
  };

  const active = vargas[tab] ?? {
    chart: data.d1_chart,
    asc_sign: data.d1_asc_sign,
    name: "Rashi",
    division: 1,
    planet_degrees: {} as Record<string, number>,
  };

  const activeName = vargaName(active.division, active.name, lang);
  const activeSubtitle = vargaSubtitle(active.division, active.subtitle, lang);
  const planetDegrees = active.planet_degrees;
  const isWest = chartStyle === "west";
  const isD1 = tab === "d1";

  const filteredChart = useMemo(() => {
    if (!hideOuter) return active.chart;
    const out: Record<number, string[]> = {};
    for (const [h, abbrs] of Object.entries(active.chart)) {
      out[Number(h)] = abbrs.filter((a) => !OUTER_ABBRS.has(a));
    }
    return out;
  }, [active.chart, hideOuter]);

  const filteredDegrees = useMemo(() => {
    if (!hideOuter) return planetDegrees;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(planetDegrees)) {
      if (!OUTER_ABBRS.has(k)) out[k] = v;
    }
    return out;
  }, [planetDegrees, hideOuter]);

  const planetStatus = useMemo(() => {
    const map: Record<string, PlanetStatus> = {};
    for (const p of data.planets_data) {
      if (p.retrograde || p.combust) {
        map[p.abbr] = { retrograde: p.retrograde, combust: !!p.combust };
      }
    }
    return map;
  }, [data.planets_data]);

  const handleChartPlanetClick = useCallback(
    (abbr: string | null) => {
      if (showAspects) {
        onSelectPlanet(abbr);
      } else if (abbr && onPlanetDetail) {
        onPlanetDetail(abbr, active.division);
      }
    },
    [showAspects, onSelectPlanet, onPlanetDetail, active.division],
  );

  const handleChartHouseClick = useCallback(
    (house: number) => {
      if (onHouseDetail) {
        onHouseDetail(house, active.division);
      }
    },
    [onHouseDetail, active.division],
  );

  return (
    <div className="card p-4 sm:p-5" data-testid="chart-tabs">
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 pb-3 border-b border-parchment-200">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <SegmentedControl<ChartStyle>
            ariaLabel={t("chart_style")}
            testId="chart-style-toggle"
            value={chartStyle}
            onChange={setChartStyle}
            options={[
              { id: "north", label: t("north_indian"), testId: "chart-style-north" },
              { id: "south", label: t("south_indian"), testId: "chart-style-south" },
              { id: "west", label: t("western"), testId: "chart-style-west" },
            ]}
          />

          {!isWest && (
            <>
              <label className="sr-only" htmlFor="varga-select">
                Divisional chart
              </label>
              <select
                id="varga-select"
                data-testid="varga-select"
                value={tab}
                onChange={(e) => setTab(e.target.value)}
                className="field num flex-1 min-w-[180px] sm:max-w-xs"
              >
                {vargaKeys.map((n) => {
                  const key = `d${n}`;
                  const v = vargas[key];
                  const label = v ? vargaName(n, v.name, lang) : "";
                  return (
                    <option key={key} value={key}>
                      D{a.num(n)}
                      {label ? ` - ${label}` : ""}
                    </option>
                  );
                })}
              </select>
            </>
          )}
        </div>

        <ChartDisplayOptions
          showDegrees={!isWest ? showDegrees : undefined}
          onShowDegreesChange={!isWest ? setShowDegrees : undefined}
          showAspects={!isWest && isD1 && data.drishti ? showAspects : undefined}
          onShowAspectsChange={
            !isWest && isD1 && data.drishti ? setShowAspects : undefined
          }
          hideOuter={hideOuter}
          onHideOuterChange={onHideOuterChange}
          testIdPrefix="chart"
        />
      </div>

      <div className="bg-parchment-50 p-2 rounded-sm">
        {isWest ? (
          <WesternChart
            planets={filteredPlanets}
            ascendant={data.ascendant}
            ascSign={data.d1_asc_sign}
            title={`Rashi Chakra · D${a.num(1)}`}
            testId="chart-west"
            onSelectPlanet={onPlanetDetail ? (abbr: string) => onPlanetDetail(abbr, 1) : undefined}
          />
        ) : chartStyle === "south" ? (
          <SouthIndianChart
            houseMap={filteredChart}
            ascSign={active.asc_sign}
            title={`${activeName} · D${a.num(active.division)}`}
            testId={`chart-${tab}`}
            planetDegrees={filteredDegrees}
            planetStatus={isD1 ? planetStatus : undefined}
            showDegrees={showDegrees}
            selectedPlanet={isD1 && showAspects ? selectedPlanet : null}
            onSelectPlanet={handleChartPlanetClick}
            onSelectHouse={onHouseDetail ? handleChartHouseClick : undefined}
            drishti={isD1 ? data.drishti : undefined}
            showAspects={isD1 && showAspects}
          />
        ) : (
          <VedicChart
            houseMap={filteredChart}
            ascSign={active.asc_sign}
            title={`${activeName} · D${a.num(active.division)}`}
            testId={`chart-${tab}`}
            planetDegrees={filteredDegrees}
            planetStatus={isD1 ? planetStatus : undefined}
            showDegrees={showDegrees}
            selectedPlanet={isD1 && showAspects ? selectedPlanet : null}
            onSelectPlanet={handleChartPlanetClick}
            onSelectHouse={onHouseDetail ? handleChartHouseClick : undefined}
            drishti={isD1 ? data.drishti : undefined}
            showAspects={isD1 && showAspects}
          />
        )}
        {!isWest && activeSubtitle && (
          <p className="text-center text-xs text-ink-soft mt-3 italic">{activeSubtitle}</p>
        )}
        {!isWest && (onPlanetDetail || onHouseDetail) && (
          <p className="text-center text-xs mt-3 italic" style={{ color: "var(--accent-amber)" }}>
            {isD1 && showAspects && data.drishti ? t("drishti_aspect_hint") : t("drishti_hint")}
          </p>
        )}
      </div>

      <p className="text-center text-xs text-ink-soft mt-4 italic">{t("lagna_caption")}</p>
    </div>
  );
}
