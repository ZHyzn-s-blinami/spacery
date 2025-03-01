package prod.last.mainbackend.models.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import prod.last.mainbackend.models.PlaceType;

@Data
public class PlaceCreate {

    @NotNull
    private PlaceType type;

    @NotNull
    private Integer capacity;

    @NotNull
    private String description;

    @NotNull
    private Long placeId;

    @NotBlank
    private String name;

}
