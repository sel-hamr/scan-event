# Event Scan API (v2) - Auth

Base URL (local): `http://localhost:3000`

These endpoints are intended for external clients (mobile/web outside the app). They return JSON only and do not set cookies.

## POST /api/v2/login

Authenticate a user with email and password.

### Request body

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

### Success response (200)

```json
{
  "success": true,
  "jwt": "<JWT_TOKEN>",
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PARTICIPANT",
    "avatar": null,
    "phone": null
  }
}
```

### Error responses

- `400` → `{"error":"Email and password are required."}`
- `401` → `{"error":"Invalid credentials."}`
- `500` → `{"error":"Something went wrong."}`

## POST /api/v2/register

Create a new user account (default role: `PARTICIPANT`).

### Request body

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "secret123"
}
```

### Success response (201)

```json
{
  "success": true,
  "jwt": "<JWT_TOKEN>",
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PARTICIPANT",
    "avatar": null,
    "phone": null
  }
}
```

### Error responses

- `400` → `{"error":"Name, email and password are required."}`
- `400` → `{"error":"Password must be at least 6 characters long."}`
- `409` → `{"error":"A user with this email already exists."}`
- `500` → `{"error":"Something went wrong."}`

## GET /api/v2/me

Get current authenticated user info.

Optional query param:

- `ticket=true` → include all tickets for the authenticated user.
- `event=true` → include all events related to the authenticated user.
- `speaker=true` → with `event=true`, include `speakers` per event.
- `withsession=true` → with `event=true`, include `sessions` per event.

### Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Success response (200)

```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PARTICIPANT",
    "avatar": null,
    "phone": null
  }
}
```

### Success response with tickets (200)

`GET /api/v2/me?ticket=true`

```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PARTICIPANT",
    "avatar": null,
    "phone": null
  },
  "tickets": [
    {
      "id": "clt...",
      "eventId": "cle...",
      "type": "STANDARD",
      "price": 100,
      "status": "ACTIVE",
      "event": {
        "id": "cle...",
        "title": "DevFest Morocco 2026",
        "dateStart": "2026-06-10T09:00:00.000Z",
        "dateEnd": "2026-06-11T18:00:00.000Z",
        "location": "Casablanca"
      }
    }
  ]
}
```

### Success response with events (200)

`GET /api/v2/me?event=true`

```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PARTICIPANT",
    "avatar": null,
    "phone": null
  },
  "events": [
    {
      "id": "cle...",
      "title": "DevFest Morocco 2026",
      "dateStart": "2026-06-10T09:00:00.000Z",
      "dateEnd": "2026-06-11T18:00:00.000Z",
      "location": "Casablanca",
      "status": "PUBLISHED",
      "organiserId": "clx..."
    }
  ]
}
```

### Success response with events + speakers + sessions (200)

`GET /api/v2/me?event=true&speaker=true&withsession=true`

```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PARTICIPANT",
    "avatar": null,
    "phone": null
  },
  "events": [
    {
      "id": "cle...",
      "title": "DevFest Morocco 2026",
      "dateStart": "2026-06-10T09:00:00.000Z",
      "dateEnd": "2026-06-11T18:00:00.000Z",
      "location": "Casablanca",
      "status": "PUBLISHED",
      "organiserId": "clx...",
      "speakers": [
        {
          "id": "cls...",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "avatar": null,
          "bio": "Senior Engineer",
          "topic": "Modern Web",
          "company": "EventScan"
        }
      ],
      "sessions": [
        {
          "id": "clse...",
          "title": "Next.js in Production",
          "description": "Deep dive session",
          "start": "2026-06-10T10:00:00.000Z",
          "end": "2026-06-10T11:00:00.000Z",
          "room": {
            "id": "clr...",
            "name": "Main Hall",
            "capacity": 250
          },
          "speaker": {
            "id": "cls...",
            "name": "Jane Smith",
            "email": "jane@example.com",
            "avatar": null,
            "bio": "Senior Engineer",
            "topic": "Modern Web",
            "company": "EventScan"
          }
        }
      ]
    }
  ]
}
```

### Error responses

- `401` → `{"error":"Unauthorized."}`
- `500` → `{"error":"Something went wrong."}`

## PATCH /api/v2/me

Edit my profile info.

### Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request body

```json
{
  "name": "John Doe",
  "phone": "+212600000000",
  "avatar": "https://example.com/avatar.jpg"
}
```

Notes:

- `name` is required.
- `phone` and `avatar` are optional.

### Success response (200)

```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PARTICIPANT",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "+212600000000"
  }
}
```

### Error responses

- `400` → `{"error":"Name is required."}`
- `401` → `{"error":"Unauthorized."}`
- `500` → `{"error":"Something went wrong."}`

## GET /api/v2/events

Get valid events (public list) with optional filters.

### Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

Default validity rule:

- `status` in `PUBLISHED` or `ONGOING`
- `dateEnd >= now`

### Query params (optional)

- `q` → search in title and description
- `status` → one of `DRAFT`, `PUBLISHED`, `ONGOING`, `COMPLETED`, `CANCELLED`
- `location` → partial location match
- `category` → partial category match
- `companyId` → exact company id
- `speaker` → `true` to include `speakers` per event
- `withsession` → `true` to include `sessions` per event
- `from` → event start date >= this date (`ISO date`)
- `to` → event start date <= this date (`ISO date`)
- `page` → default `1`
- `limit` → default `20`, max `100`

### Example request

`GET /api/v2/events?q=dev&location=casablanca&from=2026-06-01&page=1&limit=10`

### Success response (200)

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 2,
  "totalPages": 1,
  "filters": {
    "q": "dev",
    "status": null,
    "location": "casablanca",
    "category": null,
    "companyId": null,
    "speaker": false,
    "withsession": false,
    "from": "2026-06-01T00:00:00.000Z",
    "to": null
  },
  "events": [
    {
      "id": "cle...",
      "title": "DevFest Morocco 2026",
      "description": "...",
      "location": "Casablanca",
      "status": "PUBLISHED",
      "category": "Tech",
      "dateStart": "2026-06-10T09:00:00.000Z",
      "dateEnd": "2026-06-11T18:00:00.000Z",
      "banner": null,
      "attendeesCount": 150,
      "ticketsSold": 70,
      "price": 100,
      "company": {
        "id": "clc...",
        "name": "EventScan"
      }
    }
  ]
}
```

