# Phoenix2 User Guide

## Getting Started

### 1. Start the Platform

```bash
# Option 1: Use startup script
./scripts/start.sh

# Option 2: Manual start
cd backend && python server.py  # Terminal 1
cd frontend && npm run dev       # Terminal 2
```

### 2. Access the UI

Open http://localhost:3000 in your browser.

## Running a Workflow

### Step 1: Prepare Specification Document

Create a YAML file describing your board:

```yaml
board:
  name: "My Custom Board"
  vendor: "qualcomm"

processor:
  type: "ARM Cortex-A53"
  cores: 4

memory:
  ram:
    size: "2GB"
  flash:
    size: "256MB"

capabilities:
  - id: "CAP-001"
    name: "Secure Boot"
    category: "security"
    testable: true

requirements:
  - id: "REQ-001"
    description: "Boot time under 30 seconds"
    priority: "high"
```

### Step 2: Navigate to Emulation Platform

Click "Emulation Platform" in the sidebar.

### Step 3: Configure Workflow

1. Enter **Board Name**
2. Upload **Specification Documents** (drag & drop or click)
3. Upload **Firmware Binary**

### Step 4: Run Workflow

Click "Run Complete Workflow" button.

The platform will:
1. Parse your specification documents
2. Generate emulator configuration
3. Create boot and feature tests
4. Execute tests with your firmware
5. Generate a comprehensive report

### Step 5: View Results

- **Summary**: Tests passed/failed, pass rate
- **Report ID**: Reference for future access
- **Recommendations**: Actionable insights

## Managing Emulators

### Registry Tab

View all created emulators with:
- Emulator ID
- Board name
- SOC/Vendor info
- Status

### Generate Additional Tests

Click "Generate Tests" on any emulator card.

### View Test Cases

Click "View Tests" to see all test cases for an emulator.

## Viewing Reports

### Reports Tab

Lists all generated reports with:
- Report ID
- Verdict (PASS/CONDITIONAL/FAIL)
- Timestamp

## Chipset Profiles

### Chipset Profiles Page

View supported chipsets by vendor:
- Qualcomm: IPQ9574
- MediaTek: MT7986
- Broadcom: BCM6755
- Airoha: AN7581
- Amlogic: S905X4
- Realtek: RTL9607C

Each profile shows:
- Architecture
- CPU cores and frequency
- RAM size
- Special features

## API Access

Access http://localhost:8000/docs for interactive API documentation.

## Troubleshooting

### Backend not starting
```bash
pip install fastapi uvicorn python-multipart pyyaml
```

### Frontend not starting
```bash
cd frontend && npm install
```

### CORS errors
Ensure backend is running on port 8000 before starting frontend.
