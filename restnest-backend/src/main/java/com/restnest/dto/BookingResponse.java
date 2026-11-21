package com.restnest.dto;

import com.restnest.entity.BookingStatus;
import com.restnest.entity.Purpose;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Privacy: address and phone numbers CONFIRMED aana apram mattum share aagum.
 * (host ku own property address eppavum theriyum)
 */
public record BookingResponse(
        Long id,
        Long propertyId,
        String propertyTitle,
        String area,
        String address,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        int hours,
        int guests,
        Purpose purpose,
        String note,
        BookingStatus status,
        String statusReason,
        BigDecimal totalAmount,
        Long guestId,
        String guestName,
        String guestPhone,
        String hostName,
        String hostPhone,
        Instant createdAt
) {}
