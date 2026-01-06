# Phoenix2 Architecture

## System Overview

```
+----------------------------------------------------------+
|                    Phoenix2 Platform                      |
+----------------------------------------------------------+
|                                                          |
|  +-------------------+    +-------------------------+    |
|  |   React Frontend  |<-->|    FastAPI Backend      |    |
|  |   (Port 3000)     |    |    (Port 8000)          |    |
|  +-------------------+    +-------------------------+    |
|                                |                         |
|                    +-----------+-----------+             |
|                    |                       |             |
|           +--------v--------+    +--------v--------+    |
|           |   Platform      |    |   Chipset       |    |
|           |   Orchestrator  |    |   Orchestrator  |    |
|           +-----------------+    +-----------------+    |
|                    |                       |             |
+----------------------------------------------------------+

## AI Workers (Claude Opus 4.5 Pattern)

### Emulation Platform Workers (7)

1. DocumentParserWorker
   - Parse YAML, JSON, Markdown specs
   - Extract capabilities and requirements

2. EmulatorGeneratorWorker
   - Generate Docker configurations
   - Create emulator from specs

3. RegistryManagerWorker
   - Manage emulator registry
   - Store tests and reports

4. BootTestGeneratorWorker
   - Generate boot sequence tests
   - Cold boot, warm boot, timing

5. FeatureTestGeneratorWorker
   - Generate feature tests
   - Map to requirements

6. TestExecutorWorker
   - Execute tests in emulator
   - Collect evidence

7. ReportGeneratorWorker
   - Generate comprehensive reports
   - Recommendations

### Chipset Workers (5)

1. ChipsetProfileWorker - Vendor profiles
2. HardwareAbstractionWorker - HAL generation
3. BootSequenceSimulatorWorker - Boot simulation
4. PeripheralEmulatorWorker - Peripheral emulation
5. RegisterMapWorker - Register/memory maps

## Data Flow

```
Spec Documents --> DocumentParser --> EmulatorGenerator
                                            |
                                            v
                                    RegistryManager
                                            |
                        +-------------------+-------------------+
                        |                                       |
                        v                                       v
               BootTestGenerator                    FeatureTestGenerator
                        |                                       |
                        +-------------------+-------------------+
                                            |
                                            v
                                    TestExecutor
                                            |
                                            v
                                    ReportGenerator
```

## Technology Decisions

| Component | Technology | Reason |
|-----------|------------|--------|
| Backend | FastAPI | Async, OpenAPI, Python ecosystem |
| Frontend | React + Vite | Fast dev, component model |
| Styling | Tailwind | Utility-first, rapid UI |
| State | React Hooks | Simple, built-in |
| API | REST + JSON | Universal, simple |
```
