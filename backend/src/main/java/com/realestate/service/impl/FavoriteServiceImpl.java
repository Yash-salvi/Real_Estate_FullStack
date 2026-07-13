package com.realestate.service.impl;

import com.realestate.dto.response.PropertyResponse;
import com.realestate.dto.response.UserResponse;
import com.realestate.entity.*;
import com.realestate.exception.ResourceNotFoundException;
import com.realestate.repository.FavoriteRepository;
import com.realestate.repository.PropertyRepository;
import com.realestate.service.AuthService;
import com.realestate.service.FavoriteService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final PropertyRepository propertyRepository;
    private final AuthService authService;

    public FavoriteServiceImpl(
            FavoriteRepository favoriteRepository,
            PropertyRepository propertyRepository,
            AuthService authService
    ) {
        this.favoriteRepository = favoriteRepository;
        this.propertyRepository = propertyRepository;
        this.authService = authService;
    }

    @Override
    public void addFavorite(Long propertyId) {
        User currentUser = authService.getCurrentUserEntity();
        if (currentUser.getRole() != Role.BUYER && currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only Buyers can bookmark properties");
        }

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + propertyId));

        if (favoriteRepository.existsByUserAndProperty(currentUser, property)) {
            return; // Already added
        }

        Favorite favorite = new Favorite(currentUser, property);
        favoriteRepository.save(favorite);
    }

    @Override
    public void removeFavorite(Long propertyId) {
        User currentUser = authService.getCurrentUserEntity();
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + propertyId));

        Favorite favorite = favoriteRepository.findByUserAndProperty(currentUser, property)
                .orElseThrow(() -> new ResourceNotFoundException("Favorite listing not found"));

        favoriteRepository.delete(favorite);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyResponse> getFavorites() {
        User currentUser = authService.getCurrentUserEntity();
        List<Favorite> favorites = favoriteRepository.findByUser(currentUser);
        return favorites.stream()
                .map(favorite -> convertToPropertyResponse(favorite.getProperty()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Boolean isFavorite(Long propertyId) {
        User currentUser = authService.getCurrentUserEntity();
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + propertyId));
        return favoriteRepository.existsByUserAndProperty(currentUser, property);
    }

    private PropertyResponse convertToPropertyResponse(Property property) {
        PropertyResponse response = new PropertyResponse();
        response.setId(property.getId());
        response.setTitle(property.getTitle());
        response.setDescription(property.getDescription());
        response.setPrice(property.getPrice());
        response.setType(property.getType().name());
        response.setBhk(property.getBhk());
        response.setAreaSqft(property.getAreaSqft());
        response.setCity(property.getCity());
        response.setAddress(property.getAddress());
        response.setLatitude(property.getLatitude());
        response.setLongitude(property.getLongitude());
        response.setStatus(property.getStatus().name());
        response.setCreatedAt(property.getCreatedAt());

        User agent = property.getAgent();
        if (agent != null) {
            response.setAgent(new UserResponse(
                    agent.getId(),
                    agent.getName(),
                    agent.getEmail(),
                    agent.getRole().name(),
                    agent.getPhone()
            ));
        }

        List<String> imageUrls = property.getImages().stream()
                .map(PropertyImage::getImageUrl)
                .collect(Collectors.toList());
        response.setImageUrls(imageUrls);

        return response;
    }
}
