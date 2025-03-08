package prod.last.mainbackend.models.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import prod.last.mainbackend.models.UserRole;

@Data
public class RegisterRequest {

    @NotNull
    private UserRole role;

    @NotBlank
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String name;

}
