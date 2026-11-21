package com.restnest.controller;

import com.restnest.dto.PropertyRequest;
import com.restnest.dto.PropertyResponse;
import com.restnest.service.PropertyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/host/properties")
public class HostPropertyController {

    private final PropertyService service;

    public HostPropertyController(PropertyService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PropertyResponse create(@Valid @RequestBody PropertyRequest req, Authentication auth) {
        return service.create(auth.getName(), req);
    }

    @GetMapping
    public List<PropertyResponse> mine(Authentication auth) {
        return service.listMine(auth.getName());
    }

    @GetMapping("/{id}")
    public PropertyResponse getOne(@PathVariable Long id, Authentication auth) {
        return service.getMine(id, auth.getName());
    }

    @PutMapping("/{id}")
    public PropertyResponse update(@PathVariable Long id, @Valid @RequestBody PropertyRequest req,
                                   Authentication auth) {
        return service.update(id, auth.getName(), req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id, Authentication auth) {
        service.deactivate(id, auth.getName());
    }

    @PostMapping(value = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PropertyResponse uploadPhotos(@PathVariable Long id,
                                         @RequestParam("files") List<MultipartFile> files,
                                         Authentication auth) {
        return service.addPhotos(id, auth.getName(), files);
    }

    @DeleteMapping("/{id}/photos/{photoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePhoto(@PathVariable Long id, @PathVariable Long photoId, Authentication auth) {
        service.deletePhoto(id, photoId, auth.getName());
    }
}
