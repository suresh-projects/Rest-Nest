package com.restnest.controller;

import com.restnest.dto.PageResponse;
import com.restnest.dto.PropertyResponse;
import com.restnest.entity.Amenity;
import com.restnest.entity.HouseRule;
import com.restnest.entity.TransitHub;
import com.restnest.service.PropertyService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Set;

/** Public (login illaama) APIs. */
@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService service;

    public PropertyController(PropertyService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<PropertyResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) TransitHub hub,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) Set<Amenity> amenities,
            @RequestParam(required = false) Set<HouseRule> rules,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return service.search(q, area, hub, minPrice, maxPrice, guests, amenities, rules, sort, page, size);
    }

    @GetMapping("/{id}")
    public PropertyResponse getOne(@PathVariable Long id) {
        return service.getPublic(id);
    }
}
