"use client"

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { BirthForm, type BirthFormState } from "@/components/kundali/BirthForm";
import { BirthHeader } from "@/components/kundali/BirthHeader";
import {
  ChartTabs,
  HIDE_OUTER_KEY,
  OUTER_ABBRS,
  loadHideOuter,
} from "@/components/kundali/ChartTabs";
import { PlanetsTable } from "@/components/kundali/PlanetsTable";
import { PlanetDetailModal } from "@/components/kundali/PlanetDetailModal";
import { HouseDetailModal } from "@/components/kundali/HouseDetailModal";
import { DashaTable } from "@/components/kundali/DashaTable";
import { AshtakavargaTable } from "@/components/kundali/AshtakavargaTable";
import { DrishtiPanel } from "@/components/kundali/DrishtiPanel";
import { JaiminiSection } from "@/components/kundali/JaiminiSection";
import { MandalaLoader } from "@/components/astrology/mandala-loader";
import { ShareLinkButton } from "@/components/astrology/share-link-button";
import { useAuth } from "@/components/providers/auth-provider";
import { isVedicChartData } from "@/lib/chart-display";
import { fetchChartById, saveChartToDb } from "@/lib/charts";
import { saveChart as saveChartLocal } from "@/lib/local-storage";
import { calculateChart, printPdf } from "@/lib/vedic/api";
import {
  parseDate,
  parseFloat3,
  parseStr,
  parseTime,
  parseTz,
  readSearch,
  round4,
  shareUrlFor,
} from "@/lib/vedic/urlState";
import type { ChartData, LocationChoice } from "@/types/vedic-api";

// PDF ships full label sets for all 15 UI languages. Bundled fonts cover
// Latin (incl. Cyrillic), Devanagari, Tamil, SC, JP, Arabic (Persian shares
// the script), Hebrew, Bengali. Nepali reuses the Devanagari face.
type PdfLang =
  | "en"
  | "hi"
  | "ta"
  | "bn"
  | "ne"
  | "zh"
  | "ja"
  | "es"
  | "de"
  | "pt"
  | "fr"
  | "ru"
  | "ar"
  | "fa"
  | "he";
const PDF_LANGS = new Set<PdfLang>([
  "en",
  "hi",
  "ta",
  "bn",
  "ne",
  "zh",
  "ja",
  "es",
  "de",
  "pt",
  "fr",
  "ru",
  "ar",
  "fa",
  "he",
]);
const pdfLangFor = (uiLang: string): PdfLang =>
  PDF_LANGS.has(uiLang as PdfLang) ? (uiLang as PdfLang) : "en";

function pdfFilename(name: string, birthDate: string): string {
  const safeName =
    name.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "kundali";
  return `vedic-kundali-${safeName}-${birthDate || "chart"}.pdf`;
}

function triggerBlobDownload(blob: Blob, filename: string): string {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  return url;
}

const DEFAULT_FORM: BirthFormState = {
  birth_date: "1995-08-29",
  birth_time: "12:00",
  place_name: "Ujjain, India",
  latitude: 23.1765,
  longitude: 75.7885,
  timezone: "Asia/Kolkata",
  ayanamsa: "lahiri",
};

interface Props {
  sharedLocation: LocationChoice;
  onLocationChange: (loc: LocationChoice) => void;
}

