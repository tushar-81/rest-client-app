"use client";
import React, { useState, useEffect, useRef } from "react";

const METHODS = ["GET", "POST", "PUT", "DELETE"];
const COMMON_HEADERS = [
  { key: "Content-Type", value: "application/json" },
  { key: "Content-Type", value: "application/x-www-form-urlencoded" },
  { key: "Content-Type", value: "multipart/form-data" },
  { key: "Authorization", value: "Bearer " },
  { key: "Accept", value: "application/json" },
  { key: "Accept", value: "*/*" },
  { key: "Cache-Control", value: "no-cache" },
  { key: "X-Requested-With", value: "XMLHttpRequest" },
];


const ALL_HEADERS = [
  "Accept",
  "Accept-Charset",
  "Accept-Encoding",
  "Accept-Language",
  "Accept-Datetime",
  "Access-Control-Request-Method",
  "Access-Control-Request-Headers",
  "Authorization",
  "Cache-Control",
  "Connection",
  "Content-Length",
  "Content-Type",
  "Cookie",
  "Date",
  "Expect",
  "Forwarded",
  "From",
  "Host",
  "If-Match",
  "If-Modified-Since",
  "If-None-Match",
  "If-Range",
  "If-Unmodified-Since",
  "Max-Forwards",
  "Origin",
  "Pragma",
  "Proxy-Authorization",
  "Range",
  "Referer",
  "TE",
  "User-Agent",
  "Upgrade",
  "Via",
  "Warning",
  "X-Requested-With",
  "X-Forwarded-For",
  "X-Forwarded-Host",
  "X-Forwarded-Proto",
  "X-Csrf-Token",
  "X-API-Key"
];


const COMMON_HEADER_VALUES = {
  "Content-Type": [
    "application/json", 
    "application/x-www-form-urlencoded", 
    "multipart/form-data", 
    "text/plain", 
    "text/html", 
    "application/xml"
  ],
  "Accept": [
    "application/json", 
    "*/*", 
    "text/plain", 
    "text/html", 
    "application/xml"
  ],
  "Cache-Control": [
    "no-cache", 
    "no-store", 
    "max-age=0", 
    "private", 
    "public"
  ],
  "Connection": ["keep-alive", "close"]
};


const COMMON_ENDPOINTS = [
  "http://localhost:3000/api",
  "http://localhost:4000/api",
  "http://localhost:5000/api",
  "http://localhost:4000/users/login",
  "http://localhost:4000/users/register",
  "http://localhost:4000/users/profile",
  "https://jsonplaceholder.typicode.com/posts",
  "https://jsonplaceholder.typicode.com/users",
  "https://jsonplaceholder.typicode.com/comments",
  "https://api.github.com/users",
  "https://api.github.com/repos",
];


