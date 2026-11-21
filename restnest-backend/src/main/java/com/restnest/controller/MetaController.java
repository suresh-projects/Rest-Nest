package com.restnest.controller;

import com.restnest.entity.Amenity;
import com.restnest.entity.HouseRule;
import com.restnest.entity.Purpose;
import com.restnest.entity.TransitHub;
import com.restnest.repository.PropertyRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

/** Angular dropdown / filter options ku. */
@RestController
public class MetaController {

    private final PropertyRepository propertyRepository;

    public MetaController(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @GetMapping("/api/meta")
    public Map<String, Object> meta() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("areas", propertyRepository.findDistinctAreas());
        m.put("hubs", Arrays.stream(TransitHub.values())
                .map(h -> Map.of("code", h.name(), "label", h.getLabel())).toList());
        m.put("amenities", Arrays.stream(Amenity.values())
                .map(a -> Map.of("code", a.name(), "label", a.getLabel())).toList());
        m.put("houseRules", Arrays.stream(HouseRule.values())
                .map(r -> Map.of("code", r.name(), "label", r.getLabel())).toList());
        m.put("purposes", Arrays.stream(Purpose.values())
                .map(p -> Map.of("code", p.name(), "label", p.getLabel())).toList());
        return m;
    }
}
