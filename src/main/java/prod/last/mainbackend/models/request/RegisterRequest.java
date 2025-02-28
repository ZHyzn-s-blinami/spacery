package prod.last.mainbackend.models.request;

import lombok.Data;
import prod.last.mainbackend.models.UserRole;

@Data
public class RegisterRequest {

    private UserRole role;

    private String email;

    private String password;

}
