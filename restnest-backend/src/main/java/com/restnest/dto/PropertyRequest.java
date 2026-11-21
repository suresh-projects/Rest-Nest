package com.restnest.dto;

import com.restnest.entity.Amenity;
import com.restnest.entity.HouseRule;
import com.restnest.entity.TransitHub;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.Set;

public record PropertyRequest(
        @NotBlank @Size(max = 150) String title,
        @Size(max = 2000) String description,
        @NotBlank @Size(max = 100) String area,
        @NotBlank @Size(max = 500) String address,
        TransitHub nearestHub,
        @NotNull @DecimalMin(value = "50", message = "Price minimum 50 per hour")
        @DecimalMax(value = "5000", message = "Price maximum 5000 per hour") BigDecimal pricePerHour,
        @NotNull @Min(1) @Max(20) Integer maxGuests,
        @Min(1) @Max(6) Integer minHours,
        LocalTime availableFrom,
        LocalTime availableTo,
        Set<Amenity> amenities,
        Set<HouseRule> houseRules,
        Boolean active
) {}
