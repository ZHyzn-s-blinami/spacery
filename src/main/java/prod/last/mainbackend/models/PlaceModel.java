package prod.last.mainbackend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "palce")
public class PlaceModel {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    private Long placeId;

    @Enumerated(EnumType.STRING)
    private PlaceType type;

    @NotNull
    private Integer capacity;

    @NotBlank
    private String description;

    @NotNull
    @Column(name = "place_row")
    private Integer row;

    @NotNull
    @Column(name = "place_column")
    private Integer column;

    @NotNull
    private LocalDateTime createdAt;

    public PlaceModel() {}

    public PlaceModel(Integer capacity, String description, PlaceType type, Integer row, Integer column, Long placeId) {
        this.createdAt = LocalDateTime.now();
        this.capacity = capacity;
        this.description = description;
        this.type = type;
        this.row = row;
        this.column = column;
        this.placeId = placeId;
    }
}
