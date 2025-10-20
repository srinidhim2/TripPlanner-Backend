# API cURL Requests (generated from Postman collection)

This file contains cURL equivalents for the Postman collection `TripPlanner.postman_collection.json` organized by service and endpoint.

Replace the host variables before running (`{{trip_planner_host}}`, `{{trip_planner_host_TP}}`, `{{trip_planner_host_NS}}`, `{{trip_planner_token}}`).

## User Service (assume host: http://localhost:3003)

### Create User

```bash
curl -X POST http://localhost:3003/user/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John 15",
    "dateOfBirth": "1990-05-15",
    "email": "john.doe0@example.com",
    "phone": "9876543210",
    "gender": "male",
    "password": "password"
  }'
```

### Upload Profile Photo

```bash
curl -X POST http://localhost:3003/user/68a147108c4cfde7220a7116/photo \
  -H "Authorization: Bearer <token>" \
  -F "profilePhoto=@/path/to/Royal-Enfield-Guerrilla-450-6.jpg"
```

### Get User by ID

```bash
curl -X GET http://localhost:3003/user/68a219dfbce3ba773f9471f0 \
  -H "Authorization: Bearer <token>"
```

### Get Profile Photo

```bash
curl -X GET http://localhost:3003/user/68a219dfbce3ba773f9471f0/photo \
  -H "Authorization: Bearer <token>"
```

### Login (extract token)

```bash
curl -X POST http://localhost:3003/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe7@example.com","password":"password"}'
```

Note: response contains a JSON with `token`. Save it to use in subsequent requests.

### Logout

Using header:

```bash
curl -X POST http://localhost:3003/user/logout \
  -H "Authorization: Bearer <token>"
```

Or using cookie:

```bash
curl -X POST http://localhost:3003/user/logout \
  --cookie "token=<token>"
```

### Update User

```bash
curl -X PATCH http://localhost:3003/user/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"New Name","phone":"123-456-7890"}'
```


## Friend APIs (User service)

### Send Friend Request

```bash
curl -X POST http://localhost:3003/friend/sendRequest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"partyB":"68b2b94451ed1536821e836d"}'
```

### Show Received Requests

```bash
curl -X GET http://localhost:3003/friend/showRequests \
  -H "Authorization: Bearer <token>"
```

### Respond to Request

```bash
curl -X PATCH http://localhost:3003/friend/respondToRequest/68a4a54a8ae6f7d995b327e4 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"action":"accept"}'
```

### Show Friends

```bash
curl -X GET http://localhost:3003/friend/showFriends \
  -H "Authorization: Bearer <token>"
```

### Remove Friend

```bash
curl -X DELETE http://localhost:3003/friend/removeFriend/68b2b94451ed1536821e836d \
  -H "Authorization: Bearer <token>"
```


## Notification Service (assume host: http://localhost:3005)

### Get all notifications

```bash
curl -X GET http://localhost:3005/notifications/ \
  -H "Authorization: Bearer <token>"
```

### Toggle notification read state

```bash
curl -X PATCH http://localhost:3005/notifications/68a868d256473ac20db9c2fe/toggle \
  -H "Authorization: Bearer <token>"
```

### Change read status for all notifications

```bash
curl -X PATCH http://localhost:3005/notifications/all \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"read": false}'
```


## Trip Service (assume host: http://localhost:3004)

### Create Trip

```bash
curl -X POST http://localhost:3004/createTrip \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name":"Goa Adventure",
    "startDate":"2025-09-10T10:00:00.000Z",
    "endDate":"2025-09-15T20:00:00.000Z",
    "schedules":[
      {"id":"meetup-001","status":"pending","targetTime":"2025-09-10T08:00:00.000Z"},
      {"id":"ride-start-001","status":"pending","targetTime":"2025-09-10T09:00:00.000Z"}
    ],
    "places":["Home","Baga Beach","Fort"],
    "peoples":[{"userId":"68a147108c4cfde7220a7116","role":"member","status":"tentative"}]
  }'
```

### Edit Trip

```bash
curl -X PATCH http://localhost:3004/updateTrip/68acc250e07737f215ad77b9 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Goa Adventure 1"}'
```

### Get Trips Created By Me

```bash
curl -X GET http://localhost:3004/getTrip/createdByMe \
  -H "Authorization: Bearer <token>"
```

### Get Trips I Participate In

```bash
curl -X GET http://localhost:3004/getTrip/all \
  -H "Authorization: Bearer <token>"
```

### Get Trip by ID

```bash
curl -X GET http://localhost:3004/getTrip/68acbd4497066b59dcbde3fb \
  -H "Authorization: Bearer <token>"
```

### Get all schedules by trip id

```bash
curl -X GET http://localhost:3004/68e26ff2bad025af321a6393/schedules \
  -H "Authorization: Bearer <token>"
```

### Add Schedule

```bash
curl -X POST http://localhost:3004/68e26ff2bad025af321a6393/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"id":"schedule123","status":"pending","targetTime":"2025-10-06T10:30:00.000Z"}'
```

### Update Schedule

```bash
curl -X PATCH http://localhost:3004/68e26ff2bad025af321a6393/schedules/schedule123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"id":"schedule123","status":"completed","targetTime":"2025-10-05T10:30:00.000Z","completedOn":"2025-10-05T18:45:00.000Z"}'
```

### Get Schedule By Id

```bash
curl -X GET http://localhost:3004/68e26ff2bad025af321a6393/schedules/schedule123 \
  -H "Authorization: Bearer <token>"
```


---

*Generated from Postman collection located at `/home/srinidhi/Documents/TripPlanner.postman_collection.json`.*
