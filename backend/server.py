"""
Phoenix2 - Board Emulation Platform Server v1.0

A standalone FastAPI server providing:
- Complete emulation platform with 7 AI workers
- Chipset-specific emulation for 6 major vendors
- Document parsing and test generation
- Real-time boot simulation
- Comprehensive reporting

Technology Stack:
- Backend: FastAPI + Python 3.10+
- AI Workers: Claude Opus 4.5 compatible architecture
- Real-time: WebSocket support
- Data: JSON-based storage
"""

import asyncio
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Query
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
except ImportError:
    print("ERROR: FastAPI not installed. Run: pip install fastapi uvicorn python-multipart pyyaml")
    sys.exit(1)

try:
    import yaml
except ImportError:
    print("WARNING: PyYAML not installed. Run: pip install pyyaml")
    yaml = None

from emulation_platform import (
    EmulationPlatformOrchestrator,
    DocumentParserWorker,
    EmulatorGeneratorWorker,
    RegistryManagerWorker,
    BootTestGeneratorWorker,
    FeatureTestGeneratorWorker,
    TestExecutorWorker,
    ReportGeneratorWorker
)

from chipset_emulation import (
    ChipsetEmulationOrchestrator,
    chipset_orchestrator
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("phoenix2.server")

app = FastAPI(
    title="Phoenix2 - Board Emulation Platform",
    description="Complete end-to-end board emulation platform with AI-powered workers.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

platform_orchestrator = EmulationPlatformOrchestrator()

platform_router = APIRouter(prefix="/api/v1/platform", tags=["Emulation Platform"])
chipset_router = APIRouter(prefix="/api/v1/chipset", tags=["Chipset Emulation"])

@platform_router.get("/status")
async def get_platform_status():
    return {
        "available": True,
        "version": "1.0.0",
        "workers": platform_orchestrator.get_worker_statuses(),
        "workflow_status": platform_orchestrator.get_status(),
        "timestamp": datetime.now().isoformat()
    }

@platform_router.post("/parse-document")
async def parse_document(file: UploadFile = File(...)):
    try:
        content = await file.read()
        content_str = content.decode('utf-8')
        result = await platform_orchestrator.document_parser.parse_document(file.filename, content_str)
        return {
            "status": "success",
            "filename": file.filename,
            "capabilities_count": len(result.get("capabilities", [])),
            "requirements_count": len(result.get("requirements", [])),
            "hardware_spec": result.get("hardware_spec"),
            "capabilities": result.get("capabilities"),
            "requirements": result.get("requirements")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@platform_router.post("/create-emulator")
async def create_emulator(
    board_name: str = Query(...),
    emulator_id: Optional[str] = Query(None),
    spec_files: List[UploadFile] = File(...)
):
    try:
        parsed_docs = []
        for file in spec_files:
            content = await file.read()
            parsed = await platform_orchestrator.document_parser.parse_document(file.filename, content.decode('utf-8'))
            parsed_docs.append(parsed)
        config = await platform_orchestrator.emulator_generator.generate_emulator(board_name, parsed_docs, emulator_id)
        await platform_orchestrator.registry_manager.register_emulator(config)
        return {"status": "created", "emulator_id": config.emulator_id, "board_name": config.board_name}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@platform_router.post("/generate-tests/{emulator_id}")
async def generate_tests(emulator_id: str):
    try:
        from emulation_platform import EmulatorConfig, EmulatorStatus, ParsedCapability, ParsedRequirement, TestSeverity
        emulator = platform_orchestrator.registry_manager.get_emulator(emulator_id)
        if not emulator:
            raise HTTPException(status_code=404, detail=f"Emulator {emulator_id} not found")
        capabilities = [ParsedCapability(**cap) if isinstance(cap, dict) else cap for cap in emulator.get('capabilities', [])]
        requirements = []
        for req in emulator.get('requirements', []):
            if isinstance(req, dict):
                req['severity'] = TestSeverity(req.get('severity', 'medium'))
                requirements.append(ParsedRequirement(**req))
        config = EmulatorConfig(
            emulator_id=emulator['emulator_id'], board_name=emulator['board_name'],
            soc_id=emulator['soc_id'], vendor=emulator['vendor'], architecture=emulator['architecture'],
            cpu_type=emulator['cpu_type'], cpu_cores=emulator['cpu_cores'],
            memory_mb=emulator['memory_mb'], flash_mb=emulator['flash_mb'],
            capabilities=capabilities, requirements=requirements,
            created_at=emulator['created_at'], source_documents=emulator.get('source_documents', []),
            docker_image=emulator.get('docker_image'), status=EmulatorStatus(emulator['status'])
        )
        boot_tests = await platform_orchestrator.boot_test_generator.generate_boot_tests(config)
        feature_tests = await platform_orchestrator.feature_test_generator.generate_feature_tests(config)
        all_tests = boot_tests + feature_tests
        await platform_orchestrator.registry_manager.register_tests(emulator_id, all_tests)
        return {"status": "generated", "emulator_id": emulator_id, "total_tests": len(all_tests)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@platform_router.post("/run-workflow")
async def run_complete_workflow(
    board_name: str = Query(...),
    emulator_id: Optional[str] = Query(None),
    spec_files: List[UploadFile] = File(...),
    firmware_file: UploadFile = File(...)
):
    try:
        spec_documents = []
        for file in spec_files:
            content = await file.read()
            # Try to decode as text, skip binary files with warning
            try:
                content_str = content.decode('utf-8')
                spec_documents.append({"path": file.filename, "content": content_str})
            except UnicodeDecodeError:
                # Try latin-1 as fallback for some text files
                try:
                    content_str = content.decode('latin-1')
                    spec_documents.append({"path": file.filename, "content": content_str})
                except:
                    logger.warning(f"Skipping binary file: {file.filename}")
                    continue

        if not spec_documents:
            raise HTTPException(status_code=400, detail="No valid specification documents provided. Please upload text files (.yaml, .json, .md, .txt)")

        firmware_data = await firmware_file.read()
        result = await platform_orchestrator.run_complete_workflow(
            board_name=board_name, spec_documents=spec_documents,
            firmware_binary=firmware_data, firmware_filename=firmware_file.filename,
            custom_emulator_id=emulator_id
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Workflow error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@platform_router.get("/registry/emulators")
async def list_emulators(vendor: Optional[str] = None):
    emulators = platform_orchestrator.registry_manager.list_emulators(vendor)
    return {"emulators": emulators, "count": len(emulators)}

@platform_router.get("/registry/tests/{emulator_id}")
async def get_tests(emulator_id: str):
    tests = platform_orchestrator.registry_manager.get_tests(emulator_id)
    if tests is None:
        raise HTTPException(status_code=404, detail="Tests not found")
    return {"emulator_id": emulator_id, "tests": tests, "count": len(tests)}

@platform_router.get("/registry/reports")
async def list_reports(emulator_id: Optional[str] = None):
    reports = platform_orchestrator.registry_manager.list_reports(emulator_id)
    return {"reports": reports, "count": len(reports)}

@chipset_router.get("/supported")
async def get_supported_chipsets():
    return await chipset_orchestrator.get_supported_chipsets()

@chipset_router.get("/vendors")
async def get_vendors():
    chipsets = await chipset_orchestrator.get_supported_chipsets()
    return {"vendors": chipsets["vendors"], "count": len(chipsets["vendors"])}

@chipset_router.get("/profile/{chipset_id}")
async def get_chipset_profile(chipset_id: str):
    from dataclasses import asdict
    profile = await chipset_orchestrator.chipset_profile_worker.get_profile(chipset_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Chipset {chipset_id} not found")
    profile_dict = asdict(profile)
    profile_dict['vendor'] = profile.vendor.value
    profile_dict['architecture'] = profile.architecture.value
    profile_dict['boot_sequence'] = [{**s, 'stage': s['stage'].value} for s in profile_dict['boot_sequence']]
    profile_dict['peripherals'] = [{**p, 'type': p['type'].value} for p in profile_dict['peripherals']]
    return profile_dict

@chipset_router.post("/initialize/{chipset_id}")
async def initialize_chipset_emulator(chipset_id: str):
    result = await chipset_orchestrator.initialize_emulator(chipset_id)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result

@chipset_router.post("/boot-simulation/{chipset_id}")
async def run_boot_simulation(chipset_id: str, firmware: Optional[UploadFile] = File(None)):
    await chipset_orchestrator.initialize_emulator(chipset_id)
    firmware_path = "/tmp/firmware.bin"
    if firmware:
        data = await firmware.read()
        with open(firmware_path, 'wb') as f:
            f.write(data)
    return await chipset_orchestrator.run_boot_simulation(firmware_path)

@chipset_router.get("/status")
async def get_chipset_emulator_status():
    return await chipset_orchestrator.get_emulator_status()

@chipset_router.get("/hal/{chipset_id}")
async def get_chipset_hal(chipset_id: str):
    profile = await chipset_orchestrator.chipset_profile_worker.get_profile(chipset_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Chipset {chipset_id} not found")
    return await chipset_orchestrator.hal_worker.create_hal(profile)

@app.get("/")
async def root():
    return {
        "name": "Phoenix2 - Board Emulation Platform",
        "version": "1.0.0",
        "endpoints": {"platform": "/api/v1/platform", "chipset": "/api/v1/chipset", "docs": "/docs"},
        "supported_vendors": ["qualcomm", "mediatek", "broadcom", "airoha", "amlogic", "realtek"],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "phoenix2", "timestamp": datetime.now().isoformat()}

app.include_router(platform_router)
app.include_router(chipset_router)

def main():
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    print(f"\n  PHOENIX2 - Board Emulation Platform v1.0")
    print(f"  Server: http://{host}:{port}")
    print(f"  Docs: http://{host}:{port}/docs\n")
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    main()
