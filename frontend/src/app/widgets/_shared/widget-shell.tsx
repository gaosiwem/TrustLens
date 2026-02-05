import WidgetUnauthorized from "./widget-unauthorized";
import WidgetWatermark from "./widget-watermark";

type Props = {
  ok: boolean;
  reason?: string;
  theme: "light" | "dark";
  showWatermark?: boolean;
  widgetWatermarkText?: string | null;
  brandSlug?: string;
  children: React.ReactNode;
};

export default function WidgetShell(props: Props) {
  return (
    <div className={`widget-root ${props.theme === "dark" ? "dark" : ""}`}>
      <style>{`
          /* Override global body styles for widget context if needed */
          body {
             background: transparent !important;
          }
        `}</style>
      {!props.ok ? (
        <WidgetUnauthorized reason={props.reason || "unauthorized"} />
      ) : (
        <div className="relative min-h-screen bg-white dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-50">
          {props.children}
          {props.showWatermark ? (
            <WidgetWatermark
              brandSlug={props.brandSlug}
              customText={props.widgetWatermarkText}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
