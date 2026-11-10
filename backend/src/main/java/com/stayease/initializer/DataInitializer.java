package com.stayease.initializer;

import com.stayease.entity.User;
import com.stayease.entity.enums.Role;
import com.stayease.entity.enums.UserStatus;
import com.stayease.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already contains users, skipping superadmin initialization.");
            return;
        }

        String email = requiredEnvironmentVariable("ADMIN_EMAIL");
        String password = requiredEnvironmentVariable("ADMIN_PASSWORD");

        User superadmin = new User(
                null,
                "superadmin",
                email,
                passwordEncoder.encode(password),
                "Super Admin",
                null,
                Role.SUPER_ADMIN,
                UserStatus.ACTIVE
        );
        userRepository.save(superadmin);
        log.info("Created initial superadmin account.");
    }

    private String requiredEnvironmentVariable(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    "Required environment variable " + name
                            + " is not set. Set it before starting the application to initialize the superadmin account."
            );
        }
        return value;
    }
}
