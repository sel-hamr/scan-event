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
- `speaker=true` → with `event=true`, include `speakers`.
- `sponsor=true` → with `event=true`, include `sponsors`.
- `exposant=true` → with `event=true`, include `exposants`.
- `withsession=true` → with `event=true`, include `sessions` per event.

Examples:

- `GET /api/v2/me?event=true&speaker=true`
- `GET /api/v2/me?event=true&sponsor=true`
- `GET /api/v2/me?event=true&exposant=true`
- `GET /api/v2/me?event=true&speaker=true&sponsor=true&exposant=true&withsession=true`

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

### Success response with events + speakers + sponsors + exposants + sessions (200)

`GET /api/v2/me?event=true&speaker=true&sponsor=true&exposant=true&withsession=true`

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
          "company": "orcheo"
        }
      ],
      "sponsors": [
        {
          "id": "clsp...",
          "name": "Main Sponsor",
          "company": "Big Corp",
          "tier": "GOLD",
          "logo": null
        }
      ],
      "exposants": [
        {
          "id": "clex...",
          "name": "Booth Team",
          "email": "booth@example.com",
          "company": "Startup Inc",
          "standNumber": "A-12"
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
            "company": "orcheo"
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
- `speaker` → included by default; set `speaker=false` to exclude `speakers`
- `sponsor` → included by default; set `sponsor=false` to exclude `sponsors`
- `exposant` → included by default; set `exposant=false` to exclude `exposants`
- `withsession` → `true` to include `sessions` per event
- `from` → event start date >= this date (`ISO date`)
- `to` → event start date <= this date (`ISO date`)
- `page` → default `1`
- `limit` → default `20`, max `100`

Examples:

- `GET /api/v2/events?speaker=true`
- `GET /api/v2/events?sponsor=true`
- `GET /api/v2/events?exposant=true`
- `GET /api/v2/events?speaker=true&sponsor=true&exposant=true&withsession=true`

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
    "sponsor": false,
    "exposant": false,
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
        "name": "orcheo"
      }
    }
  ]
}
```

### Error responses

- `401` → `{"error":"Unauthorized."}`
- `500` → `{"error":"Something went wrong."}`

## GET /api/v2/event/:id

Get one event by id with full related data: tickets, sponsors, speakers, company, exposants, and sessions.

### Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Path params

- `id` → event id

### Access rules

- `SUPER_ADMIN` and `ORGANISATEUR` can access any event.
- Other roles can access only events with status `PUBLISHED`, `ONGOING`, or `COMPLETED`.

### Example request

`GET /api/v2/event/cle1234567890`

### Success response (200)

```json
{
  "success": true,
  "event": {
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
    "revenue": 7000,
    "dateEndRegistration": "2026-06-09T23:59:59.000Z",
    "typeTicket": "STANDARD",
    "price": 100,
    "company": {
      "id": "clc...",
      "name": "orcheo",
      "description": "...",
      "logo": null,
      "website": "https://orcheo.example",
      "phone": "+212600000000",
      "email": "hello@orcheo.example",
      "address": "Casablanca"
    },
    "sponsors": [
      {
        "id": "clsp...",
        "name": "Main Sponsor",
        "company": "Big Corp",
        "tier": "GOLD",
        "logo": null
      }
    ],
    "exposants": [
      {
        "id": "clex...",
        "name": "Booth Team",
        "email": "booth@example.com",
        "company": "Startup Inc",
        "standNumber": "A-12"
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
          "company": "orcheo"
        }
      }
    ],
    "speakers": [
      {
        "id": "cls...",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar": null,
        "bio": "Senior Engineer",
        "topic": "Modern Web",
        "company": "orcheo"
      }
    ],
    "tickets": [
      {
        "id": "clt...",
        "eventId": "cle...",
        "type": "STANDARD",
        "price": 100,
        "status": "ACTIVE",
        "userId": "clu...",
        "user": {
          "id": "clu...",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": null
        }
      }
    ],
    "ticketCounts": {
      "total": 150,
      "sold": 70,
      "available": 80,
      "byStatus": {
        "ACTIVE": 80,
        "USED": 65,
        "CANCELLED": 3,
        "EXPIRED": 2
      },
      "byType": {
        "STANDARD": 100,
        "VIP": 30,
        "FREE": 10,
        "EARLY_BIRD": 10
      }
    }
  }
}
```

### Error responses

- `401` → `{"error":"Unauthorized."}`
- `404` → `{"error":"Event not found."}`
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

## GET /api/v2/networking/users

List users for networking (excluding the authenticated user), with relation/request info.

### Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Query params (optional)

- `q` → search in user `name`, `email`, or `company` name
- `hasRequest` → `true` (only users that already have request relation), `false` (only users with no request relation)
- `page` → default `1`
- `limit` → default `20`, max `100`

### Example requests

- `GET /api/v2/networking/users?page=1&limit=10`
- `GET /api/v2/networking/users?q=john&hasRequest=true`
- `GET /api/v2/networking/users?hasRequest=false`

### Success response (200)

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 2,
  "totalPages": 1,
  "filters": {
    "q": "john",
    "hasRequest": true
  },
  "users": [
    {
      "id": "clu...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "PARTICIPANT",
      "avatar": null,
      "company": {
        "id": "clc...",
        "name": "orcheo"
      },
      "hasRequest": true,
      "request": {
        "id": "clr...",
        "status": "PENDING",
        "direction": "OUTGOING",
        "senderId": "me...",
        "receiverId": "clu...",
        "message": "I'd like to connect with you.",
        "eventId": "cle...",
        "createdAt": "2026-03-15T10:00:00.000Z"
      }
    }
  ]
}
```