const BODY_TEMPLATES = {
  login: {
    name: "Login Request",
    body: {
      email: "user@example.com",
      password: "password123"
    }
  },
  register: {
    name: "Register User",
    body: {
      fullname: {
        firstname: "John",
        lastname: "Doe"
      },
      email: "user@example.com",
      password: "password123"
    }
  },
  post: {
    name: "Create Post",
    body: {
      title: "New Post Title",
      body: "Post content goes here",
      userId: 1
    }
  }
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headerList, setHeaderList] = useState<{key: string, value: string, enabled: boolean}[]>([]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [newHeaderKey, setNewHeaderKey] = useState("");
  const [showHeaderDropdown, setShowHeaderDropdown] = useState(false);
  const [showUrlSuggestions, setShowUrlSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showBodyTemplates, setShowBodyTemplates] = useState(false);
  
 
  const [activeHeaderIndex, setActiveHeaderIndex] = useState<number | null>(null);
  const [headerKeySuggestions, setHeaderKeySuggestions] = useState<string[]>([]);
  const [headerValueSuggestions, setHeaderValueSuggestions] = useState<string[]>([]);
  const [showHeaderKeySuggestions, setShowHeaderKeySuggestions] = useState(false);
  const [showHeaderValueSuggestions, setShowHeaderValueSuggestions] = useState(false);

  const urlInputRef = useRef<HTMLInputElement>(null);
  const urlSuggestionsRef = useRef<HTMLDivElement>(null);
  const headerKeyRefs = useRef<(HTMLInputElement | null)[]>([]);
  const headerValueRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    fetch(`/api/history?page=${page}&pageSize=${pageSize}`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data.items);
        setTotal(data.total);
      });
  }, [page, pageSize, response]);

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (urlSuggestionsRef.current && !urlSuggestionsRef.current.contains(event.target as Node) && 
          urlInputRef.current && !urlInputRef.current.contains(event.target as Node)) {
        setShowUrlSuggestions(false);
      }
      
      
      if (showHeaderKeySuggestions || showHeaderValueSuggestions) {
        let isInsideHeaderInput = false;
        
        
        headerKeyRefs.current.forEach((ref, idx) => {
          if (ref && ref.contains(event.target as Node)) {
            isInsideHeaderInput = true;
          }
        });
        
        headerValueRefs.current.forEach((ref, idx) => {
          if (ref && ref.contains(event.target as Node)) {
            isInsideHeaderInput = true;
          }
        });
        
        if (!isInsideHeaderInput) {
          setShowHeaderKeySuggestions(false);
          setShowHeaderValueSuggestions(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHeaderKeySuggestions, showHeaderValueSuggestions]);
  
  
  const handleHeaderKeyChange = (index: number, value: string) => {
    updateHeaderKey(index, value);
    setActiveHeaderIndex(index);
    
    
    const suggestions = value.length > 0 
      ? ALL_HEADERS.filter(header => header.toLowerCase().includes(value.toLowerCase())).slice(0, 5)
      : ALL_HEADERS.slice(0, 5);
    
    setHeaderKeySuggestions(suggestions);
    setShowHeaderKeySuggestions(true); 
    setShowHeaderValueSuggestions(false);
  };
  
  
  const handleHeaderValueChange = (index: number, value: string) => {
    updateHeaderValue(index, value);
    setActiveHeaderIndex(index);
    
    const headerKey = headerList[index].key.trim();
    
    
    const commonValues = COMMON_HEADER_VALUES[headerKey as keyof typeof COMMON_HEADER_VALUES] || [];
    
    if (commonValues.length > 0) {
      
      const suggestions = value.length > 0
        ? commonValues.filter(val => val.toLowerCase().includes(value.toLowerCase()))
        : commonValues;
      
      setHeaderValueSuggestions(suggestions);
      setShowHeaderValueSuggestions(true);
      setShowHeaderKeySuggestions(false);
    } else {
      setShowHeaderValueSuggestions(false);
    }
  };
  
  
  const selectHeaderKeySuggestion = (suggestion: string) => {
    if (activeHeaderIndex !== null) {
      
      const newList = [...headerList];
      newList[activeHeaderIndex].key = suggestion;
      setHeaderList(newList);
      
      setShowHeaderKeySuggestions(false);
      
      
      setTimeout(() => {
        if (headerValueRefs.current[activeHeaderIndex]) {
          headerValueRefs.current[activeHeaderIndex]?.focus();
        }
      }, 50);
      
      
      if (COMMON_HEADER_VALUES[suggestion as keyof typeof COMMON_HEADER_VALUES]) {
        setHeaderValueSuggestions(COMMON_HEADER_VALUES[suggestion as keyof typeof COMMON_HEADER_VALUES]);
        setShowHeaderValueSuggestions(true);
      }
    }
  };
  
  
  const selectHeaderValueSuggestion = (suggestion: string) => {
    if (activeHeaderIndex !== null) {
      
      const newList = [...headerList];
      newList[activeHeaderIndex].value = suggestion;
      setHeaderList(newList);
      
      setShowHeaderValueSuggestions(false);
      
      
      if (activeHeaderIndex === headerList.length - 1) {
        addHeader();
      }
    }
  };

  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setUrl(input);
    
    if (input.length > 0) {
      
      const historyUrls = history.map(h => h.url);
      const allSuggestions = [...new Set([...COMMON_ENDPOINTS, ...historyUrls])];
      
      
      const filtered = allSuggestions.filter(
        suggestion => suggestion.toLowerCase().includes(input.toLowerCase())
      );
      
      setFilteredSuggestions(filtered.slice(0, 8)); 
      setShowUrlSuggestions(filtered.length > 0);
    } else {
      setShowUrlSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setUrl(suggestion);
    setShowUrlSuggestions(false);
    
    
    if (suggestion.includes('/login')) {
      suggestBodyTemplate('login');
    } else if (suggestion.includes('/register')) {
      suggestBodyTemplate('register');
    } else if (suggestion.includes('/posts') && method === 'POST') {
      suggestBodyTemplate('post');
    }
  };

  const suggestBodyTemplate = (templateKey: keyof typeof BODY_TEMPLATES) => {
    if (method !== 'GET' && BODY_TEMPLATES[templateKey]) {
      const template = BODY_TEMPLATES[templateKey];
      setBody(JSON.stringify(template.body, null, 2));
      
     
      if (!headerList.some(h => h.key.toLowerCase() === 'content-type')) {
        addHeader('Content-Type', 'application/json');
      }
    }
  };

  const addHeader = (key: string = "", value: string = "") => {
    setHeaderList([...headerList, { key, value, enabled: true }]);
    setNewHeaderKey("");
    setShowHeaderDropdown(false);
  };

  const updateHeaderKey = (index: number, key: string) => {
    const newList = [...headerList];
    newList[index].key = key;
    setHeaderList(newList);
  };

  const updateHeaderValue = (index: number, value: string) => {
    const newList = [...headerList];
    newList[index].value = value;
    setHeaderList(newList);
  };

  const toggleHeaderEnabled = (index: number) => {
    const newList = [...headerList];
    newList[index].enabled = !newList[index].enabled;
    setHeaderList(newList);
  };

  const removeHeader = (index: number) => {
    const newList = [...headerList];
    newList.splice(index, 1);
    setHeaderList(newList);
  };

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setStatus(null);
    
    // Convert header list to object
    const headersObj = headerList.reduce((acc, header) => {
      if (header.enabled && header.key.trim()) {
        acc[header.key.trim()] = header.value;
      }
      return acc;
    }, {} as Record<string, string>);
    
    const res = await fetch("/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, method, headers: headersObj, body }),
    });
    const data = await res.json();
    setResponse(data.response);
    setStatus(data.status);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 text-center">REST Client App</h1>
      <form onSubmit={sendRequest} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 space-y-6">
        <div className="flex gap-2 relative">
          <select 
            value={method} 
            onChange={e => setMethod(e.target.value)} 
            className="border p-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
          >
            {METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
          <div className="flex-1 relative">
            <input
              ref={urlInputRef}
              className="w-full border p-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
              placeholder="Request URL"
              value={url}
              onChange={handleUrlChange}
              onFocus={() => {
                if (url && filteredSuggestions.length > 0) {
                  setShowUrlSuggestions(true);
                }
              }}
              required
            />
            {showUrlSuggestions && (
              <div 
                ref={urlSuggestionsRef}
                className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border rounded shadow-md z-10 max-h-60 overflow-y-auto"
              >
                {filteredSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Headers</label>
            <div className="relative">
              <button
                type="button"
                className="border p-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
                onClick={() => addHeader()}
              >
                Add Header
              </button>
              &nbsp;
              <div className="relative inline-block">
                <button
                  type="button"
                  className="border p-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
                  onClick={() => setShowHeaderDropdown(!showHeaderDropdown)}
                >
                  Common Headers
                </button>
                {showHeaderDropdown && (
                  <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border rounded shadow-md z-10 max-h-60 overflow-y-auto">
                    {COMMON_HEADERS.map((header, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                        onClick={() => {
                          addHeader(header.key, header.value);
                        }}
                      >
                        {header.key}: {header.value}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {headerList.length === 0 ? (
            <div className="text-sm text-gray-500 italic text-center py-2 border rounded">
              No headers added. Click "Add Header" to add one.
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {headerList.map((header, idx) => (
                <div key={idx} className="flex items-center gap-2 relative">
                  <input
                    type="checkbox"
                    checked={header.enabled}
                    onChange={() => toggleHeaderEnabled(idx)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1 relative">
                    <input
                      list={`header-keys-${idx}`}
                      ref={(el) => {headerKeyRefs.current[idx] = el;}}
                      className="w-full border p-1 rounded text-sm bg-white text-black dark:bg-gray-800 dark:text-white"
                      placeholder="Header"
                      value={header.key}
                      onChange={(e) => handleHeaderKeyChange(idx, e.target.value)}
                      onFocus={() => {
                        setActiveHeaderIndex(idx);
                        const suggestions = header.key.length > 0 
                          ? ALL_HEADERS.filter(h => h.toLowerCase().includes(header.key.toLowerCase())).slice(0, 5)
                          : ALL_HEADERS.slice(0, 5);
                        setHeaderKeySuggestions(suggestions);
                        setShowHeaderKeySuggestions(true);
                        setShowHeaderValueSuggestions(false);
                      }}
                      onClick={() => {
                        setActiveHeaderIndex(idx);
                        const suggestions = header.key.length > 0 
                          ? ALL_HEADERS.filter(h => h.toLowerCase().includes(header.key.toLowerCase())).slice(0, 5)
                          : ALL_HEADERS.slice(0, 5);
                        setHeaderKeySuggestions(suggestions);
                        setShowHeaderKeySuggestions(true);
                      }}
                    />
                    <datalist id={`header-keys-${idx}`}>  
                      {ALL_HEADERS.map((h) => <option key={h} value={h} />)}
                    </datalist>
                    {showHeaderKeySuggestions && activeHeaderIndex === idx && (
                      <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border rounded shadow-md z-20 max-h-40 overflow-y-auto">
                        {headerKeySuggestions.map((suggestion, suggestionIdx) => (
                          <button
                            key={suggestionIdx}
                            type="button"
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                            onClick={() => selectHeaderKeySuggestion(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      list={`header-values-${idx}`}
                      ref={(el) => {headerValueRefs.current[idx] = el;}}
                      className="w-full border p-1 rounded text-sm bg-white text-black dark:bg-gray-800 dark:text-white"
                      placeholder="Value"
                      value={header.value}
                      onChange={(e) => handleHeaderValueChange(idx, e.target.value)}
                      onFocus={() => {
                        setActiveHeaderIndex(idx);
                        const headerKey = header.key.trim();
                        if (headerKey && COMMON_HEADER_VALUES[headerKey as keyof typeof COMMON_HEADER_VALUES]) {
                          const values = COMMON_HEADER_VALUES[headerKey as keyof typeof COMMON_HEADER_VALUES];
                          setHeaderValueSuggestions(values);
                          setShowHeaderValueSuggestions(true);
                          setShowHeaderKeySuggestions(false);
                        }
                      }}
                    />
                    {COMMON_HEADER_VALUES[header.key as keyof typeof COMMON_HEADER_VALUES] && (
                      <datalist id={`header-values-${idx}`}>  
                        {COMMON_HEADER_VALUES[header.key as keyof typeof COMMON_HEADER_VALUES].map((v) => <option key={v} value={v} />)}
                      </datalist>
                    )}
                    {showHeaderValueSuggestions && activeHeaderIndex === idx && (
                      <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border rounded shadow-md z-20 max-h-40 overflow-y-auto">
                        {headerValueSuggestions.map((suggestion, suggestionIdx) => (
                          <button
                            key={suggestionIdx}
                            type="button"
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                            onClick={() => selectHeaderValueSuggestion(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="text-red-500 px-2 py-1"
                    onClick={() => removeHeader(idx)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {method !== "GET" && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Body</label>
              <div className="relative inline-block">
                <button 
                  type="button" 
                  className="text-sm px-2 py-1 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
                  onClick={() => setShowBodyTemplates(!showBodyTemplates)}
                >
                  Body Templates
                </button>
                {showBodyTemplates && (
                  <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border rounded shadow-md z-10 w-48">
                    {Object.entries(BODY_TEMPLATES).map(([key, template]) => (
                      <button
                        key={key}
                        type="button"
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                        onClick={() => {
                          setBody(JSON.stringify(template.body, null, 2));
                          setShowBodyTemplates(false);
                        }}
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <textarea
              className="w-full border p-1 rounded font-mono bg-white text-black dark:bg-gray-800 dark:text-white"
              rows={3}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Request body (raw)"
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-medium py-3 rounded-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Request"}
        </button>
      </form>

      <div className="space-y-6">
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Response {status !== null && <span className="text-sm text-gray-500">(Status: {status})</span>}</h2>
          <pre className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-4 rounded-lg overflow-x-auto min-h-[80px]">{response}</pre>
        </section>

        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Method</th>
                  <th className="p-3 text-left">URL</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-3 whitespace-nowrap">{new Date(h.createdAt).toLocaleString()}</td>
                    <td className="p-3">{h.method}</td>
                    <td className="p-3 max-w-[200px] truncate" title={h.url}>{h.url}</td>
                    <td className="p-3">{h.status}</td>
                    <td className="p-3">
                      <button
                        className="text-xs text-blue-500 hover:underline"
                        onClick={() => {
                          setUrl(h.url);
                          setMethod(h.method);
                          if (h.body) {
                            setBody(h.body);
                          }
                          try {
                            const parsedHeaders = typeof h.headers === 'string' ? 
                              JSON.parse(h.headers) : h.headers;
                            
                            const headerEntries = Object.entries(parsedHeaders).map(
                              ([key, value]) => ({ key, value: value as string, enabled: true })
                            );
                            
                            if (headerEntries.length > 0) {
                              setHeaderList(headerEntries);
                            }
                          } catch (e) {
                            console.error("Failed to parse headers", e);
                          }
                        }}
                      >
                        Reuse
                      </button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan={5} className="text-center p-2">No history</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 mt-2 justify-center items-center">
            <button
              className="px-2 py-1 border rounded disabled:opacity-50 bg-white text-black dark:bg-gray-800 dark:text-white"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >Prev</button>
            <span>Page {page} / {Math.ceil(total / pageSize) || 1}</span>
            <button
              className="px-2 py-1 border rounded disabled:opacity-50 bg-white text-black dark:bg-gray-800 dark:text-white"
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= total}
            >Next</button>
          </div>
        </section>
      </div>
    </div>
  );
}
