package com.realestate.service;

import com.realestate.dto.response.PropertyResponse;
import java.util.List;

public interface FavoriteService {
    void addFavorite(Long propertyId);
    void removeFavorite(Long propertyId);
    List<PropertyResponse> getFavorites();
    Boolean isFavorite(Long propertyId);
}
