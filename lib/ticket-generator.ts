import { Booking } from './models/booking'

export function generateTicketImage(booking: Booking): Promise<string> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!

        // Get passenger list (handle both old and new formats)
        const passengers = booking.passengersList ||
            (booking.passengerDetails ? [booking.passengerDetails] : [])
        const passengerCount = passengers.length || booking.passengers

        // Calculate dynamic canvas height based on passenger count
        const baseHeight = 1000
        const extraHeightPerPassenger = passengers.length > 1 ? (passengers.length - 1) * 30 : 0
        canvas.height = baseHeight + extraHeightPerPassenger

        // Ticket dimensions
        canvas.width = 800

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, '#1a1a2e')
        gradient.addColorStop(1, '#16213e')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Header section
        ctx.fillStyle = '#4ecca3'
        ctx.fillRect(0, 0, canvas.width, 120)

        // MeraAi Logo/Stamp
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 42px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('MeraAi', canvas.width / 2, 60)
        ctx.font = '16px Arial'
        ctx.fillText('Your Travel Partner', canvas.width / 2, 90)

        // Booking ID Section
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 24px Arial'
        ctx.fillText(`Booking ID: ${booking.bookingId}`, canvas.width / 2, 160)

        // Ticket Type Badge
        const type = booking.type.toUpperCase()
        ctx.fillStyle = getTypeColor(booking.type)
        ctx.fillRect(300, 180, 200, 40)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 20px Arial'
        ctx.fillText(type, canvas.width / 2, 207)

        // Content area
        let yPos = 260
        ctx.textAlign = 'left'
        ctx.font = '18px Arial'

        // Passenger Details
        ctx.fillStyle = '#4ecca3'
        ctx.font = 'bold 22px Arial'
        ctx.fillText(`PASSENGER DETAILS (${passengerCount})`, 50, yPos)
        yPos += 35

        ctx.fillStyle = '#ffffff'
        ctx.font = '18px Arial'

        if (passengers.length > 0) {
            // List all passengers
            passengers.forEach((passenger, index) => {
                ctx.fillText(`${index + 1}. ${passenger.name} (${passenger.age} years)`, 50, yPos)
                yPos += 28
            })

            yPos += 10

            // Show primary contact (first passenger)
            ctx.fillStyle = '#a0a0a0'
            ctx.font = '16px Arial'
            ctx.fillText('Primary Contact:', 50, yPos)
            yPos += 25

            ctx.fillStyle = '#ffffff'
            ctx.font = '18px Arial'
            if (passengers[0].email) {
                ctx.fillText(`Email: ${passengers[0].email}`, 50, yPos)
                yPos += 28
            }
            if (passengers[0].phone) {
                ctx.fillText(`Phone: ${passengers[0].phone}`, 50, yPos)
                yPos += 28
            }
        } else {
            // Fallback for old bookings without passenger details
            ctx.fillText(`Passengers: ${booking.passengers}`, 50, yPos)
            yPos += 30
        }

        yPos += 20

        // Journey Details
        ctx.fillStyle = '#4ecca3'
        ctx.font = 'bold 22px Arial'
        ctx.fillText('JOURNEY DETAILS', 50, yPos)
        yPos += 35

        ctx.fillStyle = '#ffffff'
        ctx.font = '18px Arial'
        ctx.fillText(`From: ${booking.from}`, 50, yPos)
        yPos += 30
        ctx.fillText(`To: ${booking.to}`, 50, yPos)
        yPos += 30
        ctx.fillText(`Date: ${new Date(booking.departureDate).toLocaleDateString()}`, 50, yPos)
        yPos += 30
        ctx.fillText(`Passengers: ${booking.passengers}`, 50, yPos)
        yPos += 50

        // Operator/Service Details
        if (booking.bookingDetails) {
            ctx.fillStyle = '#4ecca3'
            ctx.font = 'bold 22px Arial'
            ctx.fillText('SERVICE DETAILS', 50, yPos)
            yPos += 35

            ctx.fillStyle = '#ffffff'
            ctx.font = '18px Arial'

            if (booking.type === 'flight' && booking.bookingDetails.airline) {
                ctx.fillText(`Airline: ${booking.bookingDetails.airline}`, 50, yPos)
                yPos += 30
                if (booking.bookingDetails.flightNumber) {
                    ctx.fillText(`Flight: ${booking.bookingDetails.flightNumber}`, 50, yPos)
                    yPos += 30
                }
            } else if ((booking.type === 'train' || booking.type === 'bus') && booking.bookingDetails.operator) {
                ctx.fillText(`Operator: ${booking.bookingDetails.operator}`, 50, yPos)
                yPos += 30
            } else if (booking.type === 'hotel' && booking.bookingDetails.hotelName) {
                ctx.fillText(`Hotel: ${booking.bookingDetails.hotelName}`, 50, yPos)
                yPos += 30
                if (booking.bookingDetails.roomType) {
                    ctx.fillText(`Room: ${booking.bookingDetails.roomType}`, 50, yPos)
                    yPos += 30
                }
            }

            if (booking.bookingDetails.departureTime && booking.bookingDetails.arrivalTime) {
                ctx.fillText(`Time: ${booking.bookingDetails.departureTime} - ${booking.bookingDetails.arrivalTime}`, 50, yPos)
                yPos += 30
            }
        }

        yPos += 20

        // Price Section
        ctx.fillStyle = '#4ecca3'
        ctx.font = 'bold 22px Arial'
        ctx.fillText('PAYMENT', 50, yPos)
        yPos += 35

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 24px Arial'
        ctx.fillText(`Total: ₹${booking.totalPrice.toLocaleString()}`, 50, yPos)
        yPos += 40

        ctx.font = '14px Arial'
        ctx.fillStyle = '#a0a0a0'
        ctx.fillText(`Status: ${booking.status.toUpperCase()}`, 50, yPos)
        yPos += 50

        // Terms & Conditions
        ctx.fillStyle = '#4ecca3'
        ctx.font = 'bold 18px Arial'
        ctx.fillText('TERMS & CONDITIONS', 50, yPos)
        yPos += 30

        ctx.fillStyle = '#a0a0a0'
        ctx.font = '12px Arial'
        const terms = [
            '• Ticket is non-transferable and must be presented at check-in',
            '• Cancellation must be done at least 48 hours before departure',
            '• ID proof is mandatory for all passengers',
            '• Please arrive 30 minutes before departure time',
            '• This is a computer-generated ticket and does not require a signature'
        ]

        terms.forEach(term => {
            ctx.fillText(term, 50, yPos)
            yPos += 20
        })

        // Footer - MeraAi Stamp
        yPos = canvas.height - 80
        ctx.fillStyle = '#4ecca3'
        ctx.fillRect(0, yPos, canvas.width, 80)

        ctx.fillStyle = '#1a1a2e'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Verified by MeraAi', canvas.width / 2, yPos + 30)
        ctx.font = '14px Arial'
        ctx.fillText(`Booked on ${new Date(booking.createdAt).toLocaleDateString()}`, canvas.width / 2, yPos + 55)

        // Convert canvas to data URL
        resolve(canvas.toDataURL('image/png'))
    })
}

function getTypeColor(type: string): string {
    switch (type) {
        case 'flight': return '#3b82f6'
        case 'train': return '#8b5cf6'
        case 'bus': return '#f97316'
        case 'hotel': return '#ec4899'
        default: return '#6b7280'
    }
}

export function downloadTicket(booking: Booking) {
    generateTicketImage(booking).then(dataUrl => {
        const link = document.createElement('a')
        link.download = `ticket-${booking.bookingId}.png`
        link.href = dataUrl
        link.click()
    })
}
