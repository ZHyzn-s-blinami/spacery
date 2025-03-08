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
public class BookingE2ETests extends LocalTestBase {

    @Test
    void testCreateAndCancelBooking() {
        Map<String, String> userSignup = new HashMap<>();
        userSignup.put("email", "bookinguser@example.com");
        userSignup.put("password", "password123");
        userSignup.put("name", "Booking User");
        userSignup.put("role", "ROLE_USER");

        String token = given()
                .contentType(ContentType.JSON)
                .body(userSignup)
                .when()
                .post("/api/user/sign-up")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("token");

        Map<String, String> adminSignup = new HashMap<>();
        adminSignup.put("email", "admin@example.com");
        adminSignup.put("password", "admin123");
        adminSignup.put("name", "Admin User");
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
        Map<String, Object> placeData = new HashMap<>();
        placeData.put("type", "MEETING");
        placeData.put("capacity", 10);
        placeData.put("description", "Тестовая комната");
        placeData.put("name", "test-room-1");
        placeData.put("placeId", 1L);
        placesToCreate.add(placeData);

        given()
                .header("Authorization", "Bearer " + adminToken)
                .contentType(ContentType.JSON)
                .body(placesToCreate)
                .when()
                .post("/api/place/create-multiple")
                .then()
                .statusCode(HttpStatus.OK.value());

        LocalDateTime startAt = LocalDateTime.now().plusHours(1);
        LocalDateTime endAt = LocalDateTime.now().plusHours(2);

        Map<String, Object> bookingRequest = new HashMap<>();
        bookingRequest.put("name", "test-room-1");
        bookingRequest.put("startAt", startAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        bookingRequest.put("endAt", endAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        String bookingUuid = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(bookingRequest)
                .when()
                .post("/api/booking/create")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .body("id", notNullValue())
                .extract().path("id");

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get("/api/booking/user")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("size()", equalTo(1))
                .body("[0].place.name", equalTo("test-room-1"));

        given()
                        .header("Authorization", "Bearer " + token)
                        .when()
                        .post("/api/booking/" + bookingUuid + "/cancel")
                        .then()
                        .statusCode(HttpStatus.OK.value());
    }

    @Test
    void testBookingQRCode() {
        Map<String, String> userSignup = new HashMap<>();
        userSignup.put("email", "qruser@example.com");
        userSignup.put("password", "password123");
        userSignup.put("name", "QR User");
        userSignup.put("role", "ROLE_USER");

        String token = given()
                .contentType(ContentType.JSON)
                .body(userSignup)
                .when()
                .post("/api/user/sign-up")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("token");

        Map<String, String> adminSignup = new HashMap<>();
        adminSignup.put("email", "qradmin@example.com");
        adminSignup.put("password", "admin123");
        adminSignup.put("name", "QR Admin");
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
        Map<String, Object> placeData = new HashMap<>();
        placeData.put("type", "MEETING");
        placeData.put("capacity", 5);
        placeData.put("description", "QR комната");
        placeData.put("placeId", 2L);
        placeData.put("name", "qr-room");
        placesToCreate.add(placeData);

        given()
                .header("Authorization", "Bearer " + adminToken)
                .contentType(ContentType.JSON)
                .body(placesToCreate)
                .when()
                .post("/api/place/create-multiple")
                .then()
                .statusCode(HttpStatus.OK.value());

        LocalDateTime startAt = LocalDateTime.now().plusHours(1);
        LocalDateTime endAt = LocalDateTime.now().plusHours(2);

        Map<String, Object> bookingRequest = new HashMap<>();
        bookingRequest.put("name", "qr-room");
        bookingRequest.put("startAt", startAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        bookingRequest.put("endAt", endAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        String bookingUuid = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(bookingRequest)
                .when()
                .post("/api/booking/create")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("id");

        String qrCode = given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get("/api/booking/" + bookingUuid + "/qr")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("qrCode", notNullValue())
                .extract().path("qrCode");

        Map<String, String> qrCheckRequest = new HashMap<>();
        qrCheckRequest.put("qrCode", qrCode);

        given()
                .header("Authorization", "Bearer " + adminToken)
                .contentType(ContentType.JSON)
                .body(qrCheckRequest)
                .when()
                .post("/api/booking/qr/check")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("bookingId", equalTo(bookingUuid));
    }

    @Test
    void testAdminBookingOperations() {
        Map<String, String> adminSignup = new HashMap<>();
        adminSignup.put("email", "bookingadmin@example.com");
        adminSignup.put("password", "admin123");
        adminSignup.put("name", "Booking Admin");
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
        Map<String, Object> placeData = new HashMap<>();
        placeData.put("type", "MEETING");
        placeData.put("capacity", 8);
        placeData.put("description", "Комната для админа");
        placeData.put("placeId", 3L);
        placeData.put("name", "admin-room");
        placesToCreate.add(placeData);

        given()
                .header("Authorization", "Bearer " + adminToken)
                .contentType(ContentType.JSON)
                .body(placesToCreate)
                .when()
                .post("/api/place/create-multiple")
                .then()
                .statusCode(HttpStatus.OK.value());

        LocalDateTime startAt = LocalDateTime.now().plusHours(1);
        LocalDateTime endAt = LocalDateTime.now().plusHours(3);

        Map<String, Object> bookingRequest = new HashMap<>();
        bookingRequest.put("name", "admin-room");
        bookingRequest.put("startAt", startAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        bookingRequest.put("endAt", endAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        given()
                .header("Authorization", "Bearer " + adminToken)
                .contentType(ContentType.JSON)
                .body(bookingRequest)
                .when()
                .post("/api/booking/create")
                .then()
                .statusCode(HttpStatus.CREATED.value());

        given()
                .header("Authorization", "Bearer " + adminToken)
                .when()
                .get("/api/booking/admin-room/place")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("size()", equalTo(1))
                .body("[0].user.name", equalTo("Booking Admin"));
    }

    @Test
    void testBookingUpdate() {
        Map<String, String> userSignup = new HashMap<>();
        userSignup.put("email", "updateuser@example.com");
        userSignup.put("password", "password123");
        userSignup.put("name", "Update User");
        userSignup.put("role", "ROLE_USER");

        String token = given()
                .contentType(ContentType.JSON)
                .body(userSignup)
                .when()
                .post("/api/user/sign-up")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("token");

        Map<String, String> adminSignup = new HashMap<>();
        adminSignup.put("email", "updateadmin@example.com");
        adminSignup.put("password", "admin123");
        adminSignup.put("name", "Update Admin");
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
        Map<String, Object> placeData = new HashMap<>();
        placeData.put("type", "MEETING");
        placeData.put("capacity", 4);
        placeData.put("description", "Комната для обновления");
        placeData.put("placeId", 4L);
        placeData.put("name", "update-room");
        placesToCreate.add(placeData);

        given()
                .header("Authorization", "Bearer " + adminToken)
                .contentType(ContentType.JSON)
                .body(placesToCreate)
                .when()
                .post("/api/place/create-multiple")
                .then()
                .statusCode(HttpStatus.OK.value());

        LocalDateTime startAt = LocalDateTime.now().plusHours(1);
        LocalDateTime endAt = LocalDateTime.now().plusHours(2);

        Map<String, Object> bookingRequest = new HashMap<>();
        bookingRequest.put("name", "update-room");
        bookingRequest.put("startAt", startAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        bookingRequest.put("endAt", endAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        String bookingUuid = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(bookingRequest)
                .when()
                .post("/api/booking/create")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("id");

        LocalDateTime newStartAt = LocalDateTime.now().plusHours(3);
        LocalDateTime newEndAt = LocalDateTime.now().plusHours(4);

        given()
                .header("Authorization", "Bearer " + token)
                .queryParam("startAt", newStartAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .queryParam("endAt", newEndAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .when()
                .post("/api/booking/" + bookingUuid + "/update")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("startAt", not(equalTo(startAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))))
                .body("endAt", not(equalTo(endAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))));
    }

    @Test
    void testBookingsByStatus() {
        Map<String, String> userSignup = new HashMap<>();
        userSignup.put("email", "statususer@example.com");
        userSignup.put("password", "password123");
        userSignup.put("name", "Status User");
        userSignup.put("role", "ROLE_USER");

        String token = given()
                .contentType(ContentType.JSON)
                .body(userSignup)
                .when()
                .post("/api/user/sign-up")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("token");

        Map<String, String> adminSignup = new HashMap<>();
        adminSignup.put("email", "statusadmin@example.com");
        adminSignup.put("password", "admin123");
        adminSignup.put("name", "Status Admin");
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
        Map<String, Object> placeData = new HashMap<>();
        placeData.put("type", "MEETING");
        placeData.put("capacity", 6);
        placeData.put("description", "Комната для статусов");
        placeData.put("placeId", 5L);
        placeData.put("name", "status-room");
        placesToCreate.add(placeData);

        given()
                .header("Authorization", "Bearer " + adminToken)
                .contentType(ContentType.JSON)
                .body(placesToCreate)
                .when()
                .post("/api/place/create-multiple")
                .then()
                .statusCode(HttpStatus.OK.value());

        LocalDateTime startAt = LocalDateTime.now().plusHours(1);
        LocalDateTime endAt = LocalDateTime.now().plusHours(2);

        Map<String, Object> bookingRequest = new HashMap<>();
        bookingRequest.put("name", "status-room");
        bookingRequest.put("startAt", startAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        bookingRequest.put("endAt", endAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        String bookingUuid = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(bookingRequest)
                .when()
                .post("/api/booking/create")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .extract().path("id");

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get("/api/booking/status/PENDING")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("size()", equalTo(1))
                .body("[0].status", equalTo("PENDING"));
    }
}