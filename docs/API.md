# LIFECRAFT REST API Specification

**Base URL**: `http://localhost:5000/api`

All JSON responses follow the standard format:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```
Or for errors:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Detailed explanation of failure"
  }
}
```

---

## 1. System Health
### `GET /health`
Verifies backend connectivity and DB connection state.
- **Headers**: None
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "lifecraft-backend",
    "uptime": 12.4,
    "timestamp": "2026-09-12T10:00:00.000Z"
  }
}
```

---

## 2. Authentication (Member 3)
### `POST /auth/register`
Create a new user account and associated player profile.
- **Body**:
```json
{
  "username": "alex",
  "email": "alex@example.com",
  "password": "password123"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "user": { "id": "user-uuid", "username": "alex", "email": "alex@example.com" },
    "token": "eyJhbGciOi..."
  }
}
```

### `POST /auth/login`
Authenticate an existing user.
- **Body**:
```json
{
  "email": "alex@example.com",
  "password": "password123"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "user": { "id": "user-uuid", "username": "alex" },
    "token": "eyJhbGciOi..."
  }
}
```

---

## 3. Player & Progression (Member 3 & Member 2)
### `GET /player/me`
Retrieve active user's stats, level, attributes, and streak.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "player-uuid",
    "userId": "user-uuid",
    "level": 3,
    "xp": 450,
    "nextLevelXp": 820,
    "gold": 250,
    "streak": 4,
    "attributes": {
      "intelligence": 15,
      "strength": 10,
      "creativity": 12,
      "wisdom": 8,
      "discipline": 14
    },
    "unlockedRegions": ["mind", "body", "craft"]
  }
}
```

### `PATCH /player/me`
Update cosmetic customization or settings.
- **Headers**: `Authorization: Bearer <token>`

---

## 4. Quests (Member 2)
### `GET /quests`
List active and completed quests for current user.
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `?filter=active` or `?category=intelligence`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "quest-1",
      "title": "30m Cardio Run",
      "category": "strength",
      "difficulty": "medium",
      "xpReward": 50,
      "goldReward": 20,
      "completed": false,
      "createdAt": "2026-09-12T08:00:00Z"
    }
  ]
}
```

### `POST /quests`
Create a new quest.
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "title": "Study React Three Fiber",
  "description": "Read documentation and set up lighting",
  "category": "intelligence",
  "difficulty": "easy",
  "xpReward": 30,
  "goldReward": 15
}
```

### `POST /quests/:id/complete`
Mark a quest as finished, recalculate player XP, level, attributes, and gold.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "quest": { "id": "quest-1", "completed": true },
    "rewardsAwarded": { "xp": 50, "gold": 20, "attribute": "strength", "amount": 2 },
    "player": {
      "level": 4,
      "xp": 500,
      "gold": 270,
      "leveledUp": true
    }
  }
}
```

### `DELETE /quests/:id`
Delete a quest.

---

## 5. Economy & Shop (Member 3)
### `GET /economy/items`
List purchasable items from the shop.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "item-1",
      "name": "Astral Knowledge Orb",
      "type": "cosmetic",
      "price": 100,
      "regionTarget": "mind"
    }
  ]
}
```

### `POST /economy/buy`
Purchase an item with earned gold.
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "itemId": "item-1" }`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "inventoryItem": { "id": "inv-1", "itemId": "item-1", "acquiredAt": "..." },
    "remainingGold": 150
  }
}
```

### `GET /economy/inventory`
Get player's purchased items.