export function KundaliPage({ sharedLocation, onLocationChange }: Props) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const savedChartIdParam = searchParams.get("id");

  // Capture URL params once on mount. Lat/lon together signal a shared link
  // worth honoring; without both we fall back to sharedLocation.
  const initialParams = useMemo(() => {
    const sp = readSearch();
    const lat = parseFloat3(sp.get("lat"), -90, 90);
    const lon = parseFloat3(sp.get("lon"), -180, 180);
    return {
      name: parseStr(sp.get("name"), 80),
      birth_date: parseDate(sp.get("birth_date")),
      birth_time: parseTime(sp.get("birth_time")),
      lat,
      lon,
      tz: parseTz(sp.get("tz")),
      place: parseStr(sp.get("place"), 120),
      ayanamsa: parseStr(sp.get("ayanamsa"), 20),
      hasLocation: lat != null && lon != null,
    };
  }, []);

  const [form, setForm] = useState<BirthFormState>(() => {
    const base: BirthFormState = {
      ...DEFAULT_FORM,
      place_name: sharedLocation.place_name,
      latitude: sharedLocation.latitude,
      longitude: sharedLocation.longitude,
      timezone: sharedLocation.timezone,
    };
    if (initialParams.birth_date) base.birth_date = initialParams.birth_date;
    if (initialParams.birth_time) base.birth_time = initialParams.birth_time;
    if (initialParams.ayanamsa) base.ayanamsa = initialParams.ayanamsa;
    if (initialParams.hasLocation) {
      base.latitude = initialParams.lat as number;
      base.longitude = initialParams.lon as number;
      base.timezone = initialParams.tz;
      base.place_name = initialParams.place ?? "Shared location";
    }
    return base;
  });
  const [data, setData] = useState<ChartData | null>(null);
  const [submittedPlaceName, setSubmittedPlaceName] = useState<string>(
    initialParams.hasLocation
      ? (initialParams.place ?? "Shared location")
      : sharedLocation.place_name,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nativeName, setNativeName] = useState<string>(initialParams.name ?? "");
  const [printing, setPrinting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedChartId, setSavedChartId] = useState<string | null>(
    savedChartIdParam,
  );
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [detailPlanetAbbr, setDetailPlanetAbbr] = useState<string | null>(null);
  const [detailHouseNum, setDetailHouseNum] = useState<number | null>(null);
  const [detailDivision, setDetailDivision] = useState(1);
  const [hideOuter, setHideOuterState] = useState(loadHideOuter);
  const didAutoRunRef = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [scrollToResults, setScrollToResults] = useState(false);

  const setHideOuter = (v: boolean) => {
    setHideOuterState(v);
    try {
      window.localStorage.setItem(HIDE_OUTER_KEY, v ? "1" : "0");
    } catch {
      /* ignore quota errors */
    }
  };

  const filteredPlanets = useMemo(() => {
    if (!data || !hideOuter) return data?.planets_data ?? [];
    return data.planets_data.filter((p) => !OUTER_ABBRS.has(p.abbr));
  }, [data, hideOuter]);

  const filteredDrishti = useMemo(() => {
    if (!data?.drishti || !hideOuter) return data?.drishti;
    const d = data.drishti;
    const byPlanet: typeof d.by_planet = {};
    for (const [k, v] of Object.entries(d.by_planet)) {
      if (!OUTER_ABBRS.has(k)) byPlanet[k] = v;
    }
    return {
      aspects: d.aspects.filter((a) => !OUTER_ABBRS.has(a.planet_abbr)),
      by_planet: byPlanet,
      mutual: d.mutual.filter(
        (m) => !OUTER_ABBRS.has(m.planet1.slice(0, 2)) && !OUTER_ABBRS.has(m.planet2.slice(0, 2)),
      ),
    };
  }, [data, hideOuter]);

  const detailPlanet = useMemo(() => {
    if (!detailPlanetAbbr || !data) return null;
    const base =
      data.ascendant.abbr === detailPlanetAbbr
        ? data.ascendant
        : (data.planets_data.find((p) => p.abbr === detailPlanetAbbr) ?? null);
    if (!base || detailDivision === 1) return base;
    const varga = data.vargas?.[`d${detailDivision}`];
    if (!varga) return base;
    const house = Object.entries(varga.chart).find(([, planets]) => planets.includes(base.abbr));
    const houseNum = house ? Number(house[0]) : base.house;
    const signId = houseNum != null ? ((varga.asc_sign - 1 + (houseNum - 1)) % 12) + 1 : undefined;
    const SIGN_NAMES = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];
    return {
      ...base,
      house: houseNum,
      sign: signId != null ? SIGN_NAMES[signId - 1] : base.sign,
      dms:
        varga.planet_degrees[base.abbr] != null
          ? `${Math.floor(varga.planet_degrees[base.abbr])}°`
          : base.dms,
    };
  }, [detailPlanetAbbr, detailDivision, data]);

  const openPlanetDetail = useCallback((abbr: string | null, division = 1) => {
    setDetailHouseNum(null);
    setDetailPlanetAbbr(abbr);
    setDetailDivision(division);
  }, []);

  const openHouseDetail = useCallback((house: number, division = 1) => {
    setDetailPlanetAbbr(null);
    setDetailHouseNum(house);
    setDetailDivision(division);
  }, []);

  const detailHouseContext = useMemo(() => {
    if (!detailHouseNum || !data) return null;
    const varga =
      detailDivision === 1
        ? { asc_sign: data.d1_asc_sign, chart: data.d1_chart }
        : data.vargas?.[`d${detailDivision}`];
    if (!varga) return null;
    let houseMap = varga.chart;
    if (hideOuter) {
      const out: Record<number, string[]> = {};
      for (const [h, abbrs] of Object.entries(houseMap)) {
        out[Number(h)] = abbrs.filter((a) => !OUTER_ABBRS.has(a));
      }
      houseMap = out;
    }
    return { ascSign: varga.asc_sign, houseMap };
  }, [detailHouseNum, detailDivision, data, hideOuter]);

  const calculate = async (body: BirthFormState) => {
    setLoading(true);
    setError(null);
    try {
      const result = await calculateChart({
        birth_date: body.birth_date,
        birth_time: body.birth_time,
        latitude: body.latitude,
        longitude: body.longitude,
        timezone: body.timezone,
        place_name: body.place_name,
        ayanamsa: body.ayanamsa as never,
      });
      setData(result);
      setSubmittedPlaceName(body.place_name);
      setSavedChartId(null);
    } catch (e) {
      setError((e as Error).message || "Failed to compute chart");
      // Keep previous chart visible on error rather than wiping it.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!savedChartIdParam) return;

    let cancelled = false;
    setLoading(true);

    fetchChartById(savedChartIdParam)
      .then((saved) => {
        if (cancelled) return;
        if (!saved) {
          setError("Chart not found");
          setLoading(false);
          return;
        }

        const loadedForm: BirthFormState = {
          ...DEFAULT_FORM,
          birth_date: saved.birthDetails.date,
          birth_time: saved.birthDetails.time,
          place_name: saved.birthDetails.place,
          latitude: form.latitude,
          longitude: form.longitude,
          timezone: form.timezone,
          ayanamsa: form.ayanamsa,
        };

        if (isVedicChartData(saved.chartData)) {
          loadedForm.latitude = saved.chartData.birth.latitude;
          loadedForm.longitude = saved.chartData.birth.longitude;
          loadedForm.timezone = saved.chartData.birth.timezone;
          loadedForm.ayanamsa = saved.chartData.birth.ayanamsa_id;
        }

        setForm(loadedForm);
        setNativeName(saved.birthDetails.name);
        setSubmittedPlaceName(saved.birthDetails.place);
        setSavedChartId(saved.id);

        if (isVedicChartData(saved.chartData)) {
          setData(saved.chartData);
          setLoading(false);
          return;
        }

        void calculate(loadedForm);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message || "Failed to load chart");
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedChartIdParam]);

  useEffect(() => {
    if (savedChartIdParam) return;
    if (didAutoRunRef.current) return;
    didAutoRunRef.current = true;
    calculate(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedChartIdParam]);

  useEffect(() => {
    if (!scrollToResults || loading) return;
    setScrollToResults(false);
    if (data) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [scrollToResults, loading, data]);

  // URL params are only generated on-demand via the share-link button
  // (shareUrlFor). The address bar stays clean at all times.

  const onSubmit = () => {
    if (!Number.isFinite(form.latitude) || !Number.isFinite(form.longitude)) {
      setError("Please enter valid latitude and longitude, or pick a city.");
      return;
    }
    onLocationChange({
      place_name: form.place_name,
      latitude: form.latitude,
      longitude: form.longitude,
      timezone: form.timezone,
    });
    setScrollToResults(true);
    calculate(form);
  };

  const onSave = async () => {
    if (!data) return;
    setSaving(true);
    setError(null);
    try {
      const birthDetails = {
        name: nativeName || "Unknown",
        date: form.birth_date,
        time: form.birth_time,
        place: submittedPlaceName,
      };

      if (user) {
        const saved = await saveChartToDb(birthDetails, data);
        setSavedChartId(saved.id);
        toast.success(t("chart_saved"));
      } else {
        const saved = saveChartLocal(birthDetails, data);
        setSavedChartId(saved.id);
        toast.success(t("chart_saved_local"), {
          description: (
            <>
              <Link href="/login" className="underline">
                {t("sign_in_to_sync")}
              </Link>
            </>
          ),
        });
      }
    } catch (e) {
      setError((e as Error).message || "Failed to save chart");
    } finally {
      setSaving(false);
    }
  };

  const onPrint = async () => {
    if (!Number.isFinite(form.latitude) || !Number.isFinite(form.longitude)) {
      setError("Please enter valid latitude and longitude, or pick a city.");
      return;
    }
    // Open the tab synchronously - iOS Safari requires this inside the
    // user gesture or it blocks the popup. Crucially, no `noopener`: that
    // flag makes iOS Safari refuse to let the parent control the tab,
    // turning `newTab.location.href = url` into a silent no-op.
    const newTab = window.open("about:blank", "_blank");
    if (newTab) {
      // Show a loading hint so the user doesn't stare at an empty tab.
      try {
        newTab.document.write(
          "<!DOCTYPE html><html><head><title>Preparing PDF…</title>" +
            '<meta name="viewport" content="width=device-width,initial-scale=1">' +
            '</head><body style="margin:0;font-family:-apple-system,system-ui,sans-serif;' +
            'display:flex;align-items:center;justify-content:center;height:100vh;color:#555">' +
            "<p>Preparing PDF…</p></body></html>",
        );
      } catch {
        /* document may not be writable in edge cases */
      }
    }
    setPrinting(true);
    setError(null);
    try {
      const blob = await printPdf({
        name: nativeName,
        sex: "Male",
        birth_date: form.birth_date,
        birth_time: form.birth_time,
        latitude: form.latitude,
        longitude: form.longitude,
        timezone: form.timezone,
        place_name: form.place_name,
        ayanamsa: form.ayanamsa,
        lang: pdfLangFor(lang),
      });
      const filename = pdfFilename(nativeName, form.birth_date);
      const url = triggerBlobDownload(blob, filename);
      if (newTab && !newTab.closed) {
        // iOS Safari won't navigate a new tab directly to a blob URL via
        // location.href, but it WILL render a blob URL inside an iframe
        // hosted in that tab. Include a download link for browsers that
        // block programmatic downloads after async work.
        newTab.document.open();
        newTab.document.write(
          "<!DOCTYPE html><html><head><title>Vedic Kundali</title>" +
            '<meta name="viewport" content="width=device-width,initial-scale=1">' +
            '</head><body style="margin:0;height:100vh;background:#222;display:flex;flex-direction:column">' +
            `<div style="padding:10px;background:#111;text-align:center">` +
            `<a href="${url}" download="${filename}" ` +
            'style="color:#fff;font-family:system-ui,sans-serif;font-size:14px;text-decoration:underline">' +
            "Download PDF</a></div>" +
            `<iframe src="${url}" title="Vedic Kundali" ` +
            'style="border:0;flex:1;width:100%;display:block"></iframe>' +
            "</body></html>",
        );
        newTab.document.close();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      if (newTab && !newTab.closed) newTab.close();
      setError((e as Error).message || "PDF generation failed");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <section className="pt-3 sm:pt-4 pb-8" data-testid="kundali-page">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Left sidebar — form */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="card p-3 sm:p-4 lg:p-5 lg:sticky lg:top-16">
            <h2 className="heading-section">{t("birth_details")}</h2>
            <p className="meta mb-4">{t("enter_native_time_place")}</p>
            <div className="mb-3">
              <label className="field-label" htmlFor="native-name-input">
                {t("native_name")}
              </label>
              <input
                id="native-name-input"
                data-testid="native-name-input"
                type="text"
                value={nativeName}
                onChange={(e) => setNativeName(e.target.value)}
                className="field"
                maxLength={40}
                autoComplete="name"
              />
            </div>
            <BirthForm form={form} setForm={setForm} onSubmit={onSubmit} loading={loading} />
            <div className="mt-3 space-y-2">
              <button
                type="button"
                data-testid="save-chart"
                onClick={() => void onSave()}
                disabled={!data || saving || loading || Boolean(savedChartId)}
                className="btn-primary w-full"
              >
                {savedChartId
                  ? t("chart_saved")
                  : saving
                    ? t("saving_chart")
                    : t("save_chart")}
              </button>
              <button
                type="button"
                data-testid="print-pdf"
                onClick={onPrint}
                disabled={printing || loading}
                className="btn-ghost w-full"
              >
                {printing ? t("preparing_pdf") : t("print_pdf")}
              </button>
            </div>
            {error && (
              <div
                data-testid="error-banner"
                className="mt-3 border border-rose/40 bg-rose/5 text-rose text-mini px-3 py-2 rounded-sm"
              >
                {error}
              </div>
            )}
          </div>
        </aside>

        {/* Middle — chart + data */}
        <div
          ref={resultsRef}
          className="lg:col-span-8 xl:col-span-9 space-y-4 scroll-mt-16"
        >
          {loading && !data && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <MandalaLoader size={48} />
              <p className="meta italic">{t("consulting_heavens")}</p>
            </div>
          )}
          {data && (
            <>
              <BirthHeader
                data={data}
                nativeName={nativeName}
                placeName={submittedPlaceName}
              />
              <div className="flex justify-end">
                <ShareLinkButton
                  testId="kundali-share-link"
                  url={shareUrlFor("/chart", {
                    name: nativeName || undefined,
                    birth_date: form.birth_date,
                    birth_time: form.birth_time,
                    lat: round4(form.latitude),
                    lon: round4(form.longitude),
                    tz: form.timezone || undefined,
                    place: form.place_name || undefined,
                    ayanamsa: form.ayanamsa === "lahiri" ? undefined : form.ayanamsa,
                  })}
                />
              </div>
              <ChartTabs
                data={data}
                selectedPlanet={selectedPlanet}
                onSelectPlanet={setSelectedPlanet}
                onPlanetDetail={openPlanetDetail}
                onHouseDetail={openHouseDetail}
                hideOuter={hideOuter}
                onHideOuterChange={setHideOuter}
                filteredPlanets={filteredPlanets}
              />
              <PlanetsTable
                planets={filteredPlanets}
                ascendant={data.ascendant}
                drishti={filteredDrishti}
                friendships={data.friendships}
                onSelectPlanet={openPlanetDetail}
              />
              {filteredDrishti && (
                <DrishtiPanel
                  drishti={filteredDrishti}
                  selectedPlanet={selectedPlanet}
                  onSelectPlanet={setSelectedPlanet}
                />
              )}
              <DashaTable
                dasha={data.dasha}
                dashaAntar={data.dasha_antar}
                planets={filteredPlanets}
                ascendant={data.ascendant}
                birthIso={data.birth.local_time}
              />
              <JaiminiSection
                karakas={data.karakas}
                karakamsa={data.karakamsa}
                swamsa={data.swamsa}
              />
              <AshtakavargaTable ashtakavarga={data.ashtakavarga} />
              <PlanetDetailModal
                planet={detailPlanet}
                data={data}
                division={detailDivision}
                onClose={() => setDetailPlanetAbbr(null)}
              />
              <HouseDetailModal
                house={detailHouseNum}
                ascSign={detailHouseContext?.ascSign ?? data.d1_asc_sign}
                houseMap={detailHouseContext?.houseMap}
                division={detailDivision}
                onClose={() => setDetailHouseNum(null)}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
