export default function WidgetWatermark({
  brandSlug,
  customText,
}: {
  brandSlug?: string;
  customText?: string | null;
}) {
  const href = brandSlug
    ? `https://trustlens.co/brand/${brandSlug}`
    : "https://trustlens.co";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute bottom-3 right-4 text-xs text-slate-400 dark:text-slate-600 z-50 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
    >
      {customText ? (
        <span className="font-semibold">{customText}</span>
      ) : (
        <>
          Powered by <span className="font-semibold">Trust</span>
          <span className="font-semibold text-sky-500">Lens</span>
        </>
      )}
    </a>
  );
}
