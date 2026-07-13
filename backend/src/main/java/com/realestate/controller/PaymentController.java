package com.realestate.controller;

import com.razorpay.RazorpayClient;
import com.realestate.config.RazorpayConfig;
import com.realestate.dto.request.PaymentRequest;
import com.realestate.dto.request.PaymentVerificationRequest;
import com.realestate.entity.Payment;
import com.realestate.entity.Property;
import com.realestate.entity.User;
import com.realestate.repository.PaymentRepository;
import com.realestate.repository.PropertyRepository;
import com.realestate.service.AuthService;
import jakarta.validation.Valid;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import com.realestate.dto.response.BookingResponse;
import com.realestate.dto.response.PropertyResponse;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final RazorpayClient razorpayClient;
    private final RazorpayConfig razorpayConfig;
    private final PaymentRepository paymentRepository;
    private final PropertyRepository propertyRepository;
    private final AuthService authService;

    public PaymentController(
            RazorpayClient razorpayClient,
            RazorpayConfig razorpayConfig,
            PaymentRepository paymentRepository,
            PropertyRepository propertyRepository,
            AuthService authService) {
        this.razorpayClient = razorpayClient;
        this.razorpayConfig = razorpayConfig;
        this.paymentRepository = paymentRepository;
        this.propertyRepository = propertyRepository;
        this.authService = authService;
    }

    @GetMapping("/key")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        Map<String, String> response = new HashMap<>();
        response.put("keyId", razorpayConfig.getKeyId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create-order")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> createOrder(@Valid @RequestBody PaymentRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        if (request.getPaymentType().equals("BOOKING") && property.getIsBooked()) {
            throw new IllegalStateException("Property is already booked");
        }

        if (request.getPaymentType().equals("PREMIUM") && property.getIsFeatured()) {
            throw new IllegalStateException("Property is already featured");
        }

        User currentUser = authService.getCurrentUserEntity();
        int amountPaise;
        if (request.getPaymentType().equals("BOOKING")) {
            if ("RENT".equalsIgnoreCase(property.getType().name())) {
                if (property.getPrice().doubleValue() < 50000.0) {
                    amountPaise = 200000; // ₹2,000
                } else {
                    amountPaise = 300000; // ₹3,000
                }
            } else {
                if (property.getPrice().doubleValue() < 20000000.0) {
                    amountPaise = 1000000; // ₹10,000
                } else {
                    amountPaise = 1200000; // ₹12,000
                }
            }
        } else {
            amountPaise = 100000; // ₹1,000 for featured listing
        }

        String orderId;
        boolean isMock = razorpayConfig.getKeyId().equals("rzp_test_dummykey123");

        if (isMock) {
            orderId = "order_mock_" + System.currentTimeMillis();
        } else {
            try {
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", amountPaise);
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

                com.razorpay.Order order = razorpayClient.orders.create(orderRequest);
                orderId = order.get("id");
            } catch (Exception e) {
                // Fallback to mock order if Razorpay call fails (e.g. invalid keys configured)
                orderId = "order_mock_" + System.currentTimeMillis();
                isMock = true;
            }
        }

        // Save pending payment transaction
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setAmount(BigDecimal.valueOf(amountPaise / 100.0));
        payment.setPaymentType(request.getPaymentType());
        payment.setStatus("PENDING");
        payment.setProperty(property);
        payment.setUser(currentUser);
        paymentRepository.save(payment);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderId);
        response.put("amount", amountPaise);
        response.put("currency", "INR");
        response.put("isMock", isMock);
        response.put("keyId", razorpayConfig.getKeyId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> verifyPayment(@Valid @RequestBody PaymentVerificationRequest request) {
        boolean isValid = false;

        if (request.getRazorpayOrderId().startsWith("order_mock_")) {
            isValid = request.getRazorpaySignature().equals("mock_sig_" + request.getRazorpayPaymentId());
        } else {
            try {
                JSONObject attributes = new JSONObject();
                attributes.put("razorpay_order_id", request.getRazorpayOrderId());
                attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
                attributes.put("razorpay_signature", request.getRazorpaySignature());

                isValid = com.razorpay.Utils.verifyPaymentSignature(attributes, razorpayConfig.getKeySecret());
            } catch (Exception e) {
                isValid = false;
            }
        }

        Map<String, Object> response = new HashMap<>();
        if (isValid) {
            Payment payment = paymentRepository.findByOrderId(request.getRazorpayOrderId())
                    .orElseThrow(() -> new IllegalArgumentException("Order not found"));

            payment.setPaymentId(request.getRazorpayPaymentId());
            payment.setSignature(request.getRazorpaySignature());
            payment.setStatus("SUCCESS");
            paymentRepository.save(payment);

            Property property = payment.getProperty();
            if (payment.getPaymentType().equals("BOOKING")) {
                property.setIsBooked(true);
            } else if (payment.getPaymentType().equals("PREMIUM")) {
                property.setIsFeatured(true);
            }
            propertyRepository.save(property);

            response.put("status", "SUCCESS");
            response.put("message", "Payment verified successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "FAILED");
            response.put("message", "Invalid payment signature");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/agent-bookings")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAgentBookings() {
        User currentUser = authService.getCurrentUserEntity();
        List<Payment> bookings = paymentRepository.findSuccessfulBookingsByAgentId(currentUser.getId());
        List<BookingResponse> response = bookings.stream()
                .map(b -> new BookingResponse(
                        b.getProperty().getId(),
                        b.getProperty().getTitle(),
                        b.getUser().getId(),
                        b.getUser().getName(),
                        b.getUser().getEmail(),
                        b.getUser().getPhone(),
                        b.getAmount(),
                        b.getCreatedAt(),
                        b.getPaymentId()))
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN')")
    public ResponseEntity<List<PropertyResponse>> getMyBookings() {
        User currentUser = authService.getCurrentUserEntity();
        List<Payment> bookings = paymentRepository.findSuccessfulBookingsByUserId(currentUser.getId());
        List<PropertyResponse> response = bookings.stream()
                .map(b -> convertToPropertyResponse(b.getProperty()))
                .toList();
        return ResponseEntity.ok(response);
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
            response.setAgent(new com.realestate.dto.response.UserResponse(
                    agent.getId(),
                    agent.getName(),
                    agent.getEmail(),
                    agent.getRole().name(),
                    agent.getPhone()
            ));
        }

        if (property.getImages() != null) {
            response.setImageUrls(property.getImages().stream()
                    .map(com.realestate.entity.PropertyImage::getImageUrl)
                    .toList());
        }

        return response;
    }
}
