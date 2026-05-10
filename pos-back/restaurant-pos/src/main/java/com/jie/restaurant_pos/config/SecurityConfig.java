package com.jie.restaurant_pos.config;

import com.jie.restaurant_pos.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private static final String[] STAFF_ROLES = {"ADMIN", "WAITER", "CASHIER"};
    private static final String[] ORDERING_ROLES = {"ADMIN", "WAITER", "CASHIER", "CUSTOMER"};
    private static final String[] KITCHEN_ROLES = {"ADMIN", "WAITER", "CASHIER", "KITCHEN"};

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/menuItem/**").authenticated()
                        .requestMatchers("/api/menuItem/**").hasAnyRole(STAFF_ROLES)
                        .requestMatchers(HttpMethod.GET, "/api/menuItemModifier/**").hasAnyRole(STAFF_ROLES)
                        .requestMatchers("/api/menuItemModifier/**").hasAnyRole(STAFF_ROLES)
                        .requestMatchers(HttpMethod.GET, "/api/table/*").hasAnyRole(ORDERING_ROLES)
                        .requestMatchers("/api/table/**").hasAnyRole(STAFF_ROLES)
                        .requestMatchers(HttpMethod.POST, "/api/order").hasAnyRole(ORDERING_ROLES)
                        .requestMatchers(HttpMethod.POST, "/api/order/tables/*/open").hasAnyRole(ORDERING_ROLES)
                        .requestMatchers(HttpMethod.POST, "/api/order/tables/*/close").hasAnyRole(STAFF_ROLES)
                        .requestMatchers("/api/order/**").hasAnyRole(STAFF_ROLES)
                        .requestMatchers(HttpMethod.GET, "/api/cart").hasAnyRole(KITCHEN_ROLES)
                        .requestMatchers(HttpMethod.GET, "/api/cart/notFinished").hasAnyRole(KITCHEN_ROLES)
                        .requestMatchers(HttpMethod.GET, "/api/cart/order/*/notFinished").hasAnyRole(KITCHEN_ROLES)
                        .requestMatchers(HttpMethod.PUT, "/api/cart/*/send").hasAnyRole(ORDERING_ROLES)
                        .requestMatchers(HttpMethod.PUT, "/api/cart/*/finish").hasAnyRole(KITCHEN_ROLES)
                        .requestMatchers(HttpMethod.PUT, "/api/cart/*/revert-finish").hasAnyRole(KITCHEN_ROLES)
                        .requestMatchers(HttpMethod.POST, "/api/cart/*/notes").hasAnyRole(STAFF_ROLES)
                        .requestMatchers(HttpMethod.PUT, "/api/cart/notes/*").hasAnyRole(STAFF_ROLES)
                        .requestMatchers(HttpMethod.DELETE, "/api/cart/notes/*").hasAnyRole(STAFF_ROLES)
                        .requestMatchers(HttpMethod.GET, "/api/cart/*/notes").hasAnyRole(STAFF_ROLES)
                        .requestMatchers(HttpMethod.GET, "/api/cart/order/**").hasAnyRole(ORDERING_ROLES)
                        .requestMatchers(HttpMethod.POST, "/api/cart").hasAnyRole(ORDERING_ROLES)
                        .requestMatchers(HttpMethod.PUT, "/api/cart/*").hasAnyRole(ORDERING_ROLES)
                        .requestMatchers(HttpMethod.DELETE, "/api/cart/*").hasAnyRole(ORDERING_ROLES)
                        .requestMatchers(HttpMethod.GET, "/api/cart/*").hasAnyRole(ORDERING_ROLES)
                        .requestMatchers("/api/customer/**").hasAnyRole(STAFF_ROLES)
                        .requestMatchers("/api/category/**").hasAnyRole(STAFF_ROLES)
                        .requestMatchers(HttpMethod.GET, "/api/user/customers").hasAnyRole(STAFF_ROLES)
                        .requestMatchers(HttpMethod.PUT, "/api/user/table-assignments/*").hasAnyRole(STAFF_ROLES)
                        .requestMatchers("/api/user/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
