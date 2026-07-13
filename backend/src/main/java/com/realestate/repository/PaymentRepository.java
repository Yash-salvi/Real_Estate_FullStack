package com.realestate.repository;

import com.realestate.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(String orderId);

    @Query("SELECT p FROM Payment p JOIN p.property prop WHERE prop.agent.id = :agentId AND p.paymentType = 'BOOKING' AND p.status = 'SUCCESS' ORDER BY p.createdAt DESC")
    List<Payment> findSuccessfulBookingsByAgentId(@Param("agentId") Long agentId);

    @Query("SELECT p FROM Payment p JOIN p.property prop WHERE p.user.id = :userId AND p.paymentType = 'BOOKING' AND p.status = 'SUCCESS' ORDER BY p.createdAt DESC")
    List<Payment> findSuccessfulBookingsByUserId(@Param("userId") Long userId);
}
