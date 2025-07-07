"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, ChevronRight } from "lucide-react"

export interface CompletionStep {
  id: string
  title: string
  description?: string
  completed: boolean
  optional?: boolean
  href?: string
  onClick?: () => void
}

export interface CompletionGaugeProps {
  steps: CompletionStep[]
  title?: string
  description?: string
  className?: string
  variant?: "circular" | "linear"
  size?: "sm" | "md" | "lg"
  showSteps?: boolean
  onStepClick?: (step: CompletionStep) => void
}

function CompletionGauge({
  steps,
  title,
  description,
  className,
  variant = "circular",
  size = "md",
  showSteps = true,
  onStepClick,
}: CompletionGaugeProps) {
  const completedSteps = steps.filter(step => step.completed)
  const totalSteps = steps.length
  const percentage = totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0
  const isComplete = percentage === 100

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          circle: "w-16 h-16",
          text: "text-xs",
          title: "text-sm",
          description: "text-xs",
        }
      case "lg":
        return {
          circle: "w-32 h-32",
          text: "text-lg",
          title: "text-xl",
          description: "text-sm",
        }
      default:
        return {
          circle: "w-24 h-24",
          text: "text-sm",
          title: "text-base",
          description: "text-sm",
        }
    }
  }

  const sizeClasses = getSizeClasses()

  const CircularGauge = () => {
    const radius = 45
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className={cn("relative flex items-center justify-center", sizeClasses.circle)}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted-foreground/20"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              "transition-all duration-500 ease-out",
              isComplete ? "text-green-600" : "text-primary"
            )}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn("font-bold", sizeClasses.text)}>
            {Math.round(percentage)}%
          </div>
          <div className={cn("text-muted-foreground", sizeClasses.text)}>
            {completedSteps.length}/{totalSteps}
          </div>
        </div>
      </div>
    )
  }

  const LinearGauge = () => (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className={cn("font-medium", sizeClasses.title)}>
          {completedSteps.length} of {totalSteps} completed
        </span>
        <span className={cn("text-muted-foreground", sizeClasses.text)}>
          {Math.round(percentage)}%
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {(title || description) && (
        <div className="text-center space-y-1">
          {title && (
            <h3 className={cn("font-semibold", sizeClasses.title)}>
              {title}
            </h3>
          )}
          {description && (
            <p className={cn("text-muted-foreground", sizeClasses.description)}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* Gauge */}
      <div className="flex justify-center">
        {variant === "circular" ? <CircularGauge /> : <LinearGauge />}
      </div>

      {/* Steps list */}
      {showSteps && (
        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                step.completed && "bg-green-50 border border-green-200",
                !step.completed && "bg-muted/30",
                (step.href || step.onClick || onStepClick) && "cursor-pointer hover:bg-muted/50"
              )}
              onClick={() => {
                if (step.onClick) step.onClick()
                else if (onStepClick) onStepClick(step)
              }}
            >
              {/* Status icon */}
              {step.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={cn(
                    "font-medium",
                    step.completed && "text-green-800",
                    !step.completed && "text-foreground"
                  )}>
                    {step.title}
                  </h4>
                  {step.optional && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      Optional
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className={cn(
                    "text-sm mt-1",
                    step.completed && "text-green-700",
                    !step.completed && "text-muted-foreground"
                  )}>
                    {step.description}
                  </p>
                )}
              </div>

              {/* Action arrow */}
              {(step.href || step.onClick || onStepClick) && !step.completed && (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Completion message */}
      {isComplete && (
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-medium">All steps completed!</p>
        </div>
      )}
    </div>
  )
}

export { CompletionGauge }