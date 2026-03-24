package com.hireflow.service;

import com.hireflow.dto.AuthResponse;
import com.hireflow.dto.LoginRequest;
import com.hireflow.dto.RegisterRequest;
import com.hireflow.model.Organization;
import com.hireflow.model.Role;
import com.hireflow.model.User;
import com.hireflow.repository.OrganizationRepository;
import com.hireflow.repository.UserRepository;
import com.hireflow.security.CustomUserDetails;
import com.hireflow.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        Organization org = Organization.builder()
                .name(request.getOrganizationName())
                .build();
        org = organizationRepository.save(org);

        User user = User.builder()
                .organization(org)
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .build();
        user = userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .name(user.getName())
                .role(user.getRole().name())
                .orgId(org.getId())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .name(user.getName())
                .role(user.getRole().name())
                .orgId(user.getOrganization().getId())
                .build();
    }
}
