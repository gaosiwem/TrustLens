interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button {...props} className={`btn-base btn-primary w-full ${className}`}>
      {children}
    </button>
  );
}
