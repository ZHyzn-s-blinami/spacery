package prod.last.mainbackend.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import prod.last.mainbackend.models.UserRole;
import prod.last.mainbackend.models.UserModel;
import prod.last.mainbackend.repositories.UserRepository;

import java.util.UUID;


@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserModel createUser(String email, String password, String name, UserRole role) {
        log.info("Creating user with email: {}", email);

        if (userRepository.findByEmail(email) != null) {
            log.error("User with email {} already exists", email);
            throw new IllegalArgumentException("User with email " + email + " already exists");
        }

        return userRepository.save(new UserModel(email, passwordEncoder.encode(password), name, role));
    }

    public UserModel getUserByEmail(String email) {
        log.info("Getting user by email: {}", email);
        return userRepository.findByEmail(email);
    }

    public UserModel getUserById(UUID id) {
        log.info("Getting user by id: {}", id);
        return userRepository.findById(id).orElse(null);
    }
}
