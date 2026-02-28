package com.factus.factus_system.infrastructure.exception;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponseDTO<Object>> handleValidation(
            MethodArgumentNotValidException ex) {

        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return ResponseEntity.badRequest()
                .body(ApiResponseDTO.error("Errores de validación: " + errors));
    }

    @ExceptionHandler(WebClientResponseException.class)
    public ResponseEntity<ApiResponseDTO<Object>> handleFactusError(
            WebClientResponseException ex) {

        log.error("Error de Factus API: {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());

        return ResponseEntity.status(ex.getStatusCode())
                .body(ApiResponseDTO.error("Error de Factus: " + ex.getResponseBodyAsString()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseDTO<Object>> handleGeneral(Exception ex) {

        log.error("Error inesperado: ", ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDTO.error("Error interno: " + ex.getMessage()));
    }
}