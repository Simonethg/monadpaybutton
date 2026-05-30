# Monad Pay Button AI Skill

The Monad Pay Button AI Skill allows an AI assistant to interact with the Monad Pay Button settlement router on behalf of the merchant.

## Endpoints

The skill is exposed as a REST API on the agent at the `/skill` path.

### 1. `create_charge`
- **Path**: `POST /skill/create_charge`
- **Description**: Creates a new payment intent and returns an agnostic payment URL/QR code.
- **Payload**:
  ```json
  {
    "amount": 5000,
    "currency": "ARS",
    "concept": "Coffee"
  }
  ```
- **Response**:
  ```json
  {
    "intentId": "pi_abc123",
    "payUrl": "https://cdn.pesobridge.app/pay?intent=pi_abc123&amount=5000&currency=ARS"
  }
  ```

### 2. `check_payment`
- **Path**: `GET /skill/check_payment/:id`
- **Description**: Returns the current status of a payment intent.
- **Response**:
  ```json
  {
    "intentId": "pi_abc123",
    "status": "pending" // or "settled"
  }
  ```

### 3. `get_activity`
- **Path**: `GET /skill/get_activity`
- **Description**: Returns the total settled charges and activity for today.
- **Response**:
  ```json
  {
    "totalSettledUSDC": "150.00",
    "totalCharges": 3,
    "date": "2026-05-30"
  }
  ```

## Example Usage by an AI Assistant

**User**: "Create a charge for 1000 ARS for a T-Shirt."
**AI Action**: Call `create_charge({amount: 1000, currency: "ARS", concept: "T-Shirt"})`.
**AI Response**: "Here is the payment link for the T-Shirt: [payUrl]"

**User**: "Did they pay?"
**AI Action**: Call `check_payment("pi_abc123")`.
**AI Response**: "Yes, the payment was settled successfully."
