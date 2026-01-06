/**
 * Phoenix2 - Binary Verification Page
 *
 * AI Workers Involved:
 * - BinaryUploadWorker: Handle binary file uploads
 * - TestExecutorWorker: Execute verification tests
 * - LogStreamWorker: Stream test logs in real-time
 * - ResultAggregatorWorker: Compile and display test results
 * - ReportGeneratorWorker: Generate verification reports
 *
 * Orchestrator: BinaryVerificationOrchestrator
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Upload,
    Play,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    FileCode,
    Terminal,
    BarChart3,
    RefreshCw,
    ChevronDown,
    Cpu,
    HardDrive,
    Activity,
    Shield,
    Zap
} from 'lucide-react';

const API_BASE = '/api/v1/verification';

function BinaryVerification() {
    // State management
    const [emulators, setEmulators] = useState([]);
    const [selectedEmulator, setSelectedEmulator] = useState(null);
    const [binaryFile, setBinaryFile] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, uploaded, running, completed, failed
    const [logs, setLogs] = useState([]);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [firmwareInfo, setFirmwareInfo] = useState(null);

    const logsEndRef = useRef(null);
    const logPollRef = useRef(null);

    // Load available emulators on mount
    useEffect(() => {
        fetchEmulators();
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    // Poll for logs when running
    useEffect(() => {
        if (status === 'running' && sessionId) {
            logPollRef.current = setInterval(() => {
                fetchLogs();
            }, 500);
        }
        return () => {
            if (logPollRef.current) {
                clearInterval(logPollRef.current);
            }
        };
    }, [status, sessionId]);

    const fetchEmulators = async () => {
        try {
            const res = await fetch(`${API_BASE}/emulators`);
            const data = await res.json();
            setEmulators(data.emulators || []);
        } catch (err) {
            console.error('Failed to fetch emulators:', err);
        }
    };

    const fetchLogs = async () => {
        if (!sessionId) return;
        try {
            const res = await fetch(`${API_BASE}/logs/${sessionId}?offset=${logs.length}`);
            const data = await res.json();
            if (data.logs && data.logs.length > 0) {
                setLogs(prev => [...prev, ...data.logs]);
            }
            if (data.status === 'completed' || data.status === 'failed') {
                setStatus(data.status);
                if (logPollRef.current) {
                    clearInterval(logPollRef.current);
                }
                if (data.status === 'completed') {
                    fetchResults();
                }
            }
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        }
    };

    const fetchResults = async () => {
        if (!sessionId) return;
        try {
            const res = await fetch(`${API_BASE}/results/${sessionId}`);
            const data = await res.json();
            if (data.results) {
                setResults(data.results);
            }
        } catch (err) {
            console.error('Failed to fetch results:', err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBinaryFile(file);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedEmulator || !binaryFile) {
            setError('Please select an emulator and a binary file');
            return;
        }

        setStatus('uploading');
        setError(null);
        setLogs([]);
        setResults(null);

        try {
            const formData = new FormData();
            formData.append('binary_file', binaryFile);

            const res = await fetch(`${API_BASE}/upload-binary?emulator_id=${selectedEmulator.id}`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Upload failed');
            }

            const data = await res.json();
            setSessionId(data.session_id);
            setFirmwareInfo(data.firmware_info);
            setStatus('uploaded');
            setLogs([{ message: `Binary uploaded: ${binaryFile.name}`, timestamp: new Date().toISOString() }]);
        } catch (err) {
            setError(err.message);
            setStatus('idle');
        }
    };

    const handleRunVerification = async () => {
        if (!sessionId) return;

        setStatus('running');
        setLogs(prev => [...prev, { message: 'Starting verification...', timestamp: new Date().toISOString() }]);

        try {
            const res = await fetch(`${API_BASE}/run/${sessionId}`, {
                method: 'POST'
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Verification failed');
            }

            const data = await res.json();
            setStatus('completed');
            fetchResults();
        } catch (err) {
            setError(err.message);
            setStatus('failed');
        }
    };

    const handleReset = () => {
        setSelectedEmulator(null);
        setBinaryFile(null);
        setSessionId(null);
        setStatus('idle');
        setLogs([]);
        setResults(null);
        setError(null);
        setFirmwareInfo(null);
    };

    const getVerdictColor = (verdict) => {
        switch (verdict) {
            case 'PASS': return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'CONDITIONAL': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            case 'FAIL': return 'text-red-400 bg-red-500/20 border-red-500/30';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };

    const getStatusIcon = (testStatus) => {
        switch (testStatus) {
            case 'passed': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-orange-400" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-100 flex items-center">
                    <Shield className="w-7 h-7 mr-3 text-purple-500" />
                    Binary Verification
                </h1>
                <p className="text-gray-400 mt-1">Upload firmware binary and run verification tests against emulator</p>
            </div>

            {/* Configuration Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Emulator Selection */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
                        <Cpu className="w-5 h-5 mr-2 text-blue-400" />
                        Select Emulator
                    </h3>

                    {emulators.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 mx-auto text-yellow-500 mb-3" />
                            <p className="text-gray-400">No emulators available</p>
                            <p className="text-gray-500 text-sm mt-1">
                                Create an emulator first in the Emulation Platform
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {emulators.map(emu => (
                                <div
                                    key={emu.id}
                                    onClick={() => setSelectedEmulator(emu)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                        selectedEmulator?.id === emu.id
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-mono text-purple-400">{emu.id}</h4>
                                            <p className="text-sm text-gray-400">{emu.board_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                                                {emu.vendor}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">{emu.soc_id}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Binary Upload */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
                        <HardDrive className="w-5 h-5 mr-2 text-orange-400" />
                        Upload Binary
                    </h3>

                    <div className="space-y-4">
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                                binaryFile
                                    ? 'border-green-500/50 bg-green-500/10'
                                    : 'border-gray-600 hover:border-gray-500'
                            }`}
                        >
                            <input
                                type="file"
                                id="binary-file"
                                accept=".bin,.img,.fw,.zip,.tar,.gz,.tgz"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={status === 'running'}
                            />
                            <label htmlFor="binary-file" className="cursor-pointer">
                                {binaryFile ? (
                                    <>
                                        <FileCode className="w-12 h-12 mx-auto text-green-400 mb-3" />
                                        <p className="text-green-400 font-medium">{binaryFile.name}</p>
                                        <p className="text-gray-500 text-sm mt-1">
                                            {(binaryFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-12 h-12 mx-auto text-gray-500 mb-3" />
                                        <p className="text-gray-400">Click to select firmware binary</p>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Supports: .bin, .img, .fw, .zip, .tar, .gz
                                        </p>
                                    </>
                                )}
                            </label>
                        </div>

                        {firmwareInfo && (
                            <div className="p-3 bg-gray-900 rounded-lg text-sm">
                                <p className="text-gray-400">
                                    <span className="text-gray-500">SHA256:</span> {firmwareInfo.sha256?.substring(0, 16)}...
                                </p>
                                <p className="text-gray-400">
                                    <span className="text-gray-500">Size:</span> {firmwareInfo.size_mb} MB
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {status === 'idle' && (
                                <button
                                    onClick={handleUpload}
                                    disabled={!selectedEmulator || !binaryFile}
                                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <Upload className="w-5 h-5 mr-2" />
                                    Upload Binary
                                </button>
                            )}

                            {status === 'uploading' && (
                                <button disabled className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                    Uploading...
                                </button>
                            )}

                            {status === 'uploaded' && (
                                <button
                                    onClick={handleRunVerification}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                                >
                                    <Play className="w-5 h-5 mr-2" />
                                    Run Verification
                                </button>
                            )}

                            {status === 'running' && (
                                <button disabled className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                    Running Tests...
                                </button>
                            )}

                            {(status === 'completed' || status === 'failed') && (
                                <button
                                    onClick={handleReset}
                                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center"
                                >
                                    <RefreshCw className="w-5 h-5 mr-2" />
                                    New Verification
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Panel */}
            {logs.length > 0 && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
                        <Terminal className="w-5 h-5 mr-2 text-green-400" />
                        Verification Logs
                        {status === 'running' && (
                            <span className="ml-2 text-sm text-gray-500 animate-pulse">Live</span>
                        )}
                    </h3>

                    <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
                        {logs.map((log, idx) => (
                            <div key={idx} className="flex items-start py-1">
                                <span className="text-gray-500 text-xs mr-3 whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <span className={`${
                                    log.message.includes('ERROR') ? 'text-red-400' :
                                    log.message.includes('OK') ? 'text-green-400' :
                                    log.message.includes('FAIL') ? 'text-red-400' :
                                    log.message.startsWith('[') ? 'text-blue-400' :
                                    'text-gray-300'
                                }`}>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            )}

            {/* Results Panel */}
            {results && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                            Verification Results
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                            {/* Verdict */}
                            <div className={`p-4 rounded-lg border ${getVerdictColor(results.verdict)}`}>
                                <p className="text-sm text-gray-400 mb-1">Verdict</p>
                                <p className="text-2xl font-bold">{results.verdict}</p>
                            </div>

                            {/* Pass Rate */}
                            <div className="p-4 bg-gray-900 rounded-lg">
                                <p className="text-sm text-gray-400 mb-1">Pass Rate</p>
                                <p className="text-2xl font-bold text-blue-400">
                                    {results.summary?.pass_rate}%
                                </p>
                            </div>

                            {/* Passed */}
                            <div className="p-4 bg-gray-900 rounded-lg">
                                <p className="text-sm text-gray-400 mb-1">Passed</p>
                                <p className="text-2xl font-bold text-green-400">
                                    {results.summary?.passed}
                                </p>
                            </div>

                            {/* Failed */}
                            <div className="p-4 bg-gray-900 rounded-lg">
                                <p className="text-sm text-gray-400 mb-1">Failed</p>
                                <p className="text-2xl font-bold text-red-400">
                                    {results.summary?.failed}
                                </p>
                            </div>

                            {/* Total */}
                            <div className="p-4 bg-gray-900 rounded-lg">
                                <p className="text-sm text-gray-400 mb-1">Total Tests</p>
                                <p className="text-2xl font-bold text-gray-300">
                                    {results.summary?.total}
                                </p>
                            </div>
                        </div>

                        {/* Recommendations */}
                        {results.recommendations && results.recommendations.length > 0 && (
                            <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Recommendations</h4>
                                <ul className="space-y-1">
                                    {results.recommendations.map((rec, idx) => (
                                        <li key={idx} className="text-sm text-gray-400 flex items-start">
                                            <Zap className="w-4 h-4 mr-2 text-yellow-500 flex-shrink-0 mt-0.5" />
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Test Results Table */}
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-purple-400" />
                            Test Results Detail
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-400 border-b border-gray-700">
                                        <th className="pb-3 pr-4">Status</th>
                                        <th className="pb-3 pr-4">Test ID</th>
                                        <th className="pb-3 pr-4">Test Name</th>
                                        <th className="pb-3 pr-4">Category</th>
                                        <th className="pb-3 pr-4">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.test_results?.map((test, idx) => (
                                        <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                            <td className="py-3 pr-4">
                                                {getStatusIcon(test.status)}
                                            </td>
                                            <td className="py-3 pr-4 font-mono text-gray-400">
                                                {test.test_id}
                                            </td>
                                            <td className="py-3 pr-4 text-gray-300">
                                                {test.test_name}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className="px-2 py-0.5 rounded bg-gray-700 text-gray-300 text-xs">
                                                    {test.category}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-gray-400">
                                                {test.duration_sec?.toFixed(2)}s
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Feature Coverage */}
                    {results.feature_coverage && (
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <h3 className="text-lg font-medium text-gray-200 mb-4">Feature Coverage by Category</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(results.feature_coverage.by_category || {}).map(([cat, data]) => (
                                    <div key={cat} className="p-3 bg-gray-900 rounded-lg">
                                        <p className="text-sm text-gray-400 capitalize">{cat}</p>
                                        <p className="text-xl font-bold text-blue-400">{data.coverage}%</p>
                                        <p className="text-xs text-gray-500">
                                            {data.passed}/{data.total} passed
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default BinaryVerification;
