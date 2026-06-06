# RRA-PSF Quitus API - Quick Guide

## Developer: PSF IT Team
## PSF Address: https://psf.org.rw

API Purpose: Facilitate the exchange of RRA Tax Clearance (Quitus) status information with the Private Sector Federation (PSF).

## Base URL
```
https://psf.org.rw
```

## Authentication
All endpoints require API key in header:
```
x-api-key: YOUR_API_KEY
```

---

## Endpoints

### 1. Get Eligible Members by Year
```http
GET /gateway/rra/quitus/eligible-members/{year}
```

**Example:**
```bash
curl -H "x-api-key: RRA_API_KEY" \
  https://psf.org.rw/gateway/rra/quitus/eligible-members/2025
```

**Response:**
```json
{
  "success": true,
  "count": 14,
  "data": [
    {
      "taxpayer_tin": "100001234",
      "taxpayer_name": "TestCompany @PSF Ltd",
      "taxpayer_phone": "0788883333",
      "taxpayer_email": "test.co@psf.org.rw",
      "fiscal_year": 2025,
      "eligible_for_quitus": "Yes"
    }
  ]
}
```

---

### 2. Search Members by Name
```http
GET /gateway/rra/quitus/search-member?name={name}&year={year}&status={status}
```

**Parameters:**
- `name` (required) - Company name or partial name
- `year` (optional) - Fiscal year (e.g., 2025)
- `status` (optional) - `eligible` (default), `active`, or `all`

**Examples:**
```bash
# Search by name
curl -H "x-api-key: RRA_API_KEY" \
  "https://psf.org.rw/gateway/rra/quitus/search-member?name=MINING"

# Search with filters
curl -H "x-api-key: RRA_API_KEY" \
  "https://psf.org.rw/gateway/rra/quitus/search-member?name=SHIJI&year=2025"
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "search_criteria": {
    "name": "MINING",
    "year": "2025",
    "status": "eligible"
  },
  "data": [...]
}
```

---

### 3. Update Quitus Status
```http
POST /gateway/psf/quitus/status-update
```

**Request Body:**
```json
{
  "updates": [
    {
      "quitus_reference": "QT-2025-001",
      "taxpayer_tin": "100001234",
      "status": "ISSUED",
      "reason": "Certificate issued"
    }
  ]
}
```

**Status Values:** `ISSUED`, `REVOKED`, `EXPIRED`

**Example:**
```bash
curl -X POST \
  -H "x-api-key: RRA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"updates":[{"quitus_reference":"QT-001","taxpayer_tin":"123","status":"ISSUED","reason":"Compliant"}]}' \
  https://psf.org.rw/gateway/psf/quitus/status-update
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "successful_updates": [...]
}
```

---

## Error Responses

### Missing API Key (401)
```json
{
  "success": false,
  "message": "Access denied. No API key provided.",
  "error": "MISSING_API_KEY"
}
```

### Invalid API Key (403)
```json
{
  "success": false,
  "message": "Access denied. Invalid API key.",
  "error": "INVALID_API_KEY"
}
```

### No Results (404)
```json
{
  "success": true,
  "message": "No members found",
  "count": 0,
  "data": []
}
```

---

## Quick Integration Using Node.js (Test)

### JavaScript
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://psf.org.rw',
  headers: { 'x-api-key': 'RRA_API_KEY' }
});

// Get eligible members
const members = await api.get('/gateway/rra/quitus/eligible-members/2025');

// Search by name
const results = await api.get('/gateway/rra/quitus/search-member?name=MINING');

// Update status
await api.post('/gateway/psf/quitus/status-update', {
  updates: [{ quitus_reference: 'QT-001', taxpayer_tin: '123', status: 'ISSUED' }]
});
```

---

## Support
- Call PSF IT team 0788899902 (Head of IT), 0784557411 (Software Dev)