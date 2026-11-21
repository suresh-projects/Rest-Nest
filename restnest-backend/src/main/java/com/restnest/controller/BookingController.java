package com.restnest.controller;

import com.restnest.dto.BookingRequest;
import com.restnest.dto.BookingResponse;
import com.restnest.dto.ReasonRequest;
import com.restnest.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** GUEST role mattum. */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@Valid @RequestBody BookingRequest req, Authentication auth) {
        return service.create(auth.getName(), req);
    }

    @GetMapping
    public List<BookingResponse> mine(Authentication auth) {
        return service.listForGuest(auth.getName());
    }

    @GetMapping("/{id}")
    public BookingResponse getOne(@PathVariable Long id, Authentication auth) {
        return service.getForGuest(id, auth.getName());
    }

    @PostMapping("/{id}/cancel")
    public BookingResponse cancel(@PathVariable Long id,
                                  @Valid @RequestBody(required = false) ReasonRequest body,
                                  Authentication auth) {
        return service.cancelByGuest(id, auth.getName(), body == null ? null : body.reason());
    }
}
