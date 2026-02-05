import { forwardRef, InputHTMLAttributes } from "react";
import classNames from "classnames";

interface InputFieldProps extends React.InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  multiline?: boolean;
  rows?: number;
  wrapperClassName?: string;
}

const InputField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputFieldProps
>(({ label, icon, error, id, multiline, wrapperClassName, ...props }, ref) => {
  const inputId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const Component = multiline ? "textarea" : "input";

  return (
    <div
      className={classNames("flex flex-col gap-1.5 w-full", wrapperClassName)}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="text-foreground text-sm font-medium"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center justify-center pointer-events-none">
            {icon}
          </span>
        )}
        <Component
          id={inputId}
          ref={ref as any}
          {...(props as any)}
          className={classNames(
            "input-base w-full",
            multiline ? "py-4 min-h-[120px] h-auto" : "h-12",
            icon ? "pl-12 pr-4" : "px-4",
            props.className,
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});

InputField.displayName = "InputField";

export default InputField;
