package com.realestate.service;

import com.realestate.dto.request.EnquiryRequest;
import com.realestate.dto.response.EnquiryResponse;
import java.util.List;

public interface EnquiryService {
    EnquiryResponse createEnquiry(EnquiryRequest request);
    EnquiryResponse respondToEnquiry(Long id, String status);
    List<EnquiryResponse> getBuyerEnquiries();
    List<EnquiryResponse> getAgentEnquiries();
}
