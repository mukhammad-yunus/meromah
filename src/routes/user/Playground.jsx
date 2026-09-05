import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Play,
  Download,
  Upload,
  Trash2,
  Maximize2,
  Minimize2,
  Terminal,
  Code,
  Clock,
  ChevronLeft,
} from "lucide-react";
import { usePlayPythonApiMutation } from "../../services/solutionsApi";
import { Link } from "react-router-dom";

const Playground = () => {
  const STORAGE_KEY = "playground_code";
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("code");
  const [lineNumbers, setLineNumbers] = useState([]);
  const textareaRef = useRef(null);
  const [runPython, { isLoading }] = usePlayPythonApiMutation();
  const TAB = "    ";

  // Load persisted code
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCode(saved);
    } else {
      setCode(
        "# Welcome to Python Playground\n# Write your Python code here\n\nprint('Hello, World!')"
      );
    }
  }, []);

  // Persist code on change
  useEffect(() => {
    if (code) {
      localStorage.setItem(STORAGE_KEY, code);
    }
  }, [code]);

  // Update line numbers
  useEffect(() => {
    const lines = code.split("\n");
    setLineNumbers(lines.map((_, i) => i + 1));
  }, [code]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const el = e.target;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newValue = code.substring(0, start) + TAB + code.substring(end);
        setCode(newValue);
        setTimeout(() => {
          el.selectionStart = el.selectionEnd = start + TAB.length;
        }, 0);
      }
    },
    [code]
  );

  const onRun = async () => {
    setOutput("");
    setError("");

    try {
      const res = await runPython({ bodyData: { input: code } }).unwrap();
      if (res?.stderr) {
        setError(res.stderr);
      } else {
        setOutput(res?.stdout ?? "");
      }
      setActiveTab("console");
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.data?.error ||
          err?.message ||
          "Failed to run code"
      );
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all code?")) {
      setCode("# Write your Python code here\n");
      setOutput("");
      setError("");
    }
  };

  const handleScroll = (e) => {
    const lineNumbersEl = document.getElementById("line-numbers");
    if (lineNumbersEl) {
      lineNumbersEl.scrollTop = e.target.scrollTop;
    }
  };

  const runDisabled = isLoading || !code.trim();

  return (
    <div className="bg-neutral-950 text-neutral-100 flex flex-col h-screen w-full">
      {/* Top Bar */}
      <div className=" bg-neutral-800 border-b border-neutral-700 flex md:items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-2 py-2 justify-between md:justify-baseline">
            <Link to={"/"} className="flex gap-0.5 items-center cursor-pointer">
              <ChevronLeft />
              <span>Home</span>
            </Link>
            <h1 className="text-base font-semibold text-white border-l border-l-neutral-600 px-3">
              Python Playground
            </h1>
          </div>

        <div className="flex items-center gap-2 py-2 justify-between md:justify-baseline">
          <button
            onClick={handleClear}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition"
            title="Clear code"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Run Button */}
          <button
            onClick={onRun}
            disabled={runDisabled}
            className={`flex items-center gap-2 px-4 py-1.5 rounded font-medium text-sm transition ${
              runDisabled
                ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                : "bg-primary-blue hover:ring-primary-blue text-white"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="bg-neutral-800 border-b border-neutral-700 flex items-center">
        <div
          className={`flex items-center gap-2 text-xs py-2 px-4 md:hidden ${
            activeTab === "code" ? "bg-black text-white" : "bg-neutral-800"
          }`}
          onClick={() => setActiveTab("code")}
        >
          <Code className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-neutral-400 font-medium">Editor</span>
        </div>
        <div
          className={`flex items-center gap-2 text-xs py-2 px-4 md:hidden ${
            activeTab === "console" ? "bg-black text-white" : "bg-neutral-800"
          }`}
          onClick={() => setActiveTab("console")}
        >
          <Terminal className="w-3.5 h-3.5 text-green-400" />
          <span className="text-neutral-400 font-medium">Console</span>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Section */}
        <div
          className={`flex-1 flex flex-col border-r border-neutral-700 overflow-hidden md:w-[55%]
          ${activeTab === "code" ? "w-full" : "w-0"}
          `}
        >
          {/* Editor Header */}
          <div className="hidden h-10 bg-neutral-800 border-b border-neutral-700 md:flex items-center px-4">
            <div className="flex items-center gap-2 text-xs">
              <Code className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-neutral-400 font-medium">Editor</span>
            </div>
          </div>

          {/* Code Editor with Line Numbers */}
          <div className="flex flex-1 overflow-hidden bg-neutral-950">
            {/* Line Numbers */}
            <div
              id="line-numbers"
              className="bg-neutral-950 text-neutral-600 text-right pr-3 pl-4 py-3 font-mono text-sm select-none overflow-hidden"
              style={{ minWidth: "50px" }}
            >
              {lineNumbers.map((num) => (
                <div key={num} className="leading-6">
                  {num}
                </div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              wrap="off"
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              className="flex-1 bg-neutral-950 text-neutral-100 m-3 font-mono text-sm focus:outline-none resize-none leading-6 overflow-x-auto whitespace-pre border-r borer"
              spellCheck="false"
              placeholder="# Start coding..."
            />
          </div>
        </div>

        {/* Output Section */}
        <div
          className={`flex flex-col md:bg-neutral-800 overflow-hidden md:w-[45%] ${
            activeTab === "console" ? "w-full" : "w-0"
          }`}
        >
          {/* Output Header */}
          <div className=" hidden h-10 bg-neutral-800 border-b border-neutral-700 md:flex items-center justify-between px-4">
            <div className="flex items-center gap-2 text-xs">
              <Terminal className="w-3.5 h-3.5 text-green-400" />
              <span className="text-neutral-400 font-medium">Console</span>
            </div>
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <div className="w-4 h-4 border-2 border-neutral-400/30 border-t-neutral-400 rounded-full animate-spin" />
                <span>Executing Python code...</span>
              </div>
            ) : error ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-400 text-sm font-semibold">
                  <span>❌ Error</span>
                </div>
                <pre className="text-sm text-red-300 font-mono whitespace-pre-wrap bg-red-900/20 p-3 rounded border border-red-700/50">
                  {error}
                </pre>
              </div>
            ) : output ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                  <span>✓ Success</span>
                </div>
                <pre className="text-sm text-green-300 font-mono whitespace-pre-wrap bg-green-900/20 p-3 rounded border border-green-700/50">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                <Terminal className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">No output yet</p>
                <p className="text-xs text-neutral-600 mt-1">
                  Run your code to see results
                </p>
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="border-t border-neutral-700 p-3 bg-neutral-850">
            <ul className="text-xs text-neutral-500 space-y-1">
              <li className="font-semibold text-neutral-400 mb-1.5">
                💡 Quick Tips
              </li>
              <li>
                Press
                <kbd className="px-1.5 py-0.5 mx-1 bg-neutral-700 rounded text-neutral-300">
                  Tab
                </kbd>
                to indent
              </li>
              <li>Code is auto-saved to your browser</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;
