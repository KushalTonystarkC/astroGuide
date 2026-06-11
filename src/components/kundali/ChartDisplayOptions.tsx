import { useI18n } from "@/i18n";
import { Switch } from "@/components/vedic-ui/switch";

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  testId: string;
  description?: string;
}

function ToggleRow({ label, checked, onChange, testId, description }: ToggleRowProps) {
  return (
    <label
      data-testid={testId}
      className="flex items-center justify-between gap-4 py-1.5 cursor-pointer select-none"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && (
          <span className="block text-mini text-ink-soft leading-snug mt-0.5">{description}</span>
        )}
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-label={label}
        data-testid={`${testId}-switch`}
        className="shrink-0"
      />
    </label>
  );
}

interface Props {
  showDegrees?: boolean;
  onShowDegreesChange?: (v: boolean) => void;
  showAspects?: boolean;
  onShowAspectsChange?: (v: boolean) => void;
  hideOuter: boolean;
  onHideOuterChange: (v: boolean) => void;
  testIdPrefix?: string;
}

export function ChartDisplayOptions({
  showDegrees,
  onShowDegreesChange,
  showAspects,
  onShowAspectsChange,
  hideOuter,
  onHideOuterChange,
  testIdPrefix = "chart",
}: Props) {
  const { t } = useI18n();
  const prefix = testIdPrefix;

  return (
    <fieldset
      data-testid={`${prefix}-display-options`}
      className="rounded-md border border-parchment-200 bg-parchment-50/60 px-3 py-2 min-w-[220px] sm:min-w-[240px]"
    >
      <legend className="px-1 text-mini font-semibold uppercase tracking-wide text-ink-soft">
        {t("chart_display_options")}
      </legend>
      <div className="divide-y divide-parchment-200/80">
        {onShowDegreesChange != null && showDegrees != null && (
          <ToggleRow
            label={t("show_degree")}
            description={t("show_degree_hint")}
            checked={showDegrees}
            onChange={onShowDegreesChange}
            testId={`${prefix}-show-degree-toggle`}
          />
        )}
        {onShowAspectsChange != null && showAspects != null && (
          <ToggleRow
            label={t("drishti_show")}
            description={t("drishti_show_hint")}
            checked={showAspects}
            onChange={onShowAspectsChange}
            testId={`${prefix}-show-aspects-toggle`}
          />
        )}
        <ToggleRow
          label={t("hide_outer")}
          description={t("hide_outer_hint")}
          checked={hideOuter}
          onChange={onHideOuterChange}
          testId={`${prefix}-hide-outer-toggle`}
        />
      </div>
    </fieldset>
  );
}
