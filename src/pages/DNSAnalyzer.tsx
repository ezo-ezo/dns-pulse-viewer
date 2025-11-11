import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, Clock, Activity, Wifi } from "lucide-react";
import { toast } from "sonner";

interface DNSResult {
  id: number;
  domain: string;
  type: string;
  timestamp: string;
  packetNumber: number;
}

const DNSAnalyzer = () => {
  const [results, setResults] = useState<DNSResult[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [backendUrl, setBackendUrl] = useState("ws://localhost:3001");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(backendUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setIsAnalyzing(true);
        toast.success("Connected to DNS capture backend");
        console.log("WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const newResult: DNSResult = {
            id: data.id,
            domain: data.domain,
            type: data.type,
            timestamp: data.timestamp,
            packetNumber: data.packetNumber,
          };
          
          setResults((prev) => [newResult, ...prev.slice(0, 99)]); // Keep last 100 results
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast.error("WebSocket connection error");
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsAnalyzing(false);
        toast.error("Disconnected from backend");
        console.log("WebSocket closed");
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      toast.error("Failed to connect to backend");
    }
  };

  const handleStartAnalysis = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connectWebSocket();
  };

  const handleStopAnalysis = () => {
    if (wsRef.current) {
      wsRef.current.close();
      setIsAnalyzing(false);
      toast.success("Analysis stopped");
    }
  };

  const clearResults = () => {
    setResults([]);
    toast.success("Results cleared");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
            Live DNS Analyzer
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Query DNS records in real-time across your LAN network
          </p>
        </div>

        {/* Connection Status */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-primary" />
                Live DNS Capture
              </span>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Capturing live DNS queries from your LAN network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="ws://192.168.1.100:3001"
                className="flex-1"
                disabled={isAnalyzing}
              />
              {!isAnalyzing ? (
                <Button 
                  onClick={handleStartAnalysis}
                >
                  Start Analysis
                </Button>
              ) : (
                <Button 
                  variant="destructive" 
                  onClick={handleStopAnalysis}
                >
                  Stop Analysis
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={clearResults}
              >
                Clear
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              For LAN access, use your machine's IP address (e.g., ws://192.168.1.100:3001)
            </p>
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4 animate-pulse text-green-500" />
                <span>Listening for DNS packets...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Query Results
              </span>
              <Badge variant="secondary">{results.length} queries</Badge>
            </CardTitle>
            <CardDescription>
              Live DNS query results from your LAN network
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {isAnalyzing 
                    ? "Waiting for DNS traffic... Open websites or run DNS queries to see live results."
                    : "Click 'Start Analysis' to begin capturing DNS packets."}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={`${result.id}-${index}`}
                    className="p-4 rounded-lg border border-border bg-background/50 hover:border-primary/30 transition-all animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Packet #</p>
                        <Badge variant="outline" className="font-mono">
                          {result.packetNumber}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Domain</p>
                        <p className="font-mono text-sm font-semibold break-all">{result.domain}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Query Type</p>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {result.type}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                        <p className="text-xs font-mono">{new Date(result.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DNSAnalyzer;
