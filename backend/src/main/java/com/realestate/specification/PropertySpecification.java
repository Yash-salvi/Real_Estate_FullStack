package com.realestate.specification;

import com.realestate.entity.Property;
import com.realestate.entity.PropertyStatus;
import com.realestate.entity.PropertyType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class PropertySpecification {

    public static Specification<Property> filterProperties(
            String city,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer bhk,
            String type,
            Integer minArea,
            Integer maxArea,
            String status
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(city)) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("city")),
                        "%" + city.toLowerCase() + "%"
                ));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (bhk != null) {
                predicates.add(criteriaBuilder.equal(root.get("bhk"), bhk));
            }

            if (StringUtils.hasText(type)) {
                try {
                    PropertyType pType = PropertyType.valueOf(type.toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("type"), pType));
                } catch (IllegalArgumentException e) {
                    // Ignore invalid type
                }
            }

            if (minArea != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("areaSqft"), minArea));
            }

            if (maxArea != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("areaSqft"), maxArea));
            }

            if (StringUtils.hasText(status)) {
                try {
                    PropertyStatus pStatus = PropertyStatus.valueOf(status.toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("status"), pStatus));
                } catch (IllegalArgumentException e) {
                    // Ignore invalid status
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
