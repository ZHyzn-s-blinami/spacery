package prod.last.mainbackend.models.request;

import lombok.Data;

@Data
public class LoginRequest {

    private String email;

    private String password;
}
