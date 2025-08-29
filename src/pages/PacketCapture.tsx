import { useState, useEffect } from 'react';
import { Play, Pause, Square, Search, Filter, Download, Eye, Clock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PacketDetailsModal } from '@/components/PacketDetailsModal';
import { useToast } from '@/hooks/use-toast';

// Mock packet data for demonstration
const generateMockPacket = (id: number) => ({
  id,
  timestamp: new Date().toISOString(),
  sourceIp: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
  destinationIp: `8.8.${Math.floor(Math.random() * 2) + 8}.8`,
  queryName: ['google.com', 'cloudflare.com', 'github.com', 'stackoverflow.com', 'api.example.com'][Math.floor(Math.random() * 5)],
  queryType: ['A', 'AAAA', 'MX', 'CNAME', 'NS'][Math.floor(Math.random() * 5)],
  response: Math.random() > 0.1 ? 'Success' : 'NXDOMAIN',
  responseTime: Math.floor(Math.random() * 100) + 10,
  size: Math.floor(Math.random() * 512) + 64
});

const PacketCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [packets, setPackets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedPacket, setSelectedPacket] = useState<any>(null);
  const { toast } = useToast();

  // Simulate real-time packet capture
  useEffect(() => {
    if (!isCapturing) return;

    const interval = setInterval(() => {
      const newPacket = generateMockPacket(packets.length + 1);
      setPackets(prev => [newPacket, ...prev.slice(0, 99)]); // Keep last 100 packets
    }, Math.random() * 2000 + 500); // Random interval between 0.5-2.5 seconds

    return () => clearInterval(interval);
  }, [isCapturing, packets.length]);

  const handleStartCapture = () => {
    setIsCapturing(true);
    toast({
      title: "Capture Started",
      description: "DNS packet capture is now active",
    });
  };

  const handleStopCapture = () => {
    setIsCapturing(false);
    toast({
      title: "Capture Stopped", 
      description: "DNS packet capture has been stopped",
    });
  };

  const handleClearPackets = () => {
    setPackets([]);
    toast({
      title: "Packets Cleared",
      description: "All captured packets have been cleared",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Packet data is being exported to CSV",
    });
  };

  // Filter packets based on search and filter type
  const filteredPackets = packets.filter(packet => {
    const matchesSearch = !searchQuery || 
      packet.sourceIp.includes(searchQuery) ||
      packet.destinationIp.includes(searchQuery) ||
      packet.queryName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'success' && packet.response === 'Success') ||
      (filterType === 'error' && packet.response !== 'Success') ||
      packet.queryType === filterType;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Packet Capture</h1>
            <p className="text-muted-foreground">Monitor DNS packets in real-time</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {!isCapturing ? (
              <Button onClick={handleStartCapture} className="bg-secondary hover:bg-secondary/90">
                <Play className="h-4 w-4 mr-2" />
                Start Capture
              </Button>
            ) : (
              <Button onClick={handleStopCapture} variant="destructive">
                <Pause className="h-4 w-4 mr-2" />
                Stop Capture
              </Button>
            )}
            
            <Button onClick={handleClearPackets} variant="outline">
              <Square className="h-4 w-4 mr-2" />
              Clear
            </Button>
            
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="network-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Packets</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{packets.length}</div>
            </CardContent>
          </Card>

          <Card className="network-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capture Status</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={isCapturing ? "default" : "secondary"} className={isCapturing ? "network-pulse" : ""}>
                {isCapturing ? "Active" : "Inactive"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="network-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {packets.length > 0 
                  ? Math.round((packets.filter(p => p.response === 'Success').length / packets.length) * 100)
                  : 0}%
              </div>
            </CardContent>
          </Card>

          <Card className="network-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {packets.length > 0 
                  ? Math.round(packets.reduce((acc, p) => acc + p.responseTime, 0) / packets.length)
                  : 0}ms
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by IP, domain name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Packets</SelectItem>
                  <SelectItem value="success">Success Only</SelectItem>
                  <SelectItem value="error">Errors Only</SelectItem>
                  <SelectItem value="A">A Records</SelectItem>
                  <SelectItem value="AAAA">AAAA Records</SelectItem>
                  <SelectItem value="MX">MX Records</SelectItem>
                  <SelectItem value="CNAME">CNAME Records</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Packets Table */}
        <Card className="packet-table">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Captured Packets ({filteredPackets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Source IP</TableHead>
                    <TableHead>Destination IP</TableHead>
                    <TableHead>Query Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Time (ms)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {isCapturing ? "Waiting for packets..." : "No packets captured. Start capture to begin monitoring."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPackets.map((packet) => (
                      <TableRow key={packet.id} className="hover:bg-muted/50 cursor-pointer packet-flow">
                        <TableCell className="font-mono text-sm">
                          {new Date(packet.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell className="font-mono">{packet.sourceIp}</TableCell>
                        <TableCell className="font-mono">{packet.destinationIp}</TableCell>
                        <TableCell className="font-semibold">{packet.queryName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{packet.queryType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={packet.response === 'Success' ? 'default' : 'destructive'}>
                            {packet.response}
                          </Badge>
                        </TableCell>
                        <TableCell>{packet.responseTime}ms</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedPacket(packet)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packet Details Modal */}
      <PacketDetailsModal 
        packet={selectedPacket}
        onClose={() => setSelectedPacket(null)}
      />
    </div>
  );
};

export default PacketCapture;