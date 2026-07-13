package com.realestate.controller;

import com.realestate.dto.response.PropertyResponse;
import com.realestate.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping("/{propertyId}")
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN')")
    public ResponseEntity<Void> addFavorite(@PathVariable Long propertyId) {
        favoriteService.addFavorite(propertyId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{propertyId}")
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN')")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long propertyId) {
        favoriteService.removeFavorite(propertyId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN')")
    public ResponseEntity<List<PropertyResponse>> getFavorites() {
        List<PropertyResponse> response = favoriteService.getFavorites();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{propertyId}/status")
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN')")
    public ResponseEntity<Boolean> isFavorite(@PathVariable Long propertyId) {
        Boolean response = favoriteService.isFavorite(propertyId);
        return ResponseEntity.ok(response);
    }
}
