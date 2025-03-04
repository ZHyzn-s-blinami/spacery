package prod.last.mainbackend.e2e;

import io.restassured.http.ContentType;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@Tag("e2e")
@Tag("local")
public class PlaceE2ETests extends LocalTestBase {

    @Test
    void testGetAllPlaces() {
        Map<String, String> userSignup = new HashMap<>();
        userSignup.put("email", "place_user@example.com");
        userSignup.put("password", "password123");
        userSignup.put("name", "Place User");
        userSignup.put("role", "ROLE_USER");

        String token = given()
                .contentType(ContentType.JSON)
                .body(userSignup)
                .when()
                .post("/api/user/sign-up")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("token");

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get("/api/place/all")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("$", isA(List.class));
    }

    @Test
    void testCreatePlace() {
        Map<String, String> adminSignup = new HashMap<>();
        adminSignup.put("email", "place_admin@example.com");
        adminSignup.put("password", "admin123");
        adminSignup.put("name", "Place Admin");
        adminSignup.put("role", "ROLE_ADMIN");

        String adminToken = given()
                .contentType(ContentType.JSON)
                .body(adminSignup)
                .when()
                .post("/api/user/sign-up")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("token");

        Map<String, Object> placeData = new HashMap<>();
        placeData.put("type", "MEETING");
        placeData.put("capacity", 10);
        placeData.put("description", "Тестовое место");
        placeData.put("placeId", 101L);
        placeData.put("name", "test-place-1");

        given()
                .header("Authorization", "Bearer " + adminToken)
                .contentType(ContentType.JSON)
                .body(placeData)
                .when()
                .post("/api/place/create")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("name", equalTo("test-place-1"))
                .body("type", equalTo("MEETING"))
                .body("capacity", equalTo(10));
    }

    @Test
    void testGetPlaceByName() {
        Map<String, String> adminSignup = new HashMap<>();
        adminSignup.put("email", "place_get_admin@example.com");
        adminSignup.put("password", "admin123");
        adminSignup.put("name", "Place Get Admin");
        adminSignup.put("role", "ROLE_ADMIN");

        String adminToken = given()
                .contentType(ContentType.JSON)
                .body(adminSignup)
                .when()
                .post("/api/user/sign-up")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("token");

        Map<String, Object> placeData = new HashMap<>();
        placeData.put("type", "PERSONAL");
        placeData.put("capacity", 1);
        placeData.put("description", "Тестовое место для поиска");
        placeData.put("placeId", 102L);
        placeData.put("name", "test-place-get");

        given()
                .header("Authorization", "Bearer " + adminToken)
                .contentType(ContentType.JSON)
                .body(placeData)
                .when()
                .post("/api/place/create")
                .then()
                .statusCode(HttpStatus.OK.value());

        given()
                .header("Authorization", "Bearer " + adminToken)
                .when()
                .get("/api/place/test-place-get")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("name", equalTo("test-place-get"))
                .body("type", equalTo("PERSONAL"))
                .body("capacity", equalTo(1));
    }

    @Test
    void testCreateMultiplePlaces() {
        Map<String, String> adminSignup = new HashMap<>();
        adminSignup.put("email", "place_multi_admin@example.com");
        adminSignup.put("password", "admin123");
        adminSignup.put("name", "Place Multi Admin");
        adminSignup.put("role", "ROLE_ADMIN");

        String adminToken = given()
                .contentType(ContentType.JSON)
                .body(adminSignup)
                .when()
                .post("/api/user/sign-up")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("token");

        List<Map<String, Object>> placesToCreate = new ArrayList<>();

        Map<String, Object> place1 = new HashMap<>();
        place1.put("type", "MEETING");
        place1.put("capacity", 8);
        place1.put("description", "Первое тестовое место");
        place1.put("placeId", 103L);
        place1.put("name", "test-place-multi-1");
        placesToCreate.add(place1);

        Map<String, Object> place2 = new HashMap<>();
        place2.put("type", "PERSONAL");
        place2.put("capacity", 2);
        place2.put("description", "Второе тестовое место");
        place2.put("placeId", 104L);
        place2.put("name", "test-place-multi-2");
        placesToCreate.add(place2);

        given()
                .header("Authorization", "Bearer " + adminToken)
                .contentType(ContentType.JSON)
                .body(placesToCreate)
                .when()
                .post("/api/place/create-multiple")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("size()", equalTo(2))
                .body("find{it.name=='test-place-multi-1'}.capacity", equalTo(8))
                .body("find{it.name=='test-place-multi-2'}.capacity", equalTo(2));
    }

    @Test
    void testGetBookingTimeByPlaceName() {
        Map<String, String> adminSignup = new HashMap<>();
        adminSignup.put("email", "place_time_admin@example.com");
        adminSignup.put("password", "admin123");
        adminSignup.put("name", "Place Time Admin");
        adminSignup.put("role", "ROLE_ADMIN");

        String adminToken = given()
                .contentType(ContentType.JSON)
                .body(adminSignup)
                .when()
                .post("/api/user/sign-up")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("token");

        Map<String, String> userSignup = new HashMap<>();
        userSignup.put("email", "place_time_user@example.com");
        userSignup.put("password", "password123");
        userSignup.put("name", "Place Time User");
        userSignup.put("role", "ROLE_USER");

        String userToken = given()
                .contentType(ContentType.JSON)
                .body(userSignup)
                .when()
                .post("/api/user/sign-up")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("token");

        Map<String, Object> placeData = new HashMap<>();
        placeData.put("type", "MEETING");
        placeData.put("capacity", 6);
        placeData.put("description", "Место для проверки времени");
        placeData.put("placeId", 107L);
        placeData.put("name", "test-place-time");

        given()
                .header("Authorization", "Bearer " + adminToken)
                .contentType(ContentType.JSON)
                .body(placeData)
                .when()
                .post("/api/place/create")
                .then()
                .statusCode(HttpStatus.OK.value());

        LocalDateTime startAt = LocalDateTime.now().plusHours(3);
        LocalDateTime endAt = LocalDateTime.now().plusHours(4);

        Map<String, Object> bookingRequest = new HashMap<>();
        bookingRequest.put("name", "test-place-time");
        bookingRequest.put("startAt", startAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        bookingRequest.put("endAt", endAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        given()
                .header("Authorization", "Bearer " + userToken)
                .contentType(ContentType.JSON)
                .body(bookingRequest)
                .when()
                .post("/api/booking/create")
                .then()
                .statusCode(HttpStatus.CREATED.value());

        given()
                .header("Authorization", "Bearer " + userToken)
                .when()
                .get("/api/place/booking-time/test-place-time")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("$", isA(List.class))
                .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testNonAdminCannotCreatePlace() {
        Map<String, String> userSignup = new HashMap<>();
        userSignup.put("email", "regular_user@example.com");
        userSignup.put("password", "password123");
        userSignup.put("name", "Regular User");
        userSignup.put("role", "ROLE_USER");

        String userToken = given()
                .contentType(ContentType.JSON)
                .body(userSignup)
                .when()
                .post("/api/user/sign-up")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("token");

        Map<String, Object> placeData = new HashMap<>();
        placeData.put("type", "MEETING");
        placeData.put("capacity", 10);
        placeData.put("description", "Попытка создания обычным пользователем");
        placeData.put("placeId", 108L);
        placeData.put("name", "unauthorized-place");

        given()
                .header("Authorization", "Bearer " + userToken)
                .contentType(ContentType.JSON)
                .body(placeData)
                .when()
                .post("/api/place/create")
                .then()
                .statusCode(not(HttpStatus.OK.value()));
    }
}