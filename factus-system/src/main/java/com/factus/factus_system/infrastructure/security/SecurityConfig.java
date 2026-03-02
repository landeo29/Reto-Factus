package com.factus.factus_system.infrastructure.security;
import org.springframework.http.HttpMethod;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/erp/auth/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        .requestMatchers("/api/erp/usuarios/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/erp/clientes/**").hasAnyRole("ADMIN", "VENDEDOR", "CONTADOR")
                        .requestMatchers("/api/erp/clientes/**").hasAnyRole("ADMIN", "VENDEDOR")

                        .requestMatchers(HttpMethod.GET, "/api/erp/proveedores/**").hasAnyRole("ADMIN", "CONTADOR", "ALMACENERO")
                        .requestMatchers("/api/erp/proveedores/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/erp/categorias/**").hasAnyRole("ADMIN", "VENDEDOR", "ALMACENERO")
                        .requestMatchers("/api/erp/categorias/**").hasAnyRole("ADMIN", "ALMACENERO")

                        .requestMatchers(HttpMethod.GET, "/api/erp/productos/**").hasAnyRole("ADMIN", "VENDEDOR", "ALMACENERO")
                        .requestMatchers("/api/erp/productos/**").hasAnyRole("ADMIN", "ALMACENERO")

                        .requestMatchers(HttpMethod.GET, "/api/erp/ventas/**").hasAnyRole("ADMIN", "VENDEDOR", "CONTADOR")
                        .requestMatchers("/api/erp/ventas/**").hasAnyRole("ADMIN", "VENDEDOR")

                        .requestMatchers(HttpMethod.GET, "/api/erp/compras/**").hasAnyRole("ADMIN", "CONTADOR", "ALMACENERO")
                        .requestMatchers("/api/erp/compras/**").hasAnyRole("ADMIN", "ALMACENERO")

                        .requestMatchers("/api/erp/cuentas-cobrar/**").hasAnyRole("ADMIN", "CONTADOR")
                        .requestMatchers("/api/erp/cuentas-pagar/**").hasAnyRole("ADMIN", "CONTADOR")

                        .requestMatchers("/api/erp/reportes/**").hasAnyRole("ADMIN", "VENDEDOR", "CONTADOR", "ALMACENERO")

                        .requestMatchers("/api/invoices/**").hasAnyRole("ADMIN", "VENDEDOR", "CONTADOR")

                        .requestMatchers("/api/erp/**").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}