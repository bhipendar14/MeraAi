"use client"

import { useState } from "react"
import { Send, CheckCircle, Mail, Phone, User, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

export default function ContactPage() {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        queryType: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        try {
            const authToken = localStorage.getItem('auth_token')
            if (!authToken) {
                setError('Please log in to send a message')
                setIsSubmitting(false)
                return
            }

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                setShowSuccess(true)
                setTimeout(() => {
                    setShowSuccess(false)
                    // Reset form
                    setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: '',
                        queryType: '',
                        message: ''
                    })
                }, 3000)
            } else {
                setError(data.error || 'Failed to send message')
            }
        } catch (error) {
            setError('Failed to send message. Please try again later.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Success message
    if (showSuccess) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center py-12">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                        <p className="text-muted-foreground">
                            Thank you for contacting us. We'll get back to you soon.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Mail className="h-6 w-6" />
                        Contact Us
                    </CardTitle>
                    <p className="text-muted-foreground">
                        Have a question or feedback? We'd love to hear from you.
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="contact-name">Full Name *</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="contact-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your name"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="contact-email">Email *</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="contact-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter your email"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="contact-phone">Phone (Optional)</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="contact-phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Enter your phone number"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Query Type (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="contact-query-type">Query Type (Optional)</Label>
                            <select
                                id="contact-query-type"
                                value={formData.queryType}
                                onChange={(e) => setFormData({ ...formData, queryType: e.target.value })}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="">Select a category</option>
                                <option value="General Inquiry">General Inquiry</option>
                                <option value="Technical Support">Technical Support</option>
                                <option value="Booking Issue">Booking Issue</option>
                                <option value="Payment Issue">Payment Issue</option>
                                <option value="Feature Request">Feature Request</option>
                                <option value="Bug Report">Bug Report</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <Label htmlFor="contact-message">Message *</Label>
                            <div className="relative">
                                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Textarea
                                    id="contact-message"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Tell us how we can help you..."
                                    className="pl-10 min-h-32 resize-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full"
                            size="lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Message
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
