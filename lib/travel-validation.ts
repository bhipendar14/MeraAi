// Travel-specific validation utilities

export interface DateValidationResult {
    isValid: boolean
    error?: string
}

export interface BookingModificationEligibility {
    canModify: boolean
    reason?: string
    hoursUntilDeparture?: number
}

/**
 * Validates that a date is not in the past
 */
export function validateFutureDate(dateString: string): DateValidationResult {
    const selectedDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
        return {
            isValid: false,
            error: 'Cannot select a past date'
        }
    }

    return { isValid: true }
}

/**
 * Validates that check-out date is after check-in date
 */
export function validateDateRange(checkIn: string, checkOut: string): DateValidationResult {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (checkOutDate <= checkInDate) {
        return {
            isValid: false,
            error: 'Check-out date must be after check-in date'
        }
    }

    return { isValid: true }
}

/**
 * Validates advance booking limits
 * Trains/Buses: 2 months in advance
 * Flights/Hotels: 1 year in advance
 */
export function validateAdvanceBooking(
    dateString: string,
    bookingType: 'train' | 'bus' | 'flight' | 'hotel'
): DateValidationResult {
    const selectedDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const daysInAdvance = (selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)

    // Train and Bus: 2 months (60 days) advance booking
    if (bookingType === 'train' || bookingType === 'bus') {
        if (daysInAdvance > 60) {
            return {
                isValid: false,
                error: 'Trains and buses can only be booked up to 2 months in advance'
            }
        }
    }

    // Flight and Hotel: 1 year (365 days) advance booking
    if (bookingType === 'flight' || bookingType === 'hotel') {
        if (daysInAdvance > 365) {
            return {
                isValid: false,
                error: 'Flights and hotels can only be booked up to 1 year in advance'
            }
        }
    }

    return { isValid: true }
}

/**
 * Checks if a booking can be modified (48-hour policy)
 */
export function canModifyBooking(departureDate: string): BookingModificationEligibility {
    const departure = new Date(departureDate)
    const now = new Date()
    const hoursUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilDeparture < 0) {
        return {
            canModify: false,
            reason: 'Cannot modify past bookings',
            hoursUntilDeparture
        }
    }

    if (hoursUntilDeparture < 48) {
        return {
            canModify: false,
            reason: 'Cannot modify bookings within 48 hours of departure',
            hoursUntilDeparture
        }
    }

    return {
        canModify: true,
        hoursUntilDeparture
    }
}

/**
 * Calculates refund amount based on cancellation time
 */
export function calculateRefund(
    totalPrice: number,
    departureDate: string
): { refundAmount: number; refundPercentage: number; reason: string } {
    const departure = new Date(departureDate)
    const now = new Date()
    const hoursUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Full refund if cancelled more than 7 days before
    if (hoursUntilDeparture > 168) {
        return {
            refundAmount: totalPrice,
            refundPercentage: 100,
            reason: 'Full refund (cancelled more than 7 days before departure)'
        }
    }

    // 50% refund if cancelled 48-168 hours before
    if (hoursUntilDeparture >= 48) {
        return {
            refundAmount: totalPrice * 0.5,
            refundPercentage: 50,
            reason: '50% refund (cancelled 2-7 days before departure)'
        }
    }

    // No refund if cancelled within 48 hours
    return {
        refundAmount: 0,
        refundPercentage: 0,
        reason: 'No refund (cancelled within 48 hours of departure)'
    }
}

/**
 * Validates passenger count
 */
export function validatePassengerCount(count: number): DateValidationResult {
    if (count < 1) {
        return {
            isValid: false,
            error: 'At least 1 passenger is required'
        }
    }

    if (count > 9) {
        return {
            isValid: false,
            error: 'Maximum 9 passengers allowed per booking'
        }
    }

    return { isValid: true }
}

/**
 * Validates guest count for hotels
 */
export function validateGuestCount(count: number): DateValidationResult {
    if (count < 1) {
        return {
            isValid: false,
            error: 'At least 1 guest is required'
        }
    }

    if (count > 10) {
        return {
            isValid: false,
            error: 'Maximum 10 guests allowed per room'
        }
    }

    return { isValid: true }
}

/**
 * Formats date for display
 */
export function formatTravelDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

/**
 * Calculates duration between two dates in nights
 */
export function calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
