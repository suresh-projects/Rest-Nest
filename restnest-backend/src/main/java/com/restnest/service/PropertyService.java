package com.restnest.service;

import com.restnest.dto.PageResponse;
import com.restnest.dto.PhotoDto;
import com.restnest.dto.PropertyRequest;
import com.restnest.dto.PropertyResponse;
import com.restnest.entity.*;
import com.restnest.repository.PropertyRepository;
import com.restnest.repository.PropertySpecs;
import com.restnest.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

@Service
@Transactional(readOnly = true)
public class PropertyService {

    private static final int MAX_PHOTOS = 8;

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final FileStorageService storage;

    public PropertyService(PropertyRepository propertyRepository, UserRepository userRepository,
                           FileStorageService storage) {
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.storage = storage;
    }

    // ---------------- HOST ----------------

    @Transactional
    public PropertyResponse create(String hostEmail, PropertyRequest req) {
        User host = userRepository.findByEmail(hostEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Property p = new Property();
        p.setHost(host);
        apply(p, req);
        propertyRepository.save(p);
        return toResponse(p, true);
    }

    public List<PropertyResponse> listMine(String hostEmail) {
        return propertyRepository.findByHostEmailOrderByCreatedAtDesc(hostEmail)
                .stream().map(p -> toResponse(p, true)).toList();
    }

    public PropertyResponse getMine(Long id, String hostEmail) {
        return toResponse(findOwned(id, hostEmail), true);
    }

    @Transactional
    public PropertyResponse update(Long id, String hostEmail, PropertyRequest req) {
        Property p = findOwned(id, hostEmail);
        apply(p, req);
        return toResponse(p, true);
    }

    /** Delete = deactivate (bookings history safe aa irukka). */
    @Transactional
    public void deactivate(Long id, String hostEmail) {
        findOwned(id, hostEmail).setActive(false);
    }

    @Transactional
    public PropertyResponse addPhotos(Long id, String hostEmail, List<MultipartFile> files) {
        Property p = findOwned(id, hostEmail);
        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Minimum oru photo select pannunga");
        }
        if (p.getPhotos().size() + files.size() > MAX_PHOTOS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Oru property ku maximum " + MAX_PHOTOS + " photos mattum");
        }
        for (MultipartFile f : files) {
            String name = storage.store(f);
            p.getPhotos().add(new PropertyPhoto(p, name));
        }
        propertyRepository.saveAndFlush(p);
        return toResponse(p, true);
    }

    @Transactional
    public void deletePhoto(Long propertyId, Long photoId, String hostEmail) {
        Property p = findOwned(propertyId, hostEmail);
        PropertyPhoto photo = p.getPhotos().stream()
                .filter(ph -> ph.getId().equals(photoId)).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo kidaikala"));
        p.getPhotos().remove(photo);
        propertyRepository.flush();
        storage.delete(photo.getFileName());
    }

    // ---------------- PUBLIC ----------------

    public PropertyResponse getPublic(Long id) {
        Property p = propertyRepository.findById(id)
                .filter(Property::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property kidaikala"));
        return toResponse(p, false);
    }

    public PageResponse<PropertyResponse> search(String q, String area, TransitHub hub,
                                                 BigDecimal minPrice, BigDecimal maxPrice, Integer guests,
                                                 Set<Amenity> amenities, Set<HouseRule> rules,
                                                 String sort, int page, int size) {
        int safeSize = Math.min(Math.max(size, 1), 50);
        int safePage = Math.max(page, 0);

        Sort sortObj = switch (sort == null ? "" : sort) {
            case "price_asc" -> Sort.by("pricePerHour").ascending().and(Sort.by("id"));
            case "price_desc" -> Sort.by("pricePerHour").descending().and(Sort.by("id"));
            default -> Sort.by("createdAt").descending().and(Sort.by("id"));
        };

        Page<Property> result = propertyRepository.findAll(
                PropertySpecs.search(q, area, hub, minPrice, maxPrice, guests, amenities, rules),
                PageRequest.of(safePage, safeSize, sortObj));
        return PageResponse.from(result.map(p -> toResponse(p, false)));
    }

    // ---------------- helpers ----------------

    private Property findOwned(Long id, String hostEmail) {
        Property p = propertyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property kidaikala"));
        if (!p.getHost().getEmail().equalsIgnoreCase(hostEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Idhu unga property illa");
        }
        return p;
    }

    private void apply(Property p, PropertyRequest r) {
        LocalTime from = r.availableFrom() != null ? r.availableFrom() : LocalTime.of(6, 0);
        LocalTime to = r.availableTo() != null ? r.availableTo() : LocalTime.of(22, 0);
        if (!from.isBefore(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "availableFrom, availableTo ku munnadi irukkanum");
        }
        p.setTitle(r.title().trim());
        p.setDescription(r.description() == null ? null : r.description().trim());
        p.setArea(r.area().trim());
        p.setAddress(r.address().trim());
        p.setNearestHub(r.nearestHub() != null ? r.nearestHub() : TransitHub.NONE);
        p.setPricePerHour(r.pricePerHour());
        p.setMaxGuests(r.maxGuests());
        p.setMinHours(r.minHours() != null ? r.minHours() : 1);
        p.setAvailableFrom(from);
        p.setAvailableTo(to);

        p.getAmenities().clear();
        if (r.amenities() != null) p.getAmenities().addAll(r.amenities());
        p.getHouseRules().clear();
        if (r.houseRules() != null) p.getHouseRules().addAll(r.houseRules());

        if (r.active() != null) p.setActive(r.active());
    }

    private PropertyResponse toResponse(Property p, boolean owner) {
        List<PhotoDto> photos = p.getPhotos().stream()
                .map(ph -> new PhotoDto(ph.getId(), "/uploads/" + ph.getFileName()))
                .toList();
        return new PropertyResponse(
                p.getId(), p.getTitle(), p.getDescription(), p.getArea(),
                owner ? p.getAddress() : null,
                p.getNearestHub(), p.getPricePerHour(), p.getMaxGuests(), p.getMinHours(),
                p.getAvailableFrom(), p.getAvailableTo(),
                new TreeSet<>(p.getAmenities()), new TreeSet<>(p.getHouseRules()),
                photos, p.getHost().getId(), p.getHost().getFullName(),
                p.isActive(), p.getCreatedAt());
    }
}
