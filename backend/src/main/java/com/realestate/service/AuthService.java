package com.realestate.service;

import com.realestate.dto.request.LoginRequest;
import com.realestate.dto.request.RegisterRequest;
import com.realestate.dto.response.JwtResponse;
import com.realestate.dto.response.UserResponse;
import com.realestate.entity.User;

public interface AuthService {
    UserResponse register(RegisterRequest registerRequest);
    JwtResponse login(LoginRequest loginRequest);
    User getCurrentUserEntity();
    UserResponse getCurrentUserResponse();
}
