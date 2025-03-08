package prod.last.mainbackend.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import prod.last.mainbackend.models.UserModel;
import prod.last.mainbackend.repositories.UserRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final UserRepository userRepository;

    @Transactional
    public void updateTokenUUID(UserModel user) {
        user.setTokenUUID(UUID.randomUUID());
        userRepository.save(user);
    }

    public boolean isTokenValid(UserModel user, UUID tokenUUID) {
        return user.getTokenUUID().equals(tokenUUID);
    }
}
