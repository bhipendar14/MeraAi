"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, AlertCircle, HelpCircle } from "lucide-react"

interface CancellationPolicyModalProps {
    isOpen: boolean
    onClose: () => void
    canCancel: boolean
    hoursUntilDeparture?: number
}

export function CancellationPolicyModal({
    isOpen,
    onClose,
    canCancel,
    hoursUntilDeparture
}: CancellationPolicyModalProps) {
    const [showDetails, setShowDetails] = useState(false)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-red-600 dark:text-red-400">
                            Cannot Cancel Booking
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!showDetails ? (
                        <>
                            <p className="text-muted-foreground">
                                You cannot cancel your booking due to our 48-hour cancellation policy.
                            </p>

                            {hoursUntilDeparture !== undefined && (
                                <div className="bg-muted/30 p-3 rounded-lg">
                                    <p className="text-sm">
                                        <span className="font-semibold">Time until departure:</span>{" "}
                                        {Math.floor(hoursUntilDeparture)} hours
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Cancellations require at least 48 hours notice
                                    </p>
                                </div>
                            )}

                            <Button
                                onClick={() => setShowDetails(true)}
                                variant="outline"
                                className="w-full gap-2"
                            >
                                <HelpCircle className="w-4 h-4" />
                                Why can't I cancel?
                            </Button>

                            <Button onClick={onClose} className="w-full">
                                I Understand
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="space-y-3">
                                <h3 className="font-semibold">48-Hour Cancellation Policy</h3>

                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>
                                        <strong className="text-foreground">Why this policy exists:</strong>
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>Allows us to offer your seat to other travelers</li>
                                        <li>Helps service providers manage capacity</li>
                                        <li>Reduces last-minute cancellations</li>
                                        <li>Keeps prices fair for all customers</li>
                                    </ul>

                                    <p className="mt-3">
                                        <strong className="text-foreground">What you can do:</strong>
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>Contact customer support for special circumstances</li>
                                        <li>Check if your booking is transferable</li>
                                        <li>Review our full terms and conditions</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setShowDetails(false)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button onClick={onClose} className="flex-1">
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
