import { cn } from "@/lib/utils";

type SceneContainerProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function SceneContainer({ children, className, id }: SceneContainerProps) {
  return (
    <div
      id={id}
      className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-20", className)}
    >
      {children}
    </div>
  );
}
