package com.stayease.service;

import com.stayease.dto.auth.RegisterRequest;
import com.stayease.dto.auth.UserDto;
import com.stayease.entity.TenantProfile;
import com.stayease.entity.User;
import com.stayease.entity.enums.Role;
import com.stayease.entity.enums.UserStatus;
import com.stayease.exception.BadRequestException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.repository.TenantProfileRepository;
import com.stayease.repository.UserRepository;
import com.stayease.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TenantProfileRepository tenantProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       TenantProfileRepository tenantProfileRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tenantProfileRepository = tenantProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers(Role role) {
        List<User> users = (role != null) ? userRepository.findByRole(role) : userRepository.findAll();
        return users.stream().map(UserDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto createUser(RegisterRequest req, UserPrincipal creator) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new BadRequestException("Username '" + req.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email '" + req.getEmail() + "' is already registered");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setFullName(req.getFullName());
        user.setPhone(req.getPhone());
        user.setRole(req.getRole() != null ? req.getRole() : Role.MANAGER);
        user.setStatus(UserStatus.ACTIVE);

        User saved = userRepository.save(user);

        if (saved.getRole() == Role.TENANT) {
            TenantProfile profile = new TenantProfile(saved);
            tenantProfileRepository.save(profile);
        }

        return UserDto.fromEntity(saved);
    }

    @Transactional
    public UserDto toggleUserStatus(Long id, UserPrincipal principal) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (user.getId().equals(principal.getId())) {
            throw new BadRequestException("You cannot deactivate your own account.");
        }

        user.setStatus(user.getStatus() == UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE);
        User saved = userRepository.save(user);
        return UserDto.fromEntity(saved);
    }
}
