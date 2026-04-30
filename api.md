# Backend API Reference

Base URL: `https://api.magazineguessr.com`

---

## Authentication

Admin endpoints require an `Authorization` header with the admin key:

```
Authorization: your-admin-key
```

The key is stored in AWS Secrets Manager as 'admin-key'. To find it follow these steps:
```
Secrets Manager -> Secrets -> admin-key -> overview -> Retrieve secret value
```

---

## Public Endpoints

### GET /daily/{YYYY-MM-DD}

Returns the 3 magazines for the given date. The `year` field is stripped.

**Response**
```json
[
  {
    "date": "2024-06-01",
    "nr": 1,
    "identifier": "vogue196506",
    "title": "Vogue",
    "pageRange": [1, 7],
    "startPage": 1,
    "redactions": [
      { "page": 2, "x": 120, "y": 45, "width": 200, "height": 30 }
    ]
  },
  { "nr": 2, "..." : "..." },
  { "nr": 3, "..." : "..." }
]
```

If fewer than 3 magazines exist in the DB for the given date, the missing slots are filled from `fallback.json`.

---

### POST /daily/{YYYY-MM-DD}/{nr}/guess

Submit a year guess for a specific magazine. `nr` is 1-indexed.

**Request**
```json
{ "year": 1965 }
```

**Response**
```json
{
  "correct_year": 1971,
  "difference": 6,
  "score": 94
}
```

Score formula: `Math.max(0, 100 - difference)`. Max 100 per round, 300 per day.

---

### GET /health

Returns `{ "status": "ok" }`. Used by the ALB health check.

---

## Admin Endpoints

All admin routes require the `Authorization` header.

---

### GET /admin/magazines/{YYYY-MM-DD}

Returns all magazines for a date including the `year` field.

**Response**
```json
[
  {
    "date": "2024-06-01",
    "nr": 1,
    "identifier": "vogue196506",
    "title": "Vogue",
    "year": 1965,
    "pageRange": [1, 7],
    "redactions": []
  }
]
```

---

### PUT /admin/magazines

Accepts any number of magazines across any dates in one call and puts them in the database.

**Request**
```json
{
  "magazines": [
    {
      "date": "2024-06-01",
      "nr": 1,
      "identifier": "vogue196506",
      "title": "Vogue",
      "year": 1965,
      "pageRange": [1, 7],
      "redactions": []
    }
  ]
}
```

---

### DELETE /admin/magazines

Batch delete magazines by date and nr.

**Request**
```json
{
  "magazines": [
    { "date": "2024-06-01", "nr": 1 }
  ]
}
```

---

### PATCH /admin/magazines/{YYYY-MM-DD}/{nr}

Edit single magazine. Handles key changes (date/nr) by deleting the old record and writing the new one.

**Request**
```json
{
  "magazine": {
    "date": "2024-06-01",
    "nr": 1,
    "identifier": "vogue196506",
    "title": "Vogue",
    "year": 1965,
    "pageRange": [1, 7],
    "redactions": []
  }
}
```

**Response**
```json
{
  "deleted": { "...": "the old item that was removed" },
  "previous": { "...": "whatever was already at the new date/nr" }
}
```
