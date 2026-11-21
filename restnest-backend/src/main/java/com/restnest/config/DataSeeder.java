package com.restnest.config;

import com.restnest.entity.Role;
import com.restnest.entity.User;
import com.restnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedAdmin(UserRepository repo, PasswordEncoder encoder,
                                @Value("${restnest.admin.email}") String email,
                                @Value("${restnest.admin.password}") String password) {
        return args -> {
            if (!repo.existsByEmail(email)) {
                User admin = new User();
                admin.setFullName("RestNest Admin");
                admin.setEmail(email);
                admin.setPhone("9000000000");
                admin.setPasswordHash(encoder.encode(password));
                admin.setRole(Role.ADMIN);
                repo.save(admin);
                System.out.println(">>> Default admin created: " + email);
            }
        };
    }
}
