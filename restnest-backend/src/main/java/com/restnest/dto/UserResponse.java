package com.restnest.dto;

import com.restnest.entity.Role;

public record UserResponse(Long id, String fullName, String email, String phone, Role role) {}
