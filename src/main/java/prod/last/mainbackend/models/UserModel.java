package prod.last.mainbackend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
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
    @Column(unique = true)
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String name;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String description;

    private Boolean verified;

    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(name = "token_uuid")
    @JsonIgnore
    private UUID tokenUUID;

    public UserModel() {
    }

    public UserModel(String email, String password, String name, UserRole role) {
        this.createdAt = LocalDateTime.now();
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = role;
        this.verified = false;
    }
}
