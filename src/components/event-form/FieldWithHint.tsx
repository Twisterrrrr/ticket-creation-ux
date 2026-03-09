import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface FieldWithHintProps {
  hint?: string;
  children: ReactNode;
}

const FieldWithHint = ({ hint, children }: FieldWithHintProps) => {
  if (!hint) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[200px]">
          <p className="text-xs">{hint}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default FieldWithHint;
