package com.realestate.service;

import com.realestate.dto.request.PropertyRequest;
import com.realestate.dto.response.PropertyResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;

public interface PropertyService {
    PropertyResponse createProperty(PropertyRequest request);
    PropertyResponse updateProperty(Long id, PropertyRequest request);
    void deleteProperty(Long id);
    PropertyResponse getProperty(Long id);
    Page<PropertyResponse> getFilteredProperties(
            String city,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer bhk,
            String type,
            Integer minArea,
            Integer maxArea,
            String status,
            Pageable pageable
    );
    Page<PropertyResponse> getAgentProperties(Pageable pageable);
    PropertyResponse uploadPropertyImage(Long id, MultipartFile file);
}
