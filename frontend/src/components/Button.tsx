interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost" | "destructive";
}

export default function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const baseStyles = "btn-base w-full transition-colors";
  const variants = {
    primary: "btn-primary",
    outline:
      "border border-border hover:bg-muted text-foreground bg-transparent",
    ghost: "hover:bg-muted text-foreground bg-transparent",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${variants[variant]} ${className || ""}`}
    >
      {children}
    </button>
  );
}
