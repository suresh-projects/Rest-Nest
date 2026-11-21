package com.restnest.controller;

import com.restnest.dto.BookingResponse;
import com.restnest.dto.ReasonRequest;
import com.restnest.entity.BookingStatus;
import com.restnest.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** HOST role mattum (/api/host/** SecurityConfig la protect aagirukku). */
@RestController
@RequestMapping("/api/host/bookings")
public class HostBookingController {

    private final BookingService service;

    public HostBookingController(BookingService service) {
        this.service = service;
    }

    @GetMapping
    public List<BookingResponse> list(@RequestParam(required = false) BookingStatus status, Authentication auth) {
        return service.listForHost(auth.getName(), status);
    }

    @GetMapping("/{id}")
    public BookingResponse getOne(@PathVariable Long id, Authentication auth) {
        return service.getForHost(id, auth.getName());
    }

    @PostMapping("/{id}/confirm")
    public BookingResponse confirm(@PathVariable Long id, Authentication auth) {
        return service.confirm(id, auth.getName());
    }

    @PostMapping("/{id}/reject")
    public BookingResponse reject(@PathVariable Long id,
                                  @Valid @RequestBody(required = false) ReasonRequest body,
                                  Authentication auth) {
        return service.reject(id, auth.getName(), body == null ? null : body.reason());
    }

    @PostMapping("/{id}/cancel")
    public BookingResponse cancel(@PathVariable Long id,
                                  @Valid @RequestBody(required = false) ReasonRequest body,
                                  Authentication auth) {
        return service.cancelByHost(id, auth.getName(), body == null ? null : body.reason());
    }
}
