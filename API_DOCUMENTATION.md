# Sahay API Documentation

Base URL: `https://project-sahay-backend.onrender.com` (or whichever port the server is running on, default 5000)

## Authentication

All endpoints requiring authentication use a middleware that expects a valid session/token (usually passed in headers, e.g., `Authorization: Bearer <token>`).

---

### 1. Health & Test Routes

#### `GET /`
- **Description**: Health check endpoint to verify the API is running.
- **Response**: `200 OK`
  ```text
  Sahay API running 🚀
  ```

#### `GET /test-db`
- **Description**: Tests the Supabase database connection by fetching from the `resources` table.
- **Response**: `200 OK` (Array of resources) or `500 Internal Server Error`

---

### 2. Authentication Routes (`/auth`)

#### `POST /auth/signup`
- **Description**: Register a new user.
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "full_name": "John Doe",
    "role": "user_role_here"
  }
  ```
- **Response**:
  - `201 Created`
    ```json
    {
      "message": "User created successfully",
      "user": { ... }
    }
    ```
  - `500 Server Error`

#### `POST /auth/login`
- **Description**: Login an existing user.
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  - `200 OK`
    ```json
    {
      "message": "Login successful",
      "session": { ... },
      "user": { ... }
    }
    ```
  - `400 Bad Request`

---

### 3. NGO Routes (`/ngo`)

#### `POST /ngo/register`
- **Description**: Register an NGO for the currently authenticated user.
- **Requires Auth**: Yes
- **Body**:
  ```json
  {
    "org_name": "NGO Name",
    "registration_number": "REG12345",
    "description": "Description of the NGO",
    "address": "123 Main St",
    "city": "City Name",
    "state": "State Name",
    "pincode": "123456",
    "latitude": 12.34,
    "longitude": 56.78,
    "website_url": "https://example.com",
    "logo_url": "https://example.com/logo.png",
    "cover_image_url": "https://example.com/cover.png"
  }
  ```
- **Response**:
  - `201 Created`: `{ "message": "NGO registered successfully", "ngo": { ... } }`
  - `400 Bad Request`: If the user has already registered an NGO.
  - `500 Server Error`

#### `GET /ngo/my-ngo`
- **Description**: Retrieve the NGO profile of the logged-in user.
- **Requires Auth**: Yes
- **Response**:
  - `200 OK`: NGO Object
  - `404 Not Found`: "NGO not found"

#### `GET /ngo/:id`
- **Description**: Get public profile of an NGO by its ID.
- **Response**:
  - `200 OK`: NGO Object
  - `404 Not Found`: "NGO not found"

#### `PATCH /ngo/update`
- **Description**: Update the authenticated user's NGO details.
- **Requires Auth**: Yes
- **Body**: Any fields from the NGO registration definition to update.
- **Response**:
  - `200 OK`: `{ "message": "NGO updated successfully", "ngo": { ... } }`
  - `500 Server Error`

---

### 4. Needs Routes (`/api/needs`)

#### `GET /api/needs`
- **Description**: Get all needs that have an "open" status. Includes joined details for NGO (id, name, city, state) and Category (id, name, slug).
- **Response**:
  - `200 OK`: Array of Need objects.

#### `POST /api/needs`
- **Description**: Create a new need requirement. Requesters must be a registered NGO user.
- **Requires Auth**: Yes
- **Body**:
  ```json
  {
    "title": "Need 50 Blankets",
    "description": "We need blankets for the upcoming winter.",
    "category_id": "uuid-of-category",
    "quantity_required": 50,
    "unit": "pieces",
    "urgency_level": "high",
    "deadline": "2023-12-31T23:59:59Z",
    "images": ["url1", "url2"],
    "is_monetary": false,
    "upi_id": "ngo@upi" 
  }
  ```
- **Response**:
  - `201 Created`: `{ "message": "Need created successfully", "need": { ... } }`
  - `403 Forbidden`: "User is not registered as an NGO"

#### `PUT /api/needs/:id`
- **Description**: Update an existing need. User must be the owner of the NGO that created the need.
- **Requires Auth**: Yes
- **Body**: Any of the allowed fields in the Need object.
- **Response**:
  - `200 OK`: `{ "message": "Need updated successfully", "need": { ... } }`
  - `403 Forbidden`: If unauthorized to update.

#### `DELETE /api/needs/:id`
- **Description**: Close a need (sets status to "closed"). User must be the owner of the NGO.
- **Requires Auth**: Yes
- **Response**:
  - `200 OK`: `{ "message": "Need closed successfully" }`
  - `403 Forbidden`: If unauthorized.

---

### 5. Surplus Routes (`/api/surplus`)

#### `GET /api/surplus`
- **Description**: Get all surplus listings that are available. Includes joined details for Donor and Category.
- **Response**:
  - `200 OK`: Array of Surplus objects.

#### `POST /api/surplus`
- **Description**: Create a new surplus listing.
- **Requires Auth**: Yes
- **Body**:
  ```json
  {
    "title": "Surplus Food",
    "description": "Edible food from recent event",
    "category_id": "uuid-of-category",
    "quantity": 10,
    "unit": "kg",
    "condition": "fresh",
    "pickup_required": true,
    "city": "City",
    "state": "State",
    "pincode": "123456",
    "images": ["url1"],
    "expires_at": "2023-12-31T23:59:59Z"
  }
  ```
- **Response**:
  - `201 Created`: `{ "message": "Surplus listing created successfully", "surplus": { ... } }`

---

### 6. Contact Routes (`/api/contacts`)

#### `POST /api/contacts`
- **Description**: Send a contact request for a listing.
- **Requires Auth**: Yes
- **Body**:
  ```json
  {
    "recipient_id": "uuid-of-recipient",
    "listing_type": "need_or_surplus",
    "listing_id": "uuid-of-listing",
    "message": "Hi, I can help with this requirement."
  }
  ```
- **Response**:
  - `201 Created`: `{ "message": "Contact request sent successfully", "contact": { ... } }`

#### `GET /api/contacts/me`
- **Description**: Get all contact history for the logged-in user (both initiated and received).
- **Requires Auth**: Yes
- **Response**:
  - `200 OK`: Array of Contact objects.

---

### 7. Admin Routes (`/api/admin`)

#### `GET /api/admin/verify-queue`
- **Description**: Get the queue of NGOs pending verification.
- **Requires Auth**: Yes (Admin only)
- **Response**:
  - `200 OK`: Array of pending NGO objects.
  - `403 Forbidden`: `{ "error": "Admin access required" }`

#### `PUT /api/admin/ngos/:id/verify`
- **Description**: Verify or reject an NGO.
- **Requires Auth**: Yes (Admin only)
- **Body**:
  ```json
  {
    "action": "verify", // or "reject"
    "reason": "Optional rejection reason"
  }
  ```
- **Response**:
  - `200 OK`: `{ "message": "NGO verified successfully", "ngo": { ... } }`

---

### 8. Search Routes (`/api/search`)

#### `GET /api/search`
- **Description**: Universal search across open needs and available surplus.
- **Query Parameters**:
  - `q` (optional): Search keyword (searches title and description).
  - `city` (optional): Filter results by city.
- **Response**:
  - `200 OK`:
    ```json
    {
      "needs": [ ... ],
      "surplus": [ ... ]
    }
    ```

---

### 9. Notification Routes (`/api/notifications`)

#### `GET /api/notifications`
- **Description**: Get all notifications for the logged-in user.
- **Requires Auth**: Yes
- **Response**:
  - `200 OK`: Array of Notification objects.

