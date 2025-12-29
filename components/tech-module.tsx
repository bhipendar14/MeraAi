"use client"

import { useState, useRef } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChevronDown, Loader2, AlertCircle, CheckCircle, Play,
  Wrench, Lightbulb, Code2, Sparkles, Copy, Download,
  Maximize2, Minimize2, Terminal, Bot
} from "lucide-react"

// Dynamically import Monaco Editor (client-side only)
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

const LANGUAGES = [
  { id: "javascript", name: "JavaScript", ext: ".js", monaco: "javascript" },
  { id: "typescript", name: "TypeScript", ext: ".ts", monaco: "typescript" },
  { id: "python", name: "Python", ext: ".py", monaco: "python" },
  { id: "java", name: "Java", ext: ".java", monaco: "java" },
  { id: "cpp", name: "C++", ext: ".cpp", monaco: "cpp" },
  { id: "c", name: "C", ext: ".c", monaco: "c" },
  { id: "csharp", name: "C#", ext: ".cs", monaco: "csharp" },
  { id: "go", name: "Go", ext: ".go", monaco: "go" },
  { id: "rust", name: "Rust", ext: ".rs", monaco: "rust" },
  { id: "html", name: "HTML", ext: ".html", monaco: "html" },
  { id: "css", name: "CSS", ext: ".css", monaco: "css" },
]

const CODE_TEMPLATES: Record<string, Record<string, string>> = {
  javascript: {
    "Hello World": `function greet(name) {\n  return 'Hello, ' + name + '!'\n}\n\nconsole.log(greet('World'))`,
    "REST API": `// Express.js REST API\nconst express = require('express')\nconst app = express()\n\napp.get('/api/users', (req, res) => {\n  res.json({ users: [] })\n})\n\napp.listen(3000, () => {\n  console.log('Server running on port 3000')\n})`,
    "Async/Await": `async function fetchData() {\n  try {\n    const response = await fetch('https://api.example.com/data')\n    const data = await response.json()\n    console.log(data)\n  } catch (error) {\n    console.error('Error:', error)\n  }\n}\n\nfetchData()`,
  },
  python: {
    "Hello World": `def greet(name):\n    return f'Hello, {name}!'\n\nprint(greet('World'))`,
    "Class Example": `class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    \n    def greet(self):\n        return f'Hello, I am {self.name}'\n\nperson = Person('Alice', 30)\nprint(person.greet())`,
    "List Comprehension": `# List comprehension examples\nnumbers = [1, 2, 3, 4, 5]\nsquares = [x**2 for x in numbers]\nprint(squares)\n\n# Filter even numbers\nevens = [x for x in numbers if x % 2 == 0]\nprint(evens)`,
  },
}

