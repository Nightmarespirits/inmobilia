import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8"
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2 
      className={cn(
        "animate-spin text-muted-foreground",
        sizeClasses[size],
        className
      )} 
    />
  )
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Spinner size="lg" />
    </div>
  )
}

export function ButtonSpinner() {
  return <Spinner size="sm" className="mr-2" />
}