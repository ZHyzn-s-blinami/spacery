package prod.last.mainbackend.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import prod.last.mainbackend.models.UserModel;
import prod.last.mainbackend.repositories.UserRepository;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserModel createUser(String login, String email, String password) {
        log.info("Creating user with email: {}", email);
        return userRepository.save(new UserModel(login, email, passwordEncoder.encode(password)));
    }

    public UserModel getUserByEmail(String email) {
        log.info("Getting user by email: {}", email);
        return userRepository.findByEmail(email);
    }
}
