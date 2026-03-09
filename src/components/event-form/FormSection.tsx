import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

const FormSection = ({ icon, title, description, children, className }: FormSectionProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
};

export default FormSection;
