package prod.last.mainbackend.models.request;

import lombok.Data;

@Data
public class RegisterRequest {

    private String login;

    private String email;

    private String password;

}
