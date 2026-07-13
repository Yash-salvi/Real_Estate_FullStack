package com.realestate.service.impl;

import com.realestate.dto.request.EnquiryRequest;
import com.realestate.dto.response.EnquiryResponse;
import com.realestate.dto.response.UserResponse;
import com.realestate.entity.*;
import com.realestate.exception.ResourceNotFoundException;
import com.realestate.repository.EnquiryRepository;
import com.realestate.repository.PropertyRepository;
import com.realestate.service.AuthService;
import com.realestate.service.EnquiryService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EnquiryServiceImpl implements EnquiryService {

    private final EnquiryRepository enquiryRepository;
    private final PropertyRepository propertyRepository;
    private final AuthService authService;

    public EnquiryServiceImpl(
            EnquiryRepository enquiryRepository,
            PropertyRepository propertyRepository,
            AuthService authService
    ) {
        this.enquiryRepository = enquiryRepository;
        this.propertyRepository = propertyRepository;
        this.authService = authService;
    }

    @Override
    public EnquiryResponse createEnquiry(EnquiryRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        if (currentUser.getRole() != Role.BUYER && currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only Buyers can submit property enquiries");
        }

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));

        Enquiry enquiry = new Enquiry();
        enquiry.setMessage(request.getMessage());
        enquiry.setStatus(EnquiryStatus.PENDING);
        enquiry.setBuyer(currentUser);
        enquiry.setProperty(property);

        Enquiry savedEnquiry = enquiryRepository.save(enquiry);
        return convertToEnquiryResponse(savedEnquiry);
    }

    @Override
    public EnquiryResponse respondToEnquiry(Long id, String status) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found with ID: " + id));

        User currentUser = authService.getCurrentUserEntity();
        
        // Only property's listing agent or admin can resolve/respond
        if (currentUser.getRole() != Role.ADMIN && (enquiry.getProperty().getAgent() == null || !enquiry.getProperty().getAgent().getId().equals(currentUser.getId()))) {
            throw new AccessDeniedException("You do not have permission to manage this enquiry");
        }

        try {
            enquiry.setStatus(EnquiryStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Enquiry Status. Supported statuses are PENDING, RESPONDED");
        }

        Enquiry updatedEnquiry = enquiryRepository.save(enquiry);
        return convertToEnquiryResponse(updatedEnquiry);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnquiryResponse> getBuyerEnquiries() {
        User currentUser = authService.getCurrentUserEntity();
        List<Enquiry> enquiries = enquiryRepository.findByBuyerOrderByCreatedAtDesc(currentUser);
        return enquiries.stream().map(this::convertToEnquiryResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnquiryResponse> getAgentEnquiries() {
        User currentUser = authService.getCurrentUserEntity();
        List<Enquiry> enquiries = enquiryRepository.findByPropertyAgentOrderByCreatedAtDesc(currentUser);
        return enquiries.stream().map(this::convertToEnquiryResponse).collect(Collectors.toList());
    }

    private EnquiryResponse convertToEnquiryResponse(Enquiry enquiry) {
        EnquiryResponse response = new EnquiryResponse();
        response.setId(enquiry.getId());
        response.setMessage(enquiry.getMessage());
        response.setStatus(enquiry.getStatus().name());
        response.setCreatedAt(enquiry.getCreatedAt());

        User buyer = enquiry.getBuyer();
        if (buyer != null) {
            response.setBuyer(new UserResponse(
                    buyer.getId(),
                    buyer.getName(),
                    buyer.getEmail(),
                    buyer.getRole().name(),
                    buyer.getPhone()
            ));
        }

        Property property = enquiry.getProperty();
        if (property != null) {
            response.setPropertyId(property.getId());
            response.setPropertyTitle(property.getTitle());
        }

        return response;
    }
}
