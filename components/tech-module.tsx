"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, Loader2, AlertCircle, CheckCircle } from "lucide-react"

const LANGUAGES = [
  { id: "javascript", name: "JavaScript", ext: ".js" },
  { id: "python", name: "Python", ext: ".py" },
  { id: "java", name: "Java", ext: ".java" },
  { id: "cpp", name: "C++", ext: ".cpp" },
  { id: "c", name: "C", ext: ".c" },
  { id: "csharp", name: "C#", ext: ".cs" },
  { id: "go", name: "Go", ext: ".go" },
  { id: "rust", name: "Rust", ext: ".rs" },
]

const DEFAULT_CODE: Record<string, string> = {
  javascript: `function greet(name) {
  return 'Hello, ' + name + '!'
}

console.log(greet('World'))`,
  python: `def greet(name):
    return f'Hello, {name}!'

print(greet('World'))`,
  java: `public class Main {
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
    
    public static void main(String[] args) {
        System.out.println(greet("World"));
    }
}`,
  cpp: `#include <iostream>
#include <string>

std::string greet(std::string name) {
    return "Hello, " + name + "!";
}

int main() {
    std::cout << greet("World") << std::endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  csharp: `using System;

class Program {
    static string Greet(string name) {
        return $"Hello, {name}!";
    }
    
    static void Main() {
        Console.WriteLine(Greet("World"));
    }
}`,
  go: `package main

import "fmt"

func greet(name string) string {
    return "Hello, " + name + "!"
}

func main() {
    fmt.Println(greet("World"))
}`,
  rust: `fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    println!("{}", greet("World"));
}`,
}

export function TechModule() {
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState(DEFAULT_CODE.javascript)
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [outputType, setOutputType] = useState<"success" | "error" | "info" | null>(null)

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    setCode(DEFAULT_CODE[lang] || "")
    setOutput("")
    setOutputType(null)
    setShowLanguageMenu(false)
  }

  const executeAction = async (action: "run" | "fix" | "explain") => {
    setLoading(true)
    setOutput("Processing...")
    setOutputType("info")
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
        setOutput("✓ Code fixed! Review the corrected code above.")
        setOutputType("success")
      } else if (action === "explain") {
        setOutput(data.output || "Unable to explain code.")
        setOutputType("success")
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

  const currentLang = LANGUAGES.find((l) => l.id === language)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Editor Card */}
      <Card className="border-border/60 bg-card/60 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Code Editor</CardTitle>
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent/20 hover:bg-accent/30 text-sm font-medium transition-colors"
              >
                {currentLang?.name}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-accent/20 transition-colors ${
                        language === lang.id ? "bg-accent/30 font-semibold" : ""
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-border/60 bg-background overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm bg-transparent outline-none resize-none"
              aria-label="Code editor"
              spellCheck="false"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => executeAction("run")}
              disabled={loading}
              className="hover:shadow-[0_0_12px_var(--color-accent-cyan)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Run Code
            </Button>
            <Button
              variant="secondary"
              onClick={() => executeAction("fix")}
              disabled={loading}
              className="hover:shadow-[0_0_12px_var(--color-accent-pink)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Fix Code
            </Button>
            <Button
              variant="secondary"
              onClick={() => executeAction("explain")}
              disabled={loading}
              className="hover:shadow-[0_0_12px_var(--color-accent-amber)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Explain Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Output Card */}
      <Card className="border-border/60 bg-card/60 backdrop-blur">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Output & Results</CardTitle>
            {outputType === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
            {outputType === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`rounded-lg border border-border/60 p-4 min-h-64 max-h-96 overflow-auto ${
              outputType === "error"
                ? "bg-red-950/20 border-red-500/30"
                : outputType === "success"
                  ? "bg-green-950/20 border-green-500/30"
                  : "bg-background"
            }`}
          >
            <pre className="whitespace-pre-wrap text-sm text-pretty font-mono text-foreground/80">
              {output || "Run code or ask AI to see results here..."}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
