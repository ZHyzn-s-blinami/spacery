package prod.last.mainbackend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

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

    @NotBlank
    private String login;

    @Column(name = "token_uuid")
    @JsonIgnore
    private UUID tokenUUID;

    public UserModel() {
    }

    public UserModel(String login, String email, String password) {
        this.login = login;
        this.email = email;
        this.password = password;
    }
}
