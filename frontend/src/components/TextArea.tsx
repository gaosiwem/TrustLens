import { forwardRef } from "react";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#111618] dark:text-white">
        {label}
      </label>
      <textarea
        ref={ref}
        {...props}
        className="w-full min-h-[120px] p-3 rounded-xl border border-[#dce0e5] dark:border-[#2c3e46] bg-white dark:bg-[#1a2c34] text-[#111618] dark:text-white placeholder:text-[#93a2b7] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);

TextArea.displayName = "TextArea";

export default TextArea;