export function TechModule() {
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState(CODE_TEMPLATES.javascript["Hello World"])
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [outputType, setOutputType] = useState<"success" | "error" | "info" | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState<"output" | "ai">("output")
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: "on",
      lineNumbers: "on",
      renderWhitespace: "selection",
      autoClosingBrackets: "always",
      autoClosingQuotes: "always",
      formatOnPaste: true,
      formatOnType: true,
    })
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    const templates = CODE_TEMPLATES[lang]
    if (templates) {
      setCode(templates["Hello World"] || "")
    }
    setOutput("")
    setOutputType(null)
    setShowLanguageMenu(false)
  }

  const loadTemplate = (templateName: string) => {
    const template = CODE_TEMPLATES[language]?.[templateName]
    if (template) {
      setCode(template)
      setShowTemplates(false)
    }
  }

  const executeAction = async (action: "run" | "fix" | "explain") => {
    setLoading(true)
    setOutput("Processing...")
    setOutputType("info")
    setActiveTab("output")

    try {
      const res = await fetch("/api/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, action }),
      })

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()

      if (action === "fix" && data.fixed) {
        setCode(data.output)
        setOutput("✓ Code fixed! Review the corrected code in the editor.")
        setOutputType("success")
      } else if (action === "explain") {
        setOutput(data.output || "Unable to explain code.")
        setOutputType("success")
        setActiveTab("ai")
      } else if (action === "run") {
        if (data.error) {
          setOutput(data.output || "Execution error")
          setOutputType("error")
        } else {
          setOutput(data.output || "Code executed successfully")
          setOutputType("success")
        }
      }
    } catch (e: any) {
      setOutput(`Error: ${e.message}`)
      setOutputType("error")
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setOutput("✓ Code copied to clipboard!")
    setOutputType("success")
  }

  const downloadCode = async () => {
    const lang = LANGUAGES.find(l => l.id === language)

    // Dynamically import jsPDF only when needed
    const { jsPDF } = await import('jspdf')

    const doc = new jsPDF()

    // Add title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`${lang?.name || 'Code'} File`, 20, 20)

    // Add metadata
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(`Language: ${lang?.name || 'Unknown'}`, 20, 30)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 36)

    // Add code with monospace font
    doc.setFontSize(9)
    doc.setFont('courier', 'normal')
    doc.setTextColor(0)

    // Split code into lines and add to PDF
    const lines = code.split('\n')
    let y = 50
    const lineHeight = 5
    const maxLinesPerPage = 50

    lines.forEach((line, index) => {
      // Add new page if needed
      if (index > 0 && index % maxLinesPerPage === 0) {
        doc.addPage()
        y = 20
      }

      // Truncate long lines to fit page width
      const maxLength = 95
      const displayLine = line.length > maxLength ? line.substring(0, maxLength) + '...' : line

      doc.text(displayLine || ' ', 20, y)
      y += lineHeight
    })

    // Save the PDF
    doc.save(`code${lang?.ext || '.txt'}.pdf`)

    setOutput("✓ Code downloaded as PDF!")
    setOutputType("success")
  }

  const currentLang = LANGUAGES.find((l) => l.id === language)
  const templates = CODE_TEMPLATES[language] || {}

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 hover:bg-accent/30 text-sm font-medium transition-all hover:shadow-[0_0_12px_var(--color-accent-cyan)]"
            >
              <Code2 className="w-4 h-4" />
              {currentLang?.name}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showLanguageMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-50 max-h-80 overflow-auto">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent/20 transition-colors border-b border-border/30 last:border-0 ${language === lang.id ? "bg-accent/30 font-semibold" : ""
                      }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Templates */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 hover:bg-accent/30 text-sm font-medium transition-all hover:shadow-[0_0_12px_var(--color-accent-purple)]"
            >
              <Sparkles className="w-4 h-4" />
              Templates
            </button>
            {showTemplates && Object.keys(templates).length > 0 && (
              <div className="absolute left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-50">
                {Object.keys(templates).map((templateName) => (
                  <button
                    key={templateName}
                    onClick={() => loadTemplate(templateName)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent/20 transition-colors border-b border-border/30 last:border-0"
                  >
                    {templateName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Utility Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyCode}
            className="hover:shadow-[0_0_8px_var(--color-accent-cyan)]"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadCode}
            className="hover:shadow-[0_0_8px_var(--color-accent-purple)]"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hidden md:flex hover:shadow-[0_0_8px_var(--color-accent-pink)]"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Editor Layout - Responsive Grid */}
      <div className={`grid gap-4 ${isFullscreen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}>
        {/* Code Editor */}
        <Card className={`border-border/60 bg-card/60 backdrop-blur ${isFullscreen ? "" : "lg:col-span-2"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-500" />
              Code Editor
              <span className="text-xs text-muted-foreground font-normal ml-2">
                Press Ctrl+Enter to run
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/60 overflow-hidden" style={{ height: isFullscreen ? "70vh" : "500px" }}>
              <Editor
                height="100%"
                language={currentLang?.monaco || "javascript"}
                value={code}
                onChange={(value) => setCode(value || "")}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: !isFullscreen },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                onClick={() => executeAction("run")}
                disabled={loading}
                className="hover:shadow-[0_0_12px_var(--color-accent-cyan)] flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run Code
              </Button>
              <Button
                variant="secondary"
                onClick={() => executeAction("fix")}
                disabled={loading}
                className="hover:shadow-[0_0_12px_var(--color-accent-pink)] flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
                Fix Code
              </Button>
              <Button
                variant="secondary"
                onClick={() => executeAction("explain")}
                disabled={loading}
                className="hover:shadow-[0_0_12px_var(--color-accent-amber)] flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                Explain Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output & AI Assistant Panel - Always visible now */}
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("output")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "output"
                  ? "bg-accent/30 shadow-[0_0_8px_var(--color-accent-cyan)]"
                  : "hover:bg-accent/10"
                  }`}
              >
                <Terminal className="w-4 h-4" />
                Output
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "ai"
                  ? "bg-accent/30 shadow-[0_0_8px_var(--color-accent-purple)]"
                  : "hover:bg-accent/10"
                  }`}
              >
                <Bot className="w-4 h-4" />
                AI Assistant
              </button>
              {outputType === "error" && <AlertCircle className="w-4 h-4 text-red-500 ml-auto" />}
              {outputType === "success" && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`rounded-lg border border-border/60 p-4 ${isFullscreen ? "min-h-[200px] max-h-[200px]" : "min-h-[450px] max-h-[450px]"} overflow-auto ${outputType === "error"
                ? "bg-red-950/20 border-red-500/30"
                : outputType === "success"
                  ? "bg-green-950/20 border-green-500/30"
                  : "bg-background"
                }`}
            >
              {activeTab === "output" ? (
                <pre className="whitespace-pre-wrap text-sm font-mono text-foreground/80">
                  {output || "Run code to see output here...\n\n💡 Tip: Use the AI Assistant tab for code explanations and suggestions!"}
                </pre>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {output || "Click 'Explain Code' to get AI-powered insights about your code."}
                  </p>
                  <div className="pt-4 border-t border-border/30">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      Quick Actions
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => executeAction("explain")}
                        disabled={loading}
                        className="w-full text-left px-3 py-2 rounded-md bg-accent/10 hover:bg-accent/20 text-sm transition-colors"
                      >
                        💡 Explain this code
                      </button>
                      <button
                        onClick={() => executeAction("fix")}
                        disabled={loading}
                        className="w-full text-left px-3 py-2 rounded-md bg-accent/10 hover:bg-accent/20 text-sm transition-colors"
                      >
                        🔧 Find and fix bugs
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-friendly tips */}
      <div className="lg:hidden">
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Rotate your device to landscape mode for a better coding experience!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
