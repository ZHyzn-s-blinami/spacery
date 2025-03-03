package prod.last.mainbackend.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import prod.last.mainbackend.models.UserRole;
import prod.last.mainbackend.models.UserModel;
import prod.last.mainbackend.repositories.UserRepository;

import java.util.Base64;
import java.util.List;
import java.util.UUID;


@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.domain}")
    private String domain;

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

    public List<UserModel> getAllUsers() {
        log.info("Getting all users");
        return userRepository.findAll();
    }

    public void sendVerificationEmail(UUID id) {
        UserModel user = userRepository.findById(id).orElse(null);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        UUID tokenUUID = UUID.randomUUID();
        user.setTokenUUID(tokenUUID);
        String token = Base64.getEncoder().encodeToString((user.getId().toString() + ":" + tokenUUID.toString()).getBytes());
        userRepository.save(user);

        String verificationLink = "http://" + domain + "/api/user/confirm?token=" + token;
        emailService.sendSimpleMessage(user.getEmail(), "Email Verification", "Please verify your email by clicking the link: " + verificationLink);
    }

    public void confirmUser(String token) {
        String decodedToken = new String(Base64.getDecoder().decode(token));
        String[] parts = decodedToken.split(":");
        UUID userId = UUID.fromString(parts[0]);
        UUID tokenUUID = UUID.fromString(parts[1]);

        UserModel user = userRepository.findById(userId).orElse(null);
        if (user == null || !user.getTokenUUID().equals(tokenUUID)) {
            throw new IllegalArgumentException("Invalid token");
        }

        user.setVerified(true);
        userRepository.save(user);
    }

    public void editUser(UUID id, String name, String description, String email, String password) {
        UserModel user = userRepository.findById(id).orElse(null);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        if (name != null) {
            user.setName(name);
        }

        if (description != null) {
            user.setDescription(description);
        }

        if (email != null) {
            user.setEmail(email);
        }

        if (password != null) {
            user.setPassword(passwordEncoder.encode(password));
        }

        userRepository.save(user);
    }

    public void blockUser(UUID id) {
        UserModel user = userRepository.findById(id).orElse(null);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        user.setActive(false);
        userRepository.save(user);
    }

    public void unblockUser(UUID id) {
        UserModel user = userRepository.findById(id).orElse(null);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        user.setActive(true);
        userRepository.save(user);
    }

    public void deleteUser(UUID id) {
        UserModel user = userRepository.findById(id).orElse(null);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        userRepository.delete(user);
    }
}
