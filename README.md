# **Currency Converter API Documentation**

Welcome to the Currency Converter API! This API allows users to create an account, save favorite currency pairs, and perform real-time currency conversions.

**Base URL:** `http://localhost:3000` (Replace with your production URL if deployed)

## **Authentication**

Most endpoints in this API are protected and require a JSON Web Token (JWT) for access.

To authenticate, you must first obtain a token by using either the `/api/users/signup` or `/api/users/login` endpoint.

Once you have a token, you must include it in the header of all subsequent requests to protected routes.

-   **Header Name:** `x-auth-token`
-   **Header Value:** `<your_jwt_token>`

Endpoints that require authentication are marked as **Private**.

---

## **1. User Management**

Endpoints for user registration, login, and profile management.

### **Register a New User**

-   **Endpoint:** `POST /api/users/signup`
-   **Description:** Creates a new user account.
-   **Access:** Public
-   **Request Body (JSON):**
    ```json
    {
      "username": "testuser",
      "email": "test@example.com",
      "password": "password123"
    }
    ```
-   **Success Response (201 Created):**
    Returns a JWT for the new user session.
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
-   **Error Responses (400 Bad Request):**
    -   `{ "msg": "User with this email already exists" }`
    -   `{ "msg": "Username is already taken" }`
    -   `{ "msg": "Password must be at least 6 characters" }`

### **Authenticate a User (Login)**

-   **Endpoint:** `POST /api/users/login`
-   **Description:** Logs in an existing user.
-   **Access:** Public
-   **Request Body (JSON):**
    ```json
    {
      "email": "test@example.com",
      "password": "password123"
    }
    ```
-   **Success Response (200 OK):**
    Returns a new JWT for the user session.
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
-   **Error Response (400 Bad Request):**
    -   `{ "msg": "Invalid credentials" }`

### **Get User Profile**

-   **Endpoint:** `GET /api/users/profile`
-   **Description:** Retrieves the profile information of the currently authenticated user.
-   **Access:** **Private** (Authentication required)
-   **Success Response (200 OK):**
    ```json
    {
        "_id": "630fc6e71234567890abcdef",
        "username": "testuser",
        "email": "test@example.com",
        "favorites": ["USD-JPY", "GBP-EUR"],
        "createdAt": "2024-01-01T12:00:00.000Z"
    }
    ```
-   **Error Responses (401 Unauthorized):**
    -   `{ "msg": "No token, authorization denied" }`
    -   `{ "msg": "Token is not valid" }`

---

## **2. Favorite Currency Pairs**

Endpoints for managing a user's saved favorite pairs. All endpoints in this section are **Private**.

### **Add a Favorite**

-   **Endpoint:** `POST /api/favorites`
-   **Description:** Adds a currency pair to the user's list of favorites.
-   **Request Body (JSON):**
    ```json
    {
      "from": "USD",
      "to": "EUR"
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "msg": "Favorite added successfully.",
      "favorites": ["USD-EUR"]
    }
    ```

### **Get All Favorites**

-   **Endpoint:** `GET /api/favorites`
-   **Description:** Retrieves all of the user's saved favorite pairs.
-   **Success Response (200 OK):**
    An array of strings representing the favorite pairs.
    ```json
    [
      "USD-EUR",
      "GBP-JPY"
    ]
    ```

### **Delete a Favorite**

-   **Endpoint:** `DELETE /api/favorites`
-   **Description:** Removes a currency pair from the user's favorites.
-   **Request Body (JSON):**
    ```json
    {
      "from": "USD",
      "to": "EUR"
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "msg": "Favorite removed successfully."
    }
    ```

---

## **3. Currency Conversion**

Endpoints for performing currency conversions. These endpoints are **Public**.

### **Convert Currency**

-   **Endpoint:** `GET /api/currency/convert`
-   **Description:** Converts an amount from one currency to another using the latest exchange rates.
-   **Query Parameters:**
    -   `from`: The currency code to convert from (e.g., `USD`).
    -   `to`: The currency code to convert to (e.g., `JPY`).
    -   `amount`: The numerical amount to convert.
-   **Example Request:**
    `GET http://localhost:3000/api/currency/convert?from=USD&to=JPY&amount=100`
-   **Success Response (200 OK):**
    ```json
    {
      "from": "USD",
      "to": "JPY",
      "amount": 100,
      "convertedAmount": 15025.50
    }
    ```
-   **Error Responses:**
    -   `400 Bad Request`: If parameters are missing or currency codes are invalid.
    -   `503 Service Unavailable`: If the server has not yet fetched the latest rates.

### **Reverse Convert Currency**

-   **Endpoint:** `GET /api/currency/reverse`
-   **Description:** Performs a conversion with the `from` and `to` currencies swapped.
-   **Query Parameters:**
    -   `from`: The original "from" currency (will be treated as the "to").
    -   `to`: The original "to" currency (will be treated as the "from").
    -   `amount`: The numerical amount to convert.
-   **Example Request:**
    `GET http://localhost:3000/api/currency/reverse?from=USD&to=JPY&amount=100`
    *(This will convert 100 JPY to USD)*
-   **Success Response (200 OK):**
    ```json
    {
      "from": "JPY",
      "to": "USD",
      "amount": 100,
      "convertedAmount": 0.67
    }
    ```