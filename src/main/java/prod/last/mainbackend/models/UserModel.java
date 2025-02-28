package prod.last.mainbackend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "users")
public class UserModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private LocalDateTime createdAt;

    private UserRole role;

    @Column(name = "token_uuid")
    @JsonIgnore
    private UUID tokenUUID;

    public UserModel() {
    }

    public UserModel(String email, String password, UserRole role) {
        this.createdAt = LocalDateTime.now();
        this.email = email;
        this.password = password;
        this.role = role;
    }
}
