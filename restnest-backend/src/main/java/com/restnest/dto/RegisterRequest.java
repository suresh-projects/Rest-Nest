package com.restnest.dto;

import com.restnest.entity.Role;
import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "^[6-9]\\d{9}$", message = "Valid 10 digit Indian mobile number kudu") String phone,
        @NotBlank @Size(min = 8, message = "Password minimum 8 characters") String password,
        @NotNull Role role
) {}
