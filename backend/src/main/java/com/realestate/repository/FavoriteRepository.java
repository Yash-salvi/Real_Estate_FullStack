package com.realestate.repository;

import com.realestate.entity.Favorite;
import com.realestate.entity.Property;
import com.realestate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUser(User user);
    Optional<Favorite> findByUserAndProperty(User user, Property property);
    Boolean existsByUserAndProperty(User user, Property property);
}
