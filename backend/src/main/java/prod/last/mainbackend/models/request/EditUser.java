package prod.last.mainbackend.models.request;

import lombok.Data;

@Data
public class EditUser {

    private String name;

    private String description;

    private String email;

    private String password;

}
