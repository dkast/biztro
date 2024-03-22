import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

export const TooltipHelper = ({
  children,
  content
}: {
  children: React.ReactNode
  content: React.ReactNode
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="border-gray-800 bg-gray-950 text-xs text-gray-50">
        {content}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)
