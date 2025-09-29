import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Network, Clock, Globe } from "lucide-react";
import { toast } from "sonner";

interface DNSResult {
  domain: string;
  ip: string;
  family: string;
  timestamp: string;
  nodeId?: string;
}

const DNSAnalyzer = () => {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DNSResult[]>([]);
  const [backendUrl, setBackendUrl] = useState("http://localhost:3001");

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/dns-query?domain=${encodeURIComponent(domain)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const newResult: DNSResult = {
        domain,
        ip: data.ip,
        family: data.family,
        timestamp: data.timestamp,
        nodeId: data.nodeId || "local",
      };
      
      setResults(prev => [newResult, ...prev]);
      toast.success(`DNS query resolved: ${data.ip}`);
      setDomain("");
    } catch (error) {
      console.error("DNS query error:", error);
      toast.error("Failed to resolve DNS query. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
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

        {/* Backend Configuration */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              Backend Configuration
            </CardTitle>
            <CardDescription>
              Set your backend server URL (default: http://localhost:3001)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="http://192.168.1.100:3001"
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={() => toast.success("Backend URL updated")}
              >
                Update
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              For LAN access, use your machine's IP address (e.g., http://192.168.1.100:3001)
            </p>
          </CardContent>
        </Card>

        {/* Query Form */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              DNS Query
            </CardTitle>
            <CardDescription>
              Enter a domain name to resolve its IP address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuery} className="flex gap-2">
              <Input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="flex-1"
                disabled={loading}
              />
              <Button 
                type="submit" 
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resolving...
                  </>
                ) : (
                  "Query DNS"
                )}
              </Button>
            </form>
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
                <p>No DNS queries yet. Start by entering a domain above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-border bg-background/50 hover:border-primary/30 transition-all"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Domain</p>
                        <p className="font-mono text-sm font-semibold">{result.domain}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">IP Address</p>
                        <p className="font-mono text-sm text-primary">{result.ip}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Family</p>
                        <Badge variant="outline" className="font-mono text-xs">
                          {result.family}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                        <p className="text-xs font-mono">{result.timestamp}</p>
                      </div>
                    </div>
                    {result.nodeId && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <Badge variant="secondary" className="text-xs">
                          Node: {result.nodeId}
                        </Badge>
                      </div>
                    )}
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
