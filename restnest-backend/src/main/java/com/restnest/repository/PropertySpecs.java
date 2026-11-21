package com.restnest.repository;

import com.restnest.entity.Amenity;
import com.restnest.entity.HouseRule;
import com.restnest.entity.Property;
import com.restnest.entity.TransitHub;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public final class PropertySpecs {

    private PropertySpecs() {}

    public static Specification<Property> search(String q, String area, TransitHub hub,
                                                 BigDecimal minPrice, BigDecimal maxPrice, Integer guests,
                                                 Set<Amenity> amenities, Set<HouseRule> rules) {
        return (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            ps.add(cb.isTrue(root.get("active")));

            if (q != null && !q.isBlank()) {
                String like = "%" + q.trim().toLowerCase() + "%";
                ps.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("area")), like),
                        cb.like(cb.lower(root.get("description")), like)));
            }
            if (area != null && !area.isBlank()) {
                ps.add(cb.like(cb.lower(root.get("area")), "%" + area.trim().toLowerCase() + "%"));
            }
            if (hub != null && hub != TransitHub.NONE) {
                ps.add(cb.equal(root.get("nearestHub"), hub));
            }
            if (minPrice != null) {
                ps.add(cb.greaterThanOrEqualTo(root.<BigDecimal>get("pricePerHour"), minPrice));
            }
            if (maxPrice != null) {
                ps.add(cb.lessThanOrEqualTo(root.<BigDecimal>get("pricePerHour"), maxPrice));
            }
            if (guests != null) {
                ps.add(cb.greaterThanOrEqualTo(root.<Integer>get("maxGuests"), guests));
            }
            if (amenities != null) {
                for (Amenity a : amenities) {
                    Join<Property, Amenity> j = root.join("amenities");
                    ps.add(cb.equal(j, a));
                }
            }
            if (rules != null) {
                for (HouseRule r : rules) {
                    Join<Property, HouseRule> j = root.join("houseRules");
                    ps.add(cb.equal(j, r));
                }
            }
            return cb.and(ps.toArray(new Predicate[0]));
        };
    }
}
