import { useI18n } from "@/i18n";
import { useAstro } from "@/i18n/astro";
import { houseLord, signForHouse } from "@/lib/vedic/houses";
import { planetColor, SIGN_NAMES } from "@/lib/vedic/planets";
import { Modal, ModalHeader } from "@/components/vedic-ui/modal";
import type { HouseMap } from "@/types/vedic-api";

interface Props {
  house: number | null;
  ascSign: number;
  houseMap?: HouseMap;
  division?: number;
  onClose: () => void;
}

export function HouseDetailModal({ house, ascSign, houseMap, division = 1, onClose }: Props) {
  const { t } = useI18n();
  const a = useAstro();

  if (!house) return null;

  const sign = signForHouse(ascSign, house);
  const lord = houseLord(ascSign, house);
  const occupants = (houseMap?.[house] ?? []).filter((abbr) => abbr !== "Lg");

  return (
    <Modal open={!!house} onClose={onClose}>
      <div className="card p-5 sm:p-6">
        <ModalHeader onClose={onClose} closeLabel={t("hd_close")}>
          <div>
            <h3 className="text-base font-bold text-saffron">
              {t("hd_house")} {a.num(house)} - {t(`house_${house}_name`)}
            </h3>
            {division > 1 && (
              <p className="text-xs text-ink-soft font-bold text-saffron">D{a.num(division)}</p>
            )}
          </div>
        </ModalHeader>

        <section className="mb-4">
          <h4 className="eyebrow-lg mb-2">{t("hd_overview")}</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <Row label={t("col_sign")} value={a.sign(SIGN_NAMES[sign - 1])} />
            <Row label={t("hd_lord")} value={a.planet(lord)} lordColor={planetColor(lordAbbr(lord))} />
          </div>
        </section>

        <section className="mb-4">
          <h4 className="eyebrow-lg mb-2">{t("hd_planets")}</h4>
          {occupants.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {occupants.map((abbr) => (
                <span
                  key={abbr}
                  className="inline-flex items-center gap-1 rounded-2xs px-2.5 py-1 text-xs font-bold"
                  style={{
                    color: planetColor(abbr),
                    backgroundColor: `color-mix(in oklab, ${planetColor(abbr)} 14%, transparent)`,
                  }}
                >
                  {a.abbr(abbr)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-soft italic">{t("hd_no_planets")}</p>
          )}
        </section>

        <section>
          <h4 className="eyebrow-lg mb-2">{t("hd_interpretation")}</h4>
          <p className="text-sm leading-relaxed">{t(`house_${house}_desc`)}</p>
        </section>
      </div>
    </Modal>
  );
}

function lordAbbr(lord: string): string {
  const map: Record<string, string> = {
    Sun: "Su",
    Moon: "Mo",
    Mars: "Ma",
    Mercury: "Me",
    Jupiter: "Ju",
    Venus: "Ve",
    Saturn: "Sa",
  };
  return map[lord] ?? lord.slice(0, 2);
}

function Row({
  label,
  value,
  lordColor,
}: {
  label: string;
  value: string;
  lordColor?: string;
}) {
  return (
    <>
      <span className="text-ink-soft">{label}</span>
      <span className="font-medium" style={lordColor ? { color: lordColor } : undefined}>
        {value}
      </span>
    </>
  );
}
