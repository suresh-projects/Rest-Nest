package com.restnest.dto;

import com.restnest.entity.Purpose;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingRequest(
        @NotNull Long propertyId,
        @NotNull @FutureOrPresent LocalDate date,
        @NotNull LocalTime startTime,
        @NotNull @Min(1) @Max(6) Integer hours,
        @NotNull @Min(1) @Max(20) Integer guests,
        @NotNull Purpose purpose,
        @Size(max = 500) String note,
        @NotNull(message = "House rules accept pannanum") Boolean rulesAccepted
) {}
