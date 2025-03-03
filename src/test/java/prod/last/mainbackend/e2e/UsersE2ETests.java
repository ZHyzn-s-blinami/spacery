package prod.last.mainbackend.e2e;

import io.restassured.http.ContentType;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@Tag("e2e")
@Tag("local")
public class UsersE2ETests extends LocalTestBase {

    @Test
    void testUserRegistrationAndLogin() {
        Map<String, String> userSignup = new HashMap<>();
        userSignup.put("email", "test@example.com");
        userSignup.put("password", "password123");
        userSignup.put("name", "Test User");
        userSignup.put("role", "ROLE_USER");

        String token = given()
                .contentType(ContentType.JSON)
                .body(userSignup)
                .when()
                .post("/api/user/sign-up")
                .then()
                .statusCode(HttpStatus.CREATED.value())
                .body("token", notNullValue())
                .extract().path("token");

        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", "test@example.com");
        loginRequest.put("password", "password123");

        given()
                .contentType(ContentType.JSON)
                .body(loginRequest)
                .when()
                .post("/api/user/sign-in")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("token", notNullValue());

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get("/api/user/me")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("email", equalTo("test@example.com"))
                .body("name", equalTo("Test User"));
    }

    @Test
    void testAdminOperations() {
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

        Map<String, String> userSignup = new HashMap<>();
        userSignup.put("email", "user2@example.com");
        userSignup.put("password", "pass123");
        userSignup.put("name", "Regular User");
        userSignup.put("role", "ROLE_USER");

        given()
                .contentType(ContentType.JSON)
                .body(userSignup)
                .when()
                .post("/api/user/sign-up")
                .then()
                .statusCode(HttpStatus.CREATED.value());

        String userId = given()
                .header("Authorization", "Bearer " + adminToken)
                .when()
                .get("/api/user/all")
                .then()
                .statusCode(HttpStatus.OK.value())
                .body("size()", greaterThanOrEqualTo(2))
                .extract()
                .path("find{it.email=='user2@example.com'}.id");

        Map<String, String> editRequest = new HashMap<>();
        editRequest.put("name", "Измененное имя");
        editRequest.put("description", "Новое описание");
        editRequest.put("email", "updated@example.com");

        given()
                .header("Authorization", "Bearer " + adminToken)
                .contentType(ContentType.JSON)
                .body(editRequest)
                .when()
                .put("/api/user/edit/" + userId)
                .then()
                .statusCode(HttpStatus.OK.value());

        given()
                .header("Authorization", "Bearer " + adminToken)
                .when()
                .post("/api/user/block/" + userId)
                .then()
                .statusCode(HttpStatus.OK.value());

        given()
                .header("Authorization", "Bearer " + adminToken)
                .when()
                .post("/api/user/unblock/" + userId)
                .then()
                .statusCode(HttpStatus.OK.value());

        given()
                .header("Authorization", "Bearer " + adminToken)
                .when()
                .delete("/api/user/delete/" + userId)
                .then()
                .statusCode(HttpStatus.OK.value());
    }

    @Test
    void testEmailVerification() {
        Map<String, String> userSignup = new HashMap<>();
        userSignup.put("email", "verify@example.com");
        userSignup.put("password", "verify123");
        userSignup.put("name", "User for Verification");
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
                .post("/api/user/verify")
                .then()
                .statusCode(HttpStatus.OK.value());

    }
}