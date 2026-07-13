package com.realestate.repository;

import com.realestate.entity.Enquiry;
import com.realestate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {
    List<Enquiry> findByBuyerOrderByCreatedAtDesc(User buyer);
    List<Enquiry> findByPropertyAgentOrderByCreatedAtDesc(User agent);
}
