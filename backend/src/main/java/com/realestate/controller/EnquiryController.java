package com.realestate.controller;

import com.realestate.dto.request.EnquiryRequest;
import com.realestate.dto.response.EnquiryResponse;
import com.realestate.service.EnquiryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/enquiries")
public class EnquiryController {

    private final EnquiryService enquiryService;

    public EnquiryController(EnquiryService enquiryService) {
        this.enquiryService = enquiryService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN')")
    public ResponseEntity<EnquiryResponse> createEnquiry(@Valid @RequestBody EnquiryRequest request) {
        EnquiryResponse response = enquiryService.createEnquiry(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my-enquiries")
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN')")
    public ResponseEntity<List<EnquiryResponse>> getMyEnquiries() {
        List<EnquiryResponse> response = enquiryService.getBuyerEnquiries();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/agent-enquiries")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<List<EnquiryResponse>> getAgentEnquiries() {
        List<EnquiryResponse> response = enquiryService.getAgentEnquiries();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/respond")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<EnquiryResponse> respondToEnquiry(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        EnquiryResponse response = enquiryService.respondToEnquiry(id, status);
        return ResponseEntity.ok(response);
    }
}