### Error responses

- `401` → `{"error":"Unauthorized."}`
- `500` → `{"error":"Something went wrong."}`

## POST /api/v2/networking/request

Send a networking request to another user.

### Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request body

```json
{
  "receiverId": "clu...",
  "message": "I'd like to connect with you.",
  "eventId": "cle..."
}
```

Notes:

- `receiverId` is required.
- `message` is optional (default message is used if omitted).
- `eventId` is optional (if omitted, latest event is used).

### Success response (200)

```json
{
  "success": true,
  "request": {
    "id": "clr...",
    "senderId": "me...",
    "receiverId": "clu...",
    "status": "PENDING",
    "message": "I'd like to connect with you.",
    "eventId": "cle...",
    "createdAt": "2026-03-15T10:00:00.000Z"
  }
}
```

### Error responses

- `400` → `{"error":"Invalid receiver."}`
- `400` → `{"error":"No event available for networking request."}`
- `401` → `{"error":"Unauthorized."}`
- `404` → `{"error":"User not found."}`
- `409` → `{"error":"A pending request already exists with this user."}`
- `409` → `{"error":"You are already connected with this user."}`
- `500` → `{"error":"Something went wrong."}`

## PATCH /api/v2/networking/request/:id

Accept or refuse (reject) a networking request.

### Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

### Path params

- `id` → networking request id

### Request body

```json
{
  "action": "ACCEPT"
}
```

You can use any of these values in `action` (or `status`):

- accept: `ACCEPT`, `ACCEPTED`
- refuse/reject: `REFUSE`, `REFUSED`, `REJECT`, `REJECTED`

### Example requests

- `PATCH /api/v2/networking/request/clr...` with `{ "action": "ACCEPT" }`
- `PATCH /api/v2/networking/request/clr...` with `{ "action": "REFUSE" }`

### Success response (200)

```json
{
  "success": true,
  "request": {
    "id": "clr...",
    "senderId": "clu_sender...",
    "receiverId": "clu_receiver...",
    "status": "ACCEPTED",
    "message": "I'd like to connect with you.",
    "eventId": "cle...",
    "createdAt": "2026-03-15T10:00:00.000Z"
  }
}
```

### Error responses

- `400` → `{"error":"Invalid action. Use action/status: ACCEPT (or ACCEPTED) / REFUSE (or REJECT)."}`
- `401` → `{"error":"Unauthorized."}`
- `403` → `{"error":"Forbidden. Only request receiver can update status."}`
- `404` → `{"error":"Networking request not found."}`
- `409` → `{"error":"Only pending requests can be updated."}`
- `500` → `{"error":"Something went wrong."}`

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
