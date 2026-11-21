package com.restnest.dto;

import com.restnest.entity.Amenity;
import com.restnest.entity.HouseRule;
import com.restnest.entity.TransitHub;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

/** address is null in public responses (privacy); host sees it for own properties. */
public record PropertyResponse(
        Long id,
        String title,
        String description,
        String area,
        String address,
        TransitHub nearestHub,
        BigDecimal pricePerHour,
        int maxGuests,
        int minHours,
        LocalTime availableFrom,
        LocalTime availableTo,
        Set<Amenity> amenities,
        Set<HouseRule> houseRules,
        List<PhotoDto> photos,
        Long hostId,
        String hostName,
        boolean active,
        Instant createdAt
) {}
