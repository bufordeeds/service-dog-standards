"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/ui/status-badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { api } from "@/utils/api"
import { toast } from "@/hooks/use-toast"
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  ExternalLink
} from "lucide-react"
import { format, formatDistanceToNow, differenceInDays, differenceInMonths } from "date-fns"

interface AgreementCardProps {
  className?: string
}

export function AgreementCard({ className }: AgreementCardProps) {
  const [acceptDialogOpen, setAcceptDialogOpen] = React.useState(false)
  
  const { data: profile, refetch } = api.auth.getProfile.useQuery()
  const acceptAgreementMutation = api.auth.acceptAgreement.useMutation({
    onSuccess: () => {
      toast({
        title: "Agreement Accepted",
        description: "Your SDS Training & Behavior Standards agreement has been accepted.",
      })
      setAcceptDialogOpen(false)
      void refetch()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Find the current training standards agreement
  const currentAgreement = profile?.agreements?.find(
    (agreement) => agreement.type === "TRAINING_BEHAVIOR_STANDARDS" && agreement.isActive
  )

  const getAgreementStatus = () => {
    if (!currentAgreement) return "missing"
    
    const now = new Date()
    const expiresAt = currentAgreement.expiresAt ? new Date(currentAgreement.expiresAt) : null
    if (!expiresAt) return "missing"
    const daysUntilExpiration = differenceInDays(expiresAt, now)
    
    if (daysUntilExpiration < 0) return "expired"
    if (daysUntilExpiration <= 7) return "expiring-soon"
    if (daysUntilExpiration <= 30) return "expiring-month"
    if (daysUntilExpiration <= 180) return "expiring-half-year"
    return "active"
  }

  const getStatusInfo = () => {
    const status = getAgreementStatus()
    
    switch (status) {
      case "missing":
        return {
          variant: "destructive" as const,
          title: "Agreement Required",
          description: "You must accept the SDS Training & Behavior Standards to continue.",
          action: "Accept Agreement",
          urgent: true
        }
      case "expired":
        return {
          variant: "destructive" as const,
          title: "Agreement Expired",
          description: "Your agreement expired. Please renew to maintain access.",
          action: "Renew Agreement",
          urgent: true
        }
      case "expiring-soon":
        return {
          variant: "destructive" as const,
          title: "Expires This Week",
          description: "Your agreement expires in less than 7 days. Renew now.",
          action: "Renew Agreement",
          urgent: true
        }
      case "expiring-month":
        return {
          variant: "destructive" as const,
          title: "Expires This Month",
          description: "Your agreement expires in less than 30 days.",
          action: "Renew Agreement",
          urgent: false
        }
      case "expiring-half-year":
        return {
          variant: "approved" as const,
          title: "Expires in 6 Months",
          description: "Consider renewing your agreement soon.",
          action: "Renew Agreement",
          urgent: false
        }
      case "active":
        return {
          variant: "approved" as const,
          title: "Agreement Active",
          description: "Your SDS Training & Behavior Standards agreement is current.",
          action: "View Agreement",
          urgent: false
        }
      default:
        return {
          variant: "incomplete" as const,
          title: "Unknown Status",
          description: "Unable to determine agreement status.",
          action: "Check Status",
          urgent: false
        }
    }
  }

  const getTimeProgress = () => {
    if (!currentAgreement?.expiresAt) return 0
    
    const now = new Date()
    const acceptedAt = new Date(currentAgreement.acceptedAt)
    const expiresAt = new Date(currentAgreement.expiresAt)
    
    const totalDuration = differenceInDays(expiresAt, acceptedAt)
    const elapsed = differenceInDays(now, acceptedAt)
    
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)
  }

  const handleAcceptAgreement = async () => {
    try {
      await acceptAgreementMutation.mutateAsync({
        type: "TRAINING_BEHAVIOR_STANDARDS",
        version: "2024.1",
        content: {
          title: "SDS Training & Behavior Standards",
          version: "2024.1",
          acceptedAt: new Date().toISOString(),
          sections: [
            "Training Requirements",
            "Behavior Standards", 
            "Certification Process",
            "Ongoing Compliance"
          ]
        }
      })
    } catch (error) {
      console.error("Error accepting agreement:", error)
    }
  }

  const statusInfo = getStatusInfo()
  const timeProgress = getTimeProgress()

  return (
    <Card className={`sds-pod ${className || ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-sds-primary" />
            <CardTitle>SDS Training Standards</CardTitle>
          </div>
          <StatusBadge variant={statusInfo.variant} size="sm">
            {statusInfo.title}
          </StatusBadge>
        </div>
        <CardDescription>
          {statusInfo.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Agreement Details */}
        {currentAgreement && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Agreement Status</span>
              <span className="font-medium">
                {getAgreementStatus() === "active" ? "Active" : "Needs Attention"}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Accepted</span>
              <span className="font-medium">
                {format(new Date(currentAgreement.acceptedAt), "MMM d, yyyy")}
              </span>
            </div>
            
            {currentAgreement.expiresAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expires</span>
                <span className="font-medium">
                  {format(new Date(currentAgreement.expiresAt), "MMM d, yyyy")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Time Progress Bar */}
        {currentAgreement?.expiresAt && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time Remaining</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(currentAgreement.expiresAt))}
              </span>
            </div>
            <Progress value={100 - timeProgress} className="h-2" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {differenceInMonths(new Date(currentAgreement.expiresAt), new Date())} months remaining
              </span>
            </div>
          </div>
        )}

        {/* Expiration Warning */}
        {(getAgreementStatus() === "expiring-soon" || getAgreementStatus() === "expiring-month") && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Renewal Required</p>
              <p className="text-yellow-700">
                Your agreement expires {currentAgreement?.expiresAt ? formatDistanceToNow(new Date(currentAgreement.expiresAt)) : "soon"}. 
                Renew now to maintain uninterrupted access.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!currentAgreement || getAgreementStatus() === "expired" ? (
            <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="flex-1"
                  variant={statusInfo.urgent ? "default" : "outline"}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {statusInfo.action}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Accept SDS Training & Behavior Standards</DialogTitle>
                  <DialogDescription>
                    By accepting this agreement, you agree to follow the Service Dog Standards 
                    training and behavior requirements. This agreement is valid for 4 years.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Key Requirements:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Follow SDS training methodology</li>
                      <li>• Maintain behavior standards</li>
                      <li>• Complete certification requirements</li>
                      <li>• Participate in ongoing compliance</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => void handleAcceptAgreement()}
                      disabled={acceptAgreementMutation.isLoading}
                      className="flex-1"
                    >
                      {acceptAgreementMutation.isLoading ? "Accepting..." : "Accept Agreement"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setAcceptDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button variant="outline" className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Agreement
            </Button>
          )}
          
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}