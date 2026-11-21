package com.restnest.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record AvailabilityResponse(
        LocalDate date,
        LocalTime availableFrom,
        LocalTime availableTo,
        int minHours,
        List<BookedSlot> bookedSlots
) {
    public record BookedSlot(LocalTime startTime, LocalTime endTime) {}
}
