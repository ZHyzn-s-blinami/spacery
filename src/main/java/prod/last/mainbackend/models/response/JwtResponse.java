package prod.last.mainbackend.models.response;

import lombok.Data;

@Data
public class JwtResponse {

    private String token;

    public JwtResponse(String jwt) {
        this.token = jwt;
    }
}
