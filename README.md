# Phoenix2 - Board Emulation Platform

End-to-end board emulation platform with AI-powered workers for firmware validation.

## Quick Start

```bash
# Backend
cd backend && pip install fastapi uvicorn python-multipart pyyaml
python server.py

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

**Access**: http://localhost:3000 (UI) | http://localhost:8000/docs (API)

## Features

- **12 AI Workers** using Claude Opus 4.5 pattern
- **6 Vendor Chipsets**: Qualcomm, MediaTek, Broadcom, Airoha, Amlogic, Realtek
- **Auto Test Generation**: Boot and feature tests from specifications
- **Complete Workflow**: Spec upload -> Emulator -> Tests -> Reports

## Supported Chipsets

| Vendor | Chipsets | Features |
|--------|----------|----------|
| Qualcomm | IPQ9574 | WiFi 7, 10G Ethernet |
| MediaTek | MT7986 | WiFi 6E, 2.5G Ethernet |
| Broadcom | BCM6755 | xPON, Voice |
| Airoha | AN7581 | 10G Ethernet, PCIe Gen3 |
| Amlogic | S905X4 | AV1, HDR10+ |
| Realtek | RTL9607C | GPON, EPON |

## API Endpoints

- `GET /api/v1/platform/status` - Platform status
- `POST /api/v1/platform/run-workflow` - Run complete workflow
- `GET /api/v1/chipset/supported` - List chipsets
- `POST /api/v1/chipset/initialize/{id}` - Initialize emulator

## Tech Stack

- **Backend**: FastAPI + Python 3.10+
- **Frontend**: React 18 + Vite + Tailwind
- **AI Pattern**: Claude Opus 4.5 Worker Architecture
