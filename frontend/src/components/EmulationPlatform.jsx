/**
 * PHOENIX Emulation Platform v3.1
 *
 * Complete UI for end-to-end board emulation workflow:
 * - Upload specification/requirement documents
 * - Create emulators from specs
 * - Manage emulator registry
 * - Generate and view test cases
 * - Upload firmware and execute tests
 * - View comprehensive reports
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Play,
    Upload,
    FileText,
    Server,
    Box,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader2,
    Clock,
    Cpu,
    Layers,
    RefreshCw,
    ChevronRight,
    ChevronDown,
    Eye,
    Download,
    X,
    Activity,
    Zap,
    Terminal,
    Package,
    Plus,
    Trash2,
    Info,
    FileCode,
    Factory,
    Wrench,
    ListChecks,
    FlaskConical,
    ClipboardList,
    BarChart3,
    Settings,
    FolderUp,
    PlayCircle,
    FileSearch,
    Database,
    Workflow
} from 'lucide-react';

const API_BASE = '';

// Status Badge Component
function StatusBadge({ status, size = 'default' }) {
    const configs = {
        passed: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle },
        PASS: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle },
        failed: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: XCircle },
        FAIL: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: XCircle },
        running: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', icon: Loader2 },
        pending: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', icon: Clock },
        CONDITIONAL: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: AlertTriangle },
        completed: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle },
        created: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', icon: Plus },
        ready: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle },
        idle: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', icon: Clock },
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    const sizeClasses = size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
    const iconSize = size === 'small' ? 'w-3 h-3' : 'w-4 h-4';

    return (
        <span className={`inline-flex items-center rounded-full font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}>
            <Icon className={`${iconSize} mr-1 ${status === 'running' ? 'animate-spin' : ''}`} />
            {status}
        </span>
    );
}

// Document Upload Component
function DocumentUpload({ onUpload, uploading, documents }) {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files) {
            onUpload(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            onUpload(Array.from(e.target.files));
        }
    };

    return (
        <div className="space-y-3">
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    dragActive
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".yaml,.yml,.json,.md,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {uploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-2" />
                        <p className="text-sm text-gray-400">Uploading documents...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <FileCode className="w-8 h-8 text-gray-500 mb-2" />
                        <p className="text-sm text-gray-400">
                            Drag & drop specification documents
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Supports: .yaml, .yml, .json, .md, .txt
                        </p>
                    </div>
                )}
            </div>

            {documents.length > 0 && (
                <div className="space-y-2">
                    {documents.map((doc, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-gray-800 rounded-lg"
                        >
                            <div className="flex items-center">
                                <FileText className="w-4 h-4 text-blue-400 mr-2" />
                                <span className="text-sm text-gray-300">{doc.name}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                    ({(doc.size / 1024).toFixed(1)} KB)
                                </span>
                            </div>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Emulator Card Component
function EmulatorCard({ emulator, onSelect, onGenerateTests, onViewTests, selected }) {
    return (
        <div
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selected
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            onClick={() => onSelect(emulator)}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-blue-400">{emulator.id}</span>
                <StatusBadge status={emulator.status} size="small" />
            </div>
            <h4 className="text-sm font-medium text-gray-200 mb-1">{emulator.board_name}</h4>
            <div className="text-xs text-gray-500 space-y-1">
                <div>SOC: {emulator.soc_id}</div>
                <div>Vendor: {emulator.vendor}</div>
                <div className="flex items-center">
                    <Layers className="w-3 h-3 mr-1" />
                    {emulator.capabilities_count || 0} capabilities
                </div>
            </div>
            <div className="mt-3 flex space-x-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onGenerateTests(emulator.id); }}
                    className="flex-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                >
                    Generate Tests
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onViewTests(emulator.id); }}
                    className="flex-1 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                >
                    View Tests
                </button>
            </div>
        </div>
    );
}

// Test Case Card Component
function TestCaseCard({ test }) {
    const [expanded, setExpanded] = useState(false);
    const severityColors = {
        critical: 'text-red-400',
        high: 'text-orange-400',
        medium: 'text-yellow-400',
        low: 'text-green-400'
    };

    return (
        <div className="border border-gray-700 rounded-lg bg-gray-800/50">
            <div
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-700/30"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center space-x-3">
                    <FlaskConical className="w-4 h-4 text-purple-400" />
                    <div>
                        <span className="text-sm text-gray-200">{test.name}</span>
                        <div className="text-xs text-gray-500">{test.id}</div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`text-xs ${severityColors[test.severity] || 'text-gray-400'}`}>
                        {test.severity}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-400">
                        {test.category}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {expanded && (
                <div className="p-3 border-t border-gray-700 bg-gray-900/30 text-sm">
                    <p className="text-gray-400 mb-3">{test.description}</p>

                    <div className="mb-3">
                        <h5 className="text-xs font-medium text-gray-500 mb-1">PRECONDITIONS</h5>
                        <ul className="text-xs text-gray-400 space-y-1">
                            {test.preconditions?.map((p, i) => (
                                <li key={i} className="flex items-start">
                                    <span className="mr-2">-</span>
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-3">
                        <h5 className="text-xs font-medium text-gray-500 mb-1">STEPS</h5>
                        <ol className="text-xs text-gray-400 space-y-1">
                            {test.steps?.map((step, i) => (
                                <li key={i} className="flex items-start">
                                    <span className="mr-2 text-gray-500">{i + 1}.</span>
                                    <div>
                                        <span className="text-gray-300">{step.action}</span>
                                        <span className="text-gray-500"> → {step.expected}</span>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div>
                        <h5 className="text-xs font-medium text-gray-500 mb-1">EXPECTED RESULTS</h5>
                        <ul className="text-xs text-green-400 space-y-1">
                            {test.expected_results?.map((r, i) => (
                                <li key={i} className="flex items-start">
                                    <CheckCircle className="w-3 h-3 mr-2 mt-0.5" />
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

// Report Card Component
function ReportCard({ report, onView }) {
    const verdictColors = {
        PASS: 'text-green-400',
        CONDITIONAL: 'text-yellow-400',
        FAIL: 'text-red-400'
    };

    return (
        <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-blue-400">{report.report_id}</span>
                <StatusBadge status={report.verdict} size="small" />
            </div>
            <h4 className="text-sm font-medium text-gray-200 mb-1">{report.board_name}</h4>
            <div className="text-xs text-gray-500 mb-3">
                {new Date(report.timestamp).toLocaleString()}
            </div>
            <button
                onClick={() => onView(report)}
                className="w-full flex items-center justify-center px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
            >
                <Eye className="w-4 h-4 mr-2" />
                View Report
            </button>
        </div>
    );
}

// Workflow Result Component
function WorkflowResult({ result }) {
    return (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-200">Workflow Complete</h3>
                <StatusBadge status={result.verdict} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-900/50 rounded">
                    <div className="text-2xl font-bold text-blue-400">{result.tests_generated}</div>
                    <div className="text-xs text-gray-500">Tests Generated</div>
                </div>
                <div className="text-center p-3 bg-gray-900/50 rounded">
                    <div className="text-2xl font-bold text-green-400">{result.summary?.passed || 0}</div>
                    <div className="text-xs text-gray-500">Passed</div>
                </div>
                <div className="text-center p-3 bg-gray-900/50 rounded">
                    <div className="text-2xl font-bold text-red-400">{result.summary?.failed || 0}</div>
                    <div className="text-xs text-gray-500">Failed</div>
                </div>
                <div className="text-center p-3 bg-gray-900/50 rounded">
                    <div className="text-2xl font-bold text-purple-400">{result.summary?.pass_rate || 0}%</div>
                    <div className="text-xs text-gray-500">Pass Rate</div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-32">Workflow ID:</span>
                    <span className="font-mono text-gray-300">{result.workflow_id}</span>
                </div>
                <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-32">Emulator ID:</span>
                    <span className="font-mono text-blue-400">{result.emulator_id}</span>
                </div>
                <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-32">Report ID:</span>
                    <span className="font-mono text-purple-400">{result.report_id}</span>
                </div>
            </div>

            {result.recommendations && result.recommendations.length > 0 && (
                <div className="mt-4 p-3 bg-gray-900/50 rounded">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                        {result.recommendations.map((rec, i) => (
                            <li key={i} className="text-xs text-gray-400 flex items-start">
                                <Info className="w-3 h-3 mr-2 mt-0.5 text-blue-400 flex-shrink-0" />
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// Main Emulation Platform Component
export default function EmulationPlatform() {
    // State
    const [status, setStatus] = useState({ available: false, workers: {} });
    const [activeTab, setActiveTab] = useState('workflow');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Document upload state
    const [specDocuments, setSpecDocuments] = useState([]);
    const [firmwareFile, setFirmwareFile] = useState(null);
    const [boardName, setBoardName] = useState('');
    const [customEmulatorId, setCustomEmulatorId] = useState('');

    // Registry state
    const [emulators, setEmulators] = useState([]);
    const [selectedEmulator, setSelectedEmulator] = useState(null);
    const [tests, setTests] = useState([]);
    const [reports, setReports] = useState([]);

    // Workflow state
    const [workflowResult, setWorkflowResult] = useState(null);
    const [workflowRunning, setWorkflowRunning] = useState(false);

    const firmwareInputRef = useRef(null);

    // Fetch platform status
    const fetchStatus = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/v1/platform/status`);
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            }
        } catch (err) {
            console.error('Failed to fetch status:', err);
        }
    }, []);

    // Fetch emulators
    const fetchEmulators = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/v1/platform/registry/emulators`);
            if (response.ok) {
                const data = await response.json();
                setEmulators(data.emulators || []);
            }
        } catch (err) {
            console.error('Failed to fetch emulators:', err);
        }
    }, []);

    // Fetch reports
    const fetchReports = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/v1/platform/registry/reports`);
            if (response.ok) {
                const data = await response.json();
                setReports(data.reports || []);
            }
        } catch (err) {
            console.error('Failed to fetch reports:', err);
        }
    }, []);

    // Fetch tests for an emulator
    const fetchTests = useCallback(async (emulatorId) => {
        try {
            const response = await fetch(`${API_BASE}/api/v1/platform/registry/tests/${emulatorId}`);
            if (response.ok) {
                const data = await response.json();
                setTests(data.tests || []);
            } else {
                setTests([]);
            }
        } catch (err) {
            console.error('Failed to fetch tests:', err);
            setTests([]);
        }
    }, []);

    // Handle document upload
    const handleDocumentUpload = (files) => {
        setSpecDocuments(prev => [...prev, ...files]);
    };

    // Handle firmware selection
    const handleFirmwareSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFirmwareFile(e.target.files[0]);
        }
    };

    // Run complete workflow
    const runWorkflow = async () => {
        if (!boardName || specDocuments.length === 0 || !firmwareFile) {
            setError('Please provide board name, specification documents, and firmware file');
            return;
        }

        setWorkflowRunning(true);
        setError(null);
        setSuccess(null);
        setWorkflowResult(null);

        try {
            const formData = new FormData();
            specDocuments.forEach(doc => {
                formData.append('spec_files', doc);
            });
            formData.append('firmware_file', firmwareFile);

            const params = new URLSearchParams();
            params.append('board_name', boardName);
            if (customEmulatorId) {
                params.append('emulator_id', customEmulatorId);
            }

            const response = await fetch(`${API_BASE}/api/v1/platform/run-workflow?${params.toString()}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                setWorkflowResult(result);
                setSuccess('Workflow completed successfully!');
                fetchEmulators();
                fetchReports();
            } else {
                const errData = await response.json();
                setError(errData.detail || 'Workflow failed');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setWorkflowRunning(false);
        }
    };

    // Generate tests for emulator
    const generateTests = async (emulatorId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/api/v1/platform/generate-tests/${emulatorId}`, {
                method: 'POST'
            });

            if (response.ok) {
                const result = await response.json();
                setSuccess(`Generated ${result.total_tests} tests`);
                fetchTests(emulatorId);
            } else {
                const errData = await response.json();
                setError(errData.detail || 'Test generation failed');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // View tests for emulator
    const viewTests = async (emulatorId) => {
        setSelectedEmulator(emulators.find(e => e.id === emulatorId));
        fetchTests(emulatorId);
        setActiveTab('tests');
    };

    // Initial data fetch
    useEffect(() => {
        fetchStatus();
        fetchEmulators();
        fetchReports();
    }, [fetchStatus, fetchEmulators, fetchReports]);

    // Tabs configuration
    const tabs = [
        { id: 'workflow', label: 'Run Workflow', icon: Workflow },
        { id: 'registry', label: 'Registry', icon: Database },
        { id: 'tests', label: 'Test Cases', icon: FlaskConical },
        { id: 'reports', label: 'Reports', icon: ClipboardList }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-100 flex items-center">
                        <Factory className="w-7 h-7 mr-3 text-purple-500" />
                        Emulation Platform
                    </h1>
                    <p className="text-gray-400 mt-1">
                        End-to-end board emulation with automated test generation
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <StatusBadge status={status.available ? 'ready' : 'pending'} />
                    <button
                        onClick={fetchStatus}
                        className="p-2 hover:bg-gray-700 rounded-lg"
                    >
                        <RefreshCw className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-700 pb-2">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-gray-700 text-purple-400 border-b-2 border-purple-400'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                            }`}
                        >
                            <Icon className="w-4 h-4 mr-2" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Messages */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center text-red-400 text-sm">
                    <XCircle className="w-4 h-4 mr-2" />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {success}
                    <button onClick={() => setSuccess(null)} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Workflow Tab */}
            {activeTab === 'workflow' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Configuration */}
                    <div className="space-y-6">
                        {/* Board Name */}
                        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                            <h3 className="text-sm font-medium text-gray-200 mb-3 flex items-center">
                                <Cpu className="w-4 h-4 mr-2 text-orange-400" />
                                Board Configuration
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Board Name *</label>
                                    <input
                                        type="text"
                                        value={boardName}
                                        onChange={(e) => setBoardName(e.target.value)}
                                        placeholder="e.g., Speedport Smart 4 Plus"
                                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Custom Emulator ID (Optional)</label>
                                    <input
                                        type="text"
                                        value={customEmulatorId}
                                        onChange={(e) => setCustomEmulatorId(e.target.value)}
                                        placeholder="e.g., EMU_CUSTOM_001"
                                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Specification Documents */}
                        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                            <h3 className="text-sm font-medium text-gray-200 mb-3 flex items-center">
                                <FileCode className="w-4 h-4 mr-2 text-blue-400" />
                                Specification Documents *
                            </h3>
                            <DocumentUpload
                                onUpload={handleDocumentUpload}
                                uploading={false}
                                documents={specDocuments}
                            />
                            {specDocuments.length > 0 && (
                                <button
                                    onClick={() => setSpecDocuments([])}
                                    className="mt-2 text-xs text-red-400 hover:text-red-300"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Firmware Upload */}
                        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                            <h3 className="text-sm font-medium text-gray-200 mb-3 flex items-center">
                                <Upload className="w-4 h-4 mr-2 text-green-400" />
                                Firmware Binary *
                            </h3>
                            <div
                                onClick={() => firmwareInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-500"
                            >
                                <input
                                    ref={firmwareInputRef}
                                    type="file"
                                    accept=".bin,.img,.fw"
                                    onChange={handleFirmwareSelect}
                                    className="hidden"
                                />
                                {firmwareFile ? (
                                    <div className="flex flex-col items-center">
                                        <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
                                        <p className="text-sm text-gray-200">{firmwareFile.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {(firmwareFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <FolderUp className="w-8 h-8 text-gray-500 mb-2" />
                                        <p className="text-sm text-gray-400">Select firmware binary</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Run Button */}
                        <button
                            onClick={runWorkflow}
                            disabled={workflowRunning || !boardName || specDocuments.length === 0 || !firmwareFile}
                            className={`w-full flex items-center justify-center px-6 py-4 rounded-lg font-medium transition-colors ${
                                workflowRunning || !boardName || specDocuments.length === 0 || !firmwareFile
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-purple-500 text-white hover:bg-purple-600'
                            }`}
                        >
                            {workflowRunning ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Running Workflow...
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="w-5 h-5 mr-2" />
                                    Run Complete Workflow
                                </>
                            )}
                        </button>
                    </div>

                    {/* Workflow Result */}
                    <div>
                        {workflowResult ? (
                            <WorkflowResult result={workflowResult} />
                        ) : (
                            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-12 text-center">
                                <Workflow className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                <h3 className="text-lg font-medium text-gray-300 mb-2">Workflow Pipeline</h3>
                                <p className="text-gray-500 text-sm mb-4">
                                    The workflow will automatically:
                                </p>
                                <div className="text-left space-y-2 max-w-xs mx-auto text-sm text-gray-400">
                                    <div className="flex items-center">
                                        <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs mr-2">1</span>
                                        Parse specification documents
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs mr-2">2</span>
                                        Generate emulator configuration
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs mr-2">3</span>
                                        Create boot & feature tests
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs mr-2">4</span>
                                        Execute tests with firmware
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs mr-2">5</span>
                                        Generate comprehensive report
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Worker Status */}
                        {status.workers && Object.keys(status.workers).length > 0 && (
                            <div className="mt-6 bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                                <h3 className="text-sm font-medium text-gray-200 mb-3 flex items-center">
                                    <Activity className="w-4 h-4 mr-2 text-green-400" />
                                    AI Workers Status
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(status.workers).map(([worker, workerStatus]) => (
                                        <div key={worker} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                                            <span className="text-xs text-gray-400 truncate">{worker.replace(/_/g, ' ')}</span>
                                            <StatusBadge status={workerStatus} size="small" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Registry Tab */}
            {activeTab === 'registry' && (
                <div className="bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <h3 className="font-medium text-gray-200 flex items-center">
                            <Database className="w-4 h-4 mr-2 text-purple-400" />
                            Emulator Registry
                        </h3>
                        <span className="text-sm text-gray-400">{emulators.length} emulators</span>
                    </div>
                    <div className="p-4">
                        {emulators.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No emulators registered yet</p>
                                <p className="text-sm mt-1">Run a workflow to create your first emulator</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {emulators.map((emulator) => (
                                    <EmulatorCard
                                        key={emulator.id}
                                        emulator={emulator}
                                        selected={selectedEmulator?.id === emulator.id}
                                        onSelect={setSelectedEmulator}
                                        onGenerateTests={generateTests}
                                        onViewTests={viewTests}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tests Tab */}
            {activeTab === 'tests' && (
                <div className="bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <h3 className="font-medium text-gray-200 flex items-center">
                            <FlaskConical className="w-4 h-4 mr-2 text-purple-400" />
                            Test Cases
                            {selectedEmulator && (
                                <span className="ml-2 text-sm text-gray-400">
                                    for {selectedEmulator.board_name}
                                </span>
                            )}
                        </h3>
                        <span className="text-sm text-gray-400">{tests.length} tests</span>
                    </div>
                    <div className="p-4">
                        {tests.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No test cases available</p>
                                <p className="text-sm mt-1">
                                    {selectedEmulator
                                        ? 'Generate tests for the selected emulator'
                                        : 'Select an emulator from the Registry tab'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tests.map((test, idx) => (
                                    <TestCaseCard key={test.id || idx} test={test} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
                <div className="bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <h3 className="font-medium text-gray-200 flex items-center">
                            <ClipboardList className="w-4 h-4 mr-2 text-purple-400" />
                            Emulation Reports
                        </h3>
                        <span className="text-sm text-gray-400">{reports.length} reports</span>
                    </div>
                    <div className="p-4">
                        {reports.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No reports available</p>
                                <p className="text-sm mt-1">Run a workflow to generate reports</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {reports.map((report) => (
                                    <ReportCard
                                        key={report.report_id}
                                        report={report}
                                        onView={() => {}}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
