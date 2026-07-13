package com.realestate.service.impl;

import com.realestate.dto.request.PropertyRequest;
import com.realestate.dto.response.PropertyResponse;
import com.realestate.dto.response.UserResponse;
import com.realestate.entity.*;
import com.realestate.exception.ResourceNotFoundException;
import com.realestate.repository.PropertyRepository;
import com.realestate.service.AuthService;
import com.realestate.service.FileStorageService;
import com.realestate.service.PropertyService;
import com.realestate.specification.PropertySpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;
    private final FileStorageService fileStorageService;
    private final AuthService authService;

    public PropertyServiceImpl(
            PropertyRepository propertyRepository,
            FileStorageService fileStorageService,
            AuthService authService
    ) {
        this.propertyRepository = propertyRepository;
        this.fileStorageService = fileStorageService;
        this.authService = authService;
    }

    @Override
    public PropertyResponse createProperty(PropertyRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        if (currentUser.getRole() != Role.AGENT && currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only Agents or Admins can list new properties");
        }

        Property property = new Property();
        updatePropertyFields(property, request);
        property.setAgent(currentUser);

        Property savedProperty = propertyRepository.save(property);
        return convertToPropertyResponse(savedProperty);
    }

    @Override
    public PropertyResponse updateProperty(Long id, PropertyRequest request) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));

        User currentUser = authService.getCurrentUserEntity();
        verifyOwnershipOrAdmin(property, currentUser);

        updatePropertyFields(property, request);

        Property updatedProperty = propertyRepository.save(property);
        return convertToPropertyResponse(updatedProperty);
    }

    @Override
    public void deleteProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));

        User currentUser = authService.getCurrentUserEntity();
        verifyOwnershipOrAdmin(property, currentUser);

        propertyRepository.delete(property);
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyResponse getProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));
        return convertToPropertyResponse(property);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PropertyResponse> getFilteredProperties(
            String city,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer bhk,
            String type,
            Integer minArea,
            Integer maxArea,
            String status,
            Pageable pageable
    ) {
        Specification<Property> spec = PropertySpecification.filterProperties(
                city, minPrice, maxPrice, bhk, type, minArea, maxArea, status
        );
        Page<Property> properties = propertyRepository.findAll(spec, pageable);
        return properties.map(this::convertToPropertyResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PropertyResponse> getAgentProperties(Pageable pageable) {
        User currentUser = authService.getCurrentUserEntity();
        Page<Property> properties = propertyRepository.findByAgent(currentUser, pageable);
        return properties.map(this::convertToPropertyResponse);
    }

    @Override
    public PropertyResponse uploadPropertyImage(Long id, MultipartFile file) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));

        User currentUser = authService.getCurrentUserEntity();
        verifyOwnershipOrAdmin(property, currentUser);

        String imageUrl = fileStorageService.storeFile(file);
        
        PropertyImage image = new PropertyImage(imageUrl, property);
        property.addImage(image);

        Property savedProperty = propertyRepository.save(property);
        return convertToPropertyResponse(savedProperty);
    }

    private void updatePropertyFields(Property property, PropertyRequest request) {
        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setPrice(request.getPrice());
        
        try {
            property.setType(PropertyType.valueOf(request.getType().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Property Type. Supported types are RENT, SALE");
        }

        property.setBhk(request.getBhk());
        property.setAreaSqft(request.getAreaSqft());
        property.setCity(request.getCity());
        property.setAddress(request.getAddress());
        property.setLatitude(request.getLatitude());
        property.setLongitude(request.getLongitude());

        try {
            property.setStatus(PropertyStatus.valueOf(request.getStatus().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Property Status. Supported statuses are AVAILABLE, SOLD, RENTED");
        }
    }

    private void verifyOwnershipOrAdmin(Property property, User user) {
        if (user.getRole() != Role.ADMIN && (property.getAgent() == null || !property.getAgent().getId().equals(user.getId()))) {
            throw new AccessDeniedException("You do not have permission to manage this listing");
        }
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
        response.setIsBooked(property.getIsBooked());
        response.setIsFeatured(property.getIsFeatured());

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
