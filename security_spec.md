# Security Specification: Pak-Tajarat Firestore Security Rules

## 1. Data Invariants

1. **User Identity Isolation**: A user can read and edit only their own user profile document (`/users/{userId}`). No user can elevate their role to `Admin` from the client.
2. **Order Integrity & Verification**: A user can create an order only if `userId` in the document matches their authenticated `uid`. Once created, order details (items, price, date) are immutable; only the status can be modified by an Admin.
3. **Product Catalog Protection**: Anyone (even unauthenticated guests) can read products. Only authorized Admins (identified in the `admins` collection, or explicitly checked) can create, update, or delete products.
4. **Reviews Authentication**: A review can only be posted by an authenticated user whose email and name match the review document fields. Users cannot modify or delete reviews of other users.
5. **Affiliate Isolation**: A user can register as an affiliate, but their affiliate status must default to `pending_approval` or be validated. Only Admins can modify the affiliate account's `status` or approve/reject withdrawal requests.
6. **Immutable Critical Fields**: Fields like `createdAt` and `userId` cannot be modified after initial document creation.
7. **System Configuration Safeguards**: Only Admins can read or modify the `/config` documents.

---

## 2. The "Dirty Dozen" Payloads

Here are 12 specific payloads representing exploits targeting Privilege Escalation, Identity Spoofing, and State Bypass.

### Attack 1: Privilege Escalation via User Profile
* **Target Path**: `users/attacker_uid`
* **Payload**: `{ "id": "attacker_uid", "email": "attacker@gmail.com", "fullName": "Attacker", "role": "Admin" }`
* **Intent**: Attacker attempts to set their own role to "Admin".
* **Expected Result**: `PERMISSION_DENIED` (cannot write `role: Admin` as non-admin).

### Attack 2: Identity Spoofing during Order Creation
* **Target Path**: `orders/fake_order_1`
* **Payload**: `{ "id": "fake_order_1", "userId": "victim_uid", "total": 100, "status": "Pending", "date": "June 30, 2026", "shippingAddress": {} }`
* **Intent**: Attacker attempts to place an order billing a victim's user ID.
* **Expected Result**: `PERMISSION_DENIED` (user ID must match authenticated request UID).

### Attack 3: Order Status Modification (State Shortcutting)
* **Target Path**: `orders/victim_order_1`
* **Payload**: `{ "status": "Delivered" }` (partial update attempt)
* **Intent**: Customer attempts to mark their own pending order as "Delivered" without payment or shipping.
* **Expected Result**: `PERMISSION_DENIED` (only Admins can update order statuses).

### Attack 4: Unauthorized Product Modification
* **Target Path**: `products/premium_laptop`
* **Payload**: `{ "price": 10 }`
* **Intent**: Unauthenticated user or standard customer tries to lower a product's price to 10 PKR.
* **Expected Result**: `PERMISSION_DENIED` (write requires admin role).

### Attack 5: Shadow Field Injection in Product Creation
* **Target Path**: `products/hacked_item`
* **Payload**: `{ "id": "hacked_item", "name": "Fake Item", "price": 100, "category": "Fashion", "stock": 50, "image": "img.png", "isFeatured": true, "hackField": "malicious_payload_or_size" }`
* **Intent**: Attempting to inject extra non-existent fields to cause index or storage bloat.
* **Expected Result**: `PERMISSION_DENIED` (schema keys size and names must match exactly).

### Attack 6: Review Forgery (Email Spoofing)
* **Target Path**: `reviews/forged_review`
* **Payload**: `{ "id": "forged_review", "productId": "p1", "userName": "Victim", "userEmail": "victim@gmail.com", "rating": 1, "comment": "Terrible product!", "date": "2026-06-30" }`
* **Intent**: Attacker posts a fake 1-star review claiming to be a registered customer `victim@gmail.com`.
* **Expected Result**: `PERMISSION_DENIED` (userEmail must match authenticated user's email).

### Attack 7: Self-Approval of Affiliate Account
* **Target Path**: `affiliates/attacker_uid`
* **Payload**: `{ "id": "attacker_uid", "userId": "attacker_uid", "referralCode": "ATTACK-999", "status": "active", "totalEarnings": 0, "pendingCommission": 0, "paidCommission": 0 }`
* **Intent**: Attacker signs up for affiliate program and pre-sets their status as `active` without admin review.
* **Expected Result**: `PERMISSION_DENIED` (must set status to `pending_approval` on create, and updates to `status` are admin-only).

### Attack 8: Commission Hijacking & Padding
* **Target Path**: `affiliates/attacker_uid`
* **Payload**: `{ "totalEarnings": 500000, "pendingCommission": 500000 }` (partial update)
* **Intent**: Attacker attempts to modify their earnings balance directly.
* **Expected Result**: `PERMISSION_DENIED` (earnings balances are system-only and cannot be updated directly by the user).

### Attack 9: Self-Approval of Withdrawal Request
* **Target Path**: `withdrawals/payout_1`
* **Payload**: `{ "id": "payout_1", "affiliateId": "attacker_uid", "amount": 10000, "paymentMethod": "EasyPaisa", "paymentDetails": "03123456789", "status": "approved", "date": "2026-06-30" }`
* **Intent**: Attacker requests a payout and pre-approves it themselves.
* **Expected Result**: `PERMISSION_DENIED` (status must be `pending` on create, only admins can update status).

### Attack 10: Path Variable Poisoning
* **Target Path**: `users/long_garbage_characters_injecting_denial_of_wallet`
* **Payload**: `{ "email": "any@gmail.com", "fullName": "Any" }`
* **Intent**: Injecting 1.5KB string as document ID to bloat the database indexes.
* **Expected Result**: `PERMISSION_DENIED` (document IDs must pass `isValidId` and size checks).

### Attack 11: System Configuration Hijacking
* **Target Path**: `config/affiliate_settings`
* **Payload**: `{ "commissionPercentage": 90 }`
* **Intent**: Regular user or guest attempts to change the global commission rate to 90%.
* **Expected Result**: `PERMISSION_DENIED` (requires Admin credentials to write).

### Attack 12: Modification of Immutable Order Fields
* **Target Path**: `orders/existing_order_1`
* **Payload**: `{ "total": 50, "items": [] }`
* **Intent**: User tries to change their existing order total to a lower price or empty the items.
* **Expected Result**: `PERMISSION_DENIED` (order detail fields are immutable after creation).

---

## 3. Security Assertions and Guard Design

To satisfy these invariants and defend against the "Dirty Dozen", the Firestore rules are designed with:
1. **isValidId()** check on all custom-generated document IDs.
2. **isValid[Entity]()** helper functions encapsulating strict schema and size validations.
3. **affectedKeys().hasOnly()** gates to control field-level state transitions.
4. **Admins List Lookups** to securely verify roles rather than trusting client tokens.
