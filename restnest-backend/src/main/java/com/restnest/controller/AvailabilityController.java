package com.restnest.controller;

import com.restnest.dto.AvailabilityResponse;
import com.restnest.service.BookingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/** Public: guest booking page la already booked slots kaattarthuku. Guest details expose aagaadhu. */
@RestController
@RequestMapping("/api/properties")
public class AvailabilityController {

    private final BookingService service;

    public AvailabilityController(BookingService service) {
        this.service = service;
    }

    @GetMapping("/{id}/availability")
    public AvailabilityResponse availability(@PathVariable Long id,
                                             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.availability(id, date);
    }
}
