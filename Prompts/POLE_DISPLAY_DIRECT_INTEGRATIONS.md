## Role

You are a senior full‑stack engineer working on a POS system with pole display support.

## Context

We support **Fiscal** and **Direct Integration (Type 2)** modes for pole display communication. A radio button in the UI determines which mode is active.

When **Direct Integration** is selected, the system must communicate **directly** with the pole display using a base **URI** stored in `poleDisplayConfiguration` (session storage).

The service responsible for making these calls is **PrintManagerCommunication**.

---

## Goal

Implement Direct Integration so that:

* The selected radio button (Fiscal vs Direct Integration) controls behavior
* If **Direct Integration** is chosen, API calls are made using the configured URI
* All pole display operations go through **PrintManagerCommunication**

---

## Configuration Source

* `poleDisplayConfiguration` (session storage)
* Contains:

  * Integration type (Fiscal / Direct)
  * Base URI for Direct Integration

---

## API Endpoints (Direct Integration)

### 1️⃣ List Available Pole Displays

**GET** `{BASE_URI}/V1PrintManager/Poledisplay/availableDevices`

**Response Contract** (BaseResponse wrapper):

```json
{
  "result": [
    {
      "displayName": "ProlificSerial0",
      "portName": "COM4",
      "isActive": true,
      "isConfigured": true,
      "lastSeen": "2026-02-03T10:27:18.9403684Z"
    }
  ],
  "isSuccess": true,
  "message": null
}
```

**Implementation Notes:**
- API returns `BaseResponse<PoleDisplayDevice[]>` with array directly in `result`
- Use `getPromise<PoleDisplayDevice[]>()` to extract the array from `result`
- Cache the first device's `displayName` in session storage (key: `PoleDisplayName`)

---

### 2️⃣ Send Message to a Pole Display

**POST** `{BASE_URI}/V1PrintManager/Poledisplay/displayMessage`

**Request Payload:**

```json
{
  "displayName": "ProlificSerial0",
  "line1": "Sonsss",
  "line2": "My son"
}
```

**Response Contract** (BaseResponse wrapper):

```json
{
  "result": true,
  "isSuccess": true,
  "message": null
}
```

**Implementation Notes:**
- API returns `BaseResponse<boolean>` with `true` in `result` on success
- Use `postPromise<boolean>()` to extract the boolean from `result`
- If `displayName` not in session storage, fetch from available devices first
- Clear cached `displayName` on error to retry device lookup next time

**Example:**

```bash
curl --location 'http://localhost:5100/V1PrintManager/Poledisplay/displayMessage' \
--header 'Content-Type: application/json' \
--data '{
  "displayName": "ProlificSerial0",
  "line1": "welcome!",
  "line2": "Total: $200"
}'
```

---

### 3️⃣ Heartbeat Check for Pole Display

**GET** `{BASE_URI}/V1PrintManager/Poledisplay/heartbeat/{displayName}`

**Response Contract** (BaseResponse wrapper):

```json
{
  "result": {
    "displayName": "ProlificSerial0",
    "portName": "COM4",
    "isAlive": true,
    "message": "Display is responding",
    "checkedAt": "2026-02-03T10:07:18.9509184Z"
  },
  "isSuccess": true,
  "message": null
}
```

**Implementation Notes:**
- API returns `BaseResponse<PoleDisplayHeartbeatResponse>` with device info in `result`
- Use `getPromise<PoleDisplayHeartbeatResponse>()` to extract the object from `result`

**Example:**

```bash
curl --location --request GET 'http://localhost:5100/V1PrintManager/Poledisplay/heartbeat/ProlificSerial0'
```

---

## Implementation Requirements

### UI Layer

* Add radio buttons:

  * Fiscal
  * Direct Integration (Type 2)
* Persist selected integration type in `poleDisplayConfiguration`

### Service Layer – PrintManagerCommunication

Implement methods to:

1. **getAvailableDevices()** - Fetch available pole displays
2. **displayMessageDirect()** - Send display messages (line1, line2)
3. **checkHeartbeat()** - Perform heartbeat checks

All methods must:

* Read the base URI from `poleDisplayConfiguration`
* Execute calls **only when integration type = Direct Integration**
* Use appropriate promise methods:
  - `getPromise<T>()` for GET requests (extracts `result` from `BaseResponse<T>`)
  - `postPromise<T>()` for POST requests (extracts `result` from `BaseResponse<T>`)
* Gracefully handle errors and unavailable devices
* Cache `displayName` in session storage to avoid repeated device lookups
* Clear cached `displayName` on error to force re-fetch on next attempt

---

## Expected Outcome

* Direct Integration bypasses Fiscal logic entirely
* Pole display communication works via HTTP using configured URI
* PrintManagerCommunication becomes the single entry point for all pole display API calls
* Session storage caching prevents repeated device lookups
* Error handling ensures system recovers from failures by clearing cache

---

## Implementation Status

✅ **Completed:**
- Added Direct Integration interfaces in `globalsContant.ts`
- Implemented `PoleDisplayDataService` using `PrintManagerCommunication`
- Updated `PoleDisplayService` to route between Fiscal and Direct modes
- Added route constants to `CommonApiRoutes` enum
- Session storage caching for `displayName`
- Error handling with cache invalidation
- All three API endpoints implemented with correct promise methods

**Key Files:**
- `src/app/retail/shared/globalsContant.ts` - Type definitions
- `src/app/common/dataservices/pole-display.data.service.ts` - API communication
- `src/app/retail/shared/service/pole-display.service.ts` - Business logic
- `src/app/common/common-route.ts` - Route constants

**Session Storage Keys:**
- `PoleDisplayConfigurations` - Configuration object with integration type and base URI
- `PoleDisplayName` - Cached device displayName

---

## Notes

* Do not hardcode URIs
* Ensure displayName is used as the identifier for messaging and heartbeat
* Code should be clean, testable, and integration-type aware
* All API responses follow `BaseResponse<T>` pattern with `result`, `isSuccess`, and `message` properties
* Use route constants from `CommonApiRoutes` enum for maintainability
