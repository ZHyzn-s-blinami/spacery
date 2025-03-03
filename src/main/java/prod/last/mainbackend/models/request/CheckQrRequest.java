package prod.last.mainbackend.models.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckQrRequest {
    @NotBlank
    private String qrCode;
}
