package prod.last.mainbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import prod.last.mainbackend.models.UserModel;

import java.util.UUID;

public interface UserRepository extends JpaRepository<UserModel, UUID> {
    UserModel findByEmail(String email);
}
