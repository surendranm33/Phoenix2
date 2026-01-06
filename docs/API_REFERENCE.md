# Phoenix2 API Reference

Base URL: `http://localhost:8000`

## Platform Endpoints

### GET /api/v1/platform/status
Get platform and worker status.

**Response:**
```json
{
  "available": true,
  "version": "1.0.0",
  "workers": {
    "document_parser": "idle",
    "emulator_generator": "idle"
  }
}
```

### POST /api/v1/platform/parse-document
Parse a specification document.

**Request:** `multipart/form-data`
- `file`: Specification file (.yaml, .json, .md)

**Response:**
```json
{
  "status": "success",
  "capabilities_count": 4,
  "requirements_count": 3,
  "hardware_spec": {...}
}
```

### POST /api/v1/platform/create-emulator
Create emulator from specifications.

**Query Parameters:**
- `board_name` (required): Name of the board
- `emulator_id` (optional): Custom ID

**Request:** `multipart/form-data`
- `spec_files`: One or more specification files

### POST /api/v1/platform/generate-tests/{emulator_id}
Generate test cases for an emulator.

### POST /api/v1/platform/run-workflow
Run complete emulation workflow.

**Query Parameters:**
- `board_name` (required)
- `emulator_id` (optional)

**Request:** `multipart/form-data`
- `spec_files`: Specification files
- `firmware_file`: Firmware binary

**Response:**
```json
{
  "workflow_id": "WF_ABC123",
  "emulator_id": "EMU_XYZ789",
  "tests_generated": 12,
  "verdict": "PASS",
  "summary": {
    "passed": 11,
    "failed": 1,
    "pass_rate": 91.7
  }
}
```

### GET /api/v1/platform/registry/emulators
List all registered emulators.

### GET /api/v1/platform/registry/tests/{emulator_id}
Get tests for an emulator.

### GET /api/v1/platform/registry/reports
List all reports.

## Chipset Endpoints

### GET /api/v1/chipset/supported
List all supported chipsets grouped by vendor.

### GET /api/v1/chipset/vendors
List supported vendors.

### GET /api/v1/chipset/profile/{chipset_id}
Get detailed chipset profile.

**Example:** `/api/v1/chipset/profile/IPQ9574`

### POST /api/v1/chipset/initialize/{chipset_id}
Initialize chipset emulator.

### POST /api/v1/chipset/boot-simulation/{chipset_id}
Run boot sequence simulation.

### GET /api/v1/chipset/hal/{chipset_id}
Get Hardware Abstraction Layer configuration.

## Health Check

### GET /health
```json
{
  "status": "healthy",
  "service": "phoenix2"
}
```