### Error responses

- `401` → `{"error":"Unauthorized."}`
- `500` → `{"error":"Something went wrong."}`

## GET /api/v2/tickets

Get my tickets (authenticated user) with optional filters.

### Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Query params (optional)

- `q` → search in related event title/location
- `status` → one of `ACTIVE`, `USED`, `CANCELLED`, `EXPIRED`
- `type` → one of `VIP`, `STANDARD`, `FREE`, `EARLY_BIRD`
- `eventId` → exact event id
- `page` → default `1`
- `limit` → default `20`, max `100`

### Example request

`GET /api/v2/tickets?status=ACTIVE&type=STANDARD&page=1&limit=10`

### Success response (200)

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1,
  "filters": {
    "q": null,
    "status": "ACTIVE",
    "type": "STANDARD",
    "eventId": null,
    "from": null,
    "to": null
  },
  "tickets": [
    {
      "id": "clt...",
      "eventId": "cle...",
      "type": "STANDARD",
      "price": 100,
      "status": "ACTIVE",
      "event": {
        "id": "cle...",
        "title": "DevFest Morocco 2026",
        "location": "Casablanca",
        "status": "PUBLISHED",
        "dateStart": "2026-06-10T09:00:00.000Z",
        "dateEnd": "2026-06-11T18:00:00.000Z",
        "banner": null
      }
    }
  ]
}
```

### Error responses

- `401` → `{"error":"Unauthorized."}`
- `500` → `{"error":"Something went wrong."}`

## POST /api/v2/tickets/buy

Buy a ticket for an event (authenticated user).

### Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request body

```json
{
  "eventId": "cle...",
  "ticketType": "STANDARD"
}
```

Notes:

- `eventId` is required.
- `ticketType` is required and must be one of `VIP`, `STANDARD`, `FREE`, `EARLY_BIRD`.
- A user can only have one active/used ticket per event.

### Success response (200)

```json
{
  "success": true,
  "ticketId": "clt..."
}
```

### Error responses

- `400` → `{"error":"Event id is required"}`
- `400` → `{"error":"Ticket type is required"}`
- `400` → `{"error":"You already have a ticket for this event"}`
- `400` → `{"error":"Selected ticket type is sold out"}`
- `401` → `{"error":"Unauthorized."}`
- `404` → `{"error":"Event not found"}`
- `500` → `{"error":"Failed to buy ticket."}`

## POST /api/v2/scan-ticket

Scan and validate a ticket.

Role required:

- `SCANNER`

### Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request body

```json
{
  "code": "ticket:clt...",
  "eventId": "cle..."
}
```

Notes:

- `code` is required.
- `eventId` is required.
- `code` can be raw ticket id (`clt...`) or prefixed (`ticket:clt...`).

### Success response (200)

```json
{
  "success": true,
  "message": "Ticket validated successfully.",
  "ticket": {
    "id": "clt...",
    "type": "STANDARD",
    "attendeeName": "John Doe",
    "attendeeEmail": "user@example.com",
    "eventId": "cle...",
    "eventTitle": "DevFest Morocco 2026",
    "scannedAt": "2026-03-14T12:00:00.000Z"
  }
}
```

### Error responses

- `400` → `{"error":"Ticket code is required."}`
- `400` → `{"error":"Event ID is required."}`
- `400` → `{"error":"This ticket is not for the selected event."}`
- `400` → `{"error":"This ticket has no attendee assigned."}`
- `401` → `{"error":"Unauthorized."}`
- `403` → `{"error":"Forbidden. SCANNER role is required."}`
- `404` → `{"error":"Invalid ticket code."}`
- `409` → `{"error":"Ticket already checked in.","alreadyScanned":true,...}`
- `500` → `{"error":"Failed to validate ticket."}`

## JWT usage

- The `jwt` is generated by server auth logic (`signAuthToken`) and currently expires in `7d`.
- Send it in protected endpoint requests as:

```http
Authorization: Bearer <JWT_TOKEN>
```
