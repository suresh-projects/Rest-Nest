package com.restnest.dto;

import com.restnest.entity.Role;

public record AuthResponse(String token, Long id, String fullName, String email, Role role) {}
