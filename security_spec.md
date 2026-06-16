# Security Specification & "Dirty Dozen" TDD Payloads

This specification documents the Firestore database security invariants and test-driven development (TDD) payloads designed to validate protection rules.

## 1. Core Data Invariants

1. **Authentication**: All write operations require a valid authentication token. Guest write operations are denied unless they conform to a public review submissions sequence linked directly to an existing booking.
2. **Read Control**: Only administrators can view full analytical payments collections or user profiles listing PII. Normal users can only list and modify their own bookings and profile entries.
3. **Data Integrity & Structure**: Field ranges, data types, and sizes must fall within allowed boundaries. Document IDs (`isValidId`) must match clean alphanumeric patterns to prevent resource exhaustion or path injection.
4. **Temporal Consistency**: Every creation and update of timestamps (`createdAt`, `updatedAt`) must strictly match the current transaction server time (`request.time`). Custom client times are rejected.
5. **Team and Player Relational Integrity**: Players cannot be created in non-existent teams. A user cannot self-assign an admin role or bypass team size constraints.

---

## 2. The Great "Dirty Dozen" (Malicious Payloads)

Here are the 12 malicious payloads targeted by our rules:

### Payload 1: Admin Promotion Escalation (Identity Spoofing)
* **Goal**: A standard authenticated user attempts to write another profile with `role: "admin"`.
* **Path**: `/users/usr-malicious`
* **JSON Payload**:
  ```json
  {
    "id": "usr-malicious",
    "name": "Attacker",
    "email": "attacker@gmail.com",
    "phone": "+12345678",
    "role": "admin"
  }
  ```

### Payload 2: Custom Client Timestamp Injection (Temporal Bypass)
* **Goal**: Inject a back-dated or future-dated booking time to bypass liguilla lockouts.
* **Path**: `/reservations/res-malicious`
* **JSON Payload**:
  ```json
  {
    "id": "res-malicious",
    "userName": "Hacker",
    "userEmail": "hacker@gmail.com",
    "userPhone": "+12341234",
    "date": "2026-06-11",
    "timeSlot": "10:00 - 11:00",
    "duration": 1.0,
    "fieldId": "cancha-1",
    "fieldName": "Cancha 1",
    "totalPrice": 600,
    "status": "confirmed",
    "paymentStatus": "paid",
    "createdAt": "2020-01-01T00:00:00.000Z"
  }
  ```

### Payload 3: Unauthenticated Reservation Sledgehammer (Auth Bypass)
* **Goal**: Unauthenticated guest attempts to book a cancha slot.
* **Path**: `/reservations/res-guest`
* **JSON Payload**:
  ```json
  {
    "id": "res-guest",
    "userName": "Guest Attacker",
    "userEmail": "guest@gmail.com",
    "userPhone": "+12345678",
    "date": "2026-06-12",
    "timeSlot": "12:00 - 13:00",
    "duration": 1,
    "fieldId": "cancha-1",
    "fieldName": "Cancha 1",
    "totalPrice": 500,
    "status": "pending",
    "paymentStatus": "pending"
  }
  ```

### Payload 4: Price Poisoning (integrity Hack)
* **Goal**: Authenticated user attempts to book a peak hour slot with a price of 1 MXN.
* **Path**: `/reservations/res-cheap`
* **JSON Payload**:
  ```json
  {
    "id": "res-cheap",
    "userId": "user-01",
    "userName": "Carlos Mendoza",
    "userEmail": "carlos@gmail.com",
    "userPhone": "+525598765432",
    "date": "2026-06-12",
    "timeSlot": "20:00 - 21:00",
    "duration": 1.0,
    "fieldId": "cancha-1",
    "fieldName": "Cancha 1",
    "totalPrice": -1.0,
    "status": "confirmed",
    "paymentStatus": "paid"
  }
  ```

### Payload 5: Orphan Team Registration (Dangling Relationship)
* **Goal**: Registering player on a non-existent team ID `team-nonexistent` to break statistics reports.
* **Path**: `/players/player-orphan`
* **JSON Payload**:
  ```json
  {
    "id": "player-orphan",
    "teamId": "team-nonexistent",
    "name": "Ghost Striker",
    "age": 25,
    "position": "Delantero"
  }
  ```

### Payload 6: Ghost Fields Infiltration (Shadow Update Attack)
* **Goal**: Add a non-blueprint field (`isAdminBackdoor: true`) into a promotion object.
* **Path**: `/promotions/promo-01`
* **JSON Payload**:
  ```json
  {
    "id": "promo-01",
    "title": "Super Promo",
    "description": "Cheap game",
    "discountPercentage": 100,
    "validUntil": "2026-12-31",
    "isActive": true,
    "type": "discount",
    "isAdminBackdoor": true
  }
  ```

### Payload 7: Denial of Wallet ID Extortion (Resource Poisoning)
* **Goal**: Pass a massive junk ID containing special characters (1.5KB) to exhaust server cycles.
* **Path**: `/fields/cancha-1!!!!!!!!!!!!!!!!![JUNK]!!!!!!!!!!!!!!!!!`
* **JSON Payload**:
  ```json
  {
    "id": "invalid-id",
    "name": "Toxic Field",
    "basePricePerHour": 100,
    "lightPriceSurcharge": 20,
    "nightHoursStart": 18
  }
  ```

### Payload 8: Direct Payment Creation Bypass (Financial Fraud)
* **Goal**: A user tries to directly insert a "completed" payment record into `/payments/` to unlock booking without Stripe auth.
* **Path**: `/payments/pay-fake`
* **JSON Payload**:
  ```json
  {
    "id": "pay-fake",
    "reservationId": "res-02",
    "amount": 975,
    "paymentMethod": "stripe",
    "transactionId": "fake-stripe",
    "status": "completed",
    "createdAt": "2026-06-11T17:23:41.000Z"
  }
  ```

### Payload 9: Terminal State Overwriting (State Lock Bypass)
* **Goal**: Force change of a cancelled reservation back to `confirmed` status by a normal user.
* **Path**: `/reservations/res-cancelled`
* **JSON Payload**:
  ```json
  {
    "status": "confirmed"
  }
  ```

### Payload 10: Fake Review spam (Integrity Theft)
* **Goal**: Write a rating larger than 5 or negative.
* **Path**: `/reviews/rev-toxic`
* **JSON Payload**:
  ```json
  {
    "id": "rev-toxic",
    "fieldId": "cancha-1",
    "fieldName": "Cancha 1",
    "userId": "user-01",
    "userName": "Anónimo",
    "rating": 9999,
    "comment": "Toxic post",
    "status": "approved",
    "createdAt": "2026-06-11T17:23:41.000Z"
  }
  ```

### Payload 11: Dynamic Rate Hijacking (Rate Poisoning)
* **Goal**: Normal user attempts to insert or update dynamic Peak Price rules to mess with pricing algorithms.
* **Path**: `/dynamicPrices/rule-malicious`
* **JSON Payload**:
  ```json
  {
    "id": "rule-malicious",
    "fieldId": "cancha-1",
    "name": "Peak Discount",
    "multiplier": 0.01,
    "isActive": true
  }
  ```

### Payload 12: Unauthorized PII Collection (PII Blanket Leak)
* **Goal**: Guest or other authenticated user attempts a general query or get on private profiles without admin/owner consent.
* **Path**: `/users/usr-victim` (read operation)

---

## 3. Test Runner Definition

These verification scenarios are designed to ensure that any request attempting to deliver the "Dirty Dozen" payloads gets strictly blocked with `PERMISSION_DENIED`.
