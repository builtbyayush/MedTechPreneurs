import { cn } from "@/lib/utils";

type KickerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Kicker({ children, className }: KickerProps) {
  return (
    <p
      className={cn(
        "font-heading text-sm font-bold tracking-[0.2em] text-teal uppercase",
        className
      )}
    >
      {children}
    </p>
  );
}
