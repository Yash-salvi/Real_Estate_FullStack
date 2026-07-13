package com.realestate.dto.response;

public class JwtResponse {
    private String token;
    private UserResponse user;

    public JwtResponse() {
    }

    public JwtResponse(String token, UserResponse user) {
        this.token = token;
        this.user = user;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }
}
