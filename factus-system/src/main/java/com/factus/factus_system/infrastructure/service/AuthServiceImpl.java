package com.factus.factus_system.infrastructure.service;

import com.factus.factus_system.core.entity.TokenResponse;
import com.factus.factus_system.core.interfaces.IAuthService;
import com.factus.factus_system.infrastructure.config.FactusProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final WebClient webClient;
    private final FactusProperties properties;

    // Guardamos el token en memoria para reutilizarlo
    private String currentAccessToken;
    private String currentRefreshToken;

    @Override
    public TokenResponse authenticate() {
        log.info("Autenticando con Factus API...");

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "password");
        formData.add("client_id", properties.getClientId());
        formData.add("client_secret", properties.getClientSecret());
        formData.add("username", properties.getUsername());
        formData.add("password", properties.getPassword());

        Map<String, Object> response = webClient.post()
                .uri(properties.getTokenUrl())
                .body(BodyInserters.fromFormData(formData))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        TokenResponse token = mapToTokenResponse(response);
        this.currentAccessToken = token.getAccessToken();
        this.currentRefreshToken = token.getRefreshToken();

        log.info("Token obtenido exitosamente");
        return token;
    }

    @Override
    public TokenResponse refreshToken(String refreshToken) {
        log.info("Refrescando token...");

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "refresh_token");
        formData.add("client_id", properties.getClientId());
        formData.add("client_secret", properties.getClientSecret());
        formData.add("refresh_token", refreshToken);

        Map<String, Object> response = webClient.post()
                .uri(properties.getTokenUrl())
                .body(BodyInserters.fromFormData(formData))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        TokenResponse token = mapToTokenResponse(response);
        this.currentAccessToken = token.getAccessToken();
        this.currentRefreshToken = token.getRefreshToken();

        log.info("Token refrescado exitosamente");
        return token;
    }

    public String getAccessToken() {
        if (currentAccessToken == null) {
            authenticate();
        }
        return currentAccessToken;
    }

    private TokenResponse mapToTokenResponse(Map<String, Object> response) {
        TokenResponse token = new TokenResponse();
        token.setAccessToken((String) response.get("access_token"));
        token.setRefreshToken((String) response.get("refresh_token"));
        token.setExpiresIn((Integer) response.get("expires_in"));
        token.setTokenType((String) response.get("token_type"));
        return token;
    }
}