"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import "./calendar.css"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("custom-calendar", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-base font-semibold",
                nav: "space-x-1 flex items-center",
                nav_button: "h-8 w-8 bg-transparent p-0",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-10 font-semibold text-xs",
                row: "flex w-full mt-2",
                cell: "relative p-0 text-center text-sm",
                day: "h-10 w-10 p-0 font-medium rounded-md",
                day_selected: "bg-primary text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground",
                day_disabled: "text-muted-foreground opacity-50",
                day_hidden: "invisible",
                ...classNames,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }

interface DatePickerProps {
    id?: string
    value?: Date | string
    onChange?: (date: Date | undefined) => void
    minDate?: Date
    maxDate?: Date
    disabled?: boolean
    placeholder?: string
    className?: string
}

export function DatePicker({
    id,
    value,
    onChange,
    minDate,
    maxDate,
    disabled = false,
    placeholder = "Pick a date",
    className,
}: DatePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(
        value ? (typeof value === 'string' ? new Date(value) : value) : undefined
    )

    React.useEffect(() => {
        if (value) {
            setDate(typeof value === 'string' ? new Date(value) : value)
        }
    }, [value])

    const handleSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate)
        onChange?.(selectedDate)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    variant={"outline"}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-start text-left font-normal transition-all duration-200",
                        "hover:bg-accent/80 hover:border-primary/40",
                        !date && "text-muted-foreground",
                        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                    {date ? (
                        <span className="font-medium">{format(date, "PPP")}</span>
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    "w-auto p-0 shadow-2xl border-border/60",
                    "bg-card/95 backdrop-blur-sm"
                )}
                align="start"
            >
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    disabled={(day) => {
                        if (minDate && day < minDate) return true
                        if (maxDate && day > maxDate) return true
                        return false
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
