export default function WidgetUnauthorized({ reason }: { reason: string }) {
  return (
    <div className="flex min-h-[220px] w-full items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="text-base font-semibold">Widget unavailable</div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          This widget cannot load on this domain.
        </div>
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-500">
          Reason: {reason}
        </div>
      </div>
    </div>
  );
}
