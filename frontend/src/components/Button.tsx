interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function Button({
  children,
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonProps) {
  const baseStyles =
    "btn-base w-full transition-colors inline-flex items-center justify-center";

  const variants = {
    primary: "btn-primary",
    outline:
      "border border-border hover:bg-muted text-foreground bg-transparent",
    ghost: "hover:bg-muted text-foreground bg-transparent",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const sizes = {
    default: "", // Inherits btn-base (h-12 px-6)
    sm: "!h-9 !px-3 !text-sm !rounded-md",
    lg: "!h-14 !px-8 !text-lg",
    icon: "!h-10 !w-10 !p-2 flex items-center justify-center", // For icon-only buttons
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`}
    >
      {children}
    </button>
  );
}
