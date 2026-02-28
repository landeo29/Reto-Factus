package com.factus.factus_system.core.interfaces;


import com.factus.factus_system.core.entity.TokenResponse;

public interface IAuthService {
    TokenResponse authenticate();
    TokenResponse refreshToken(String refreshToken);
}