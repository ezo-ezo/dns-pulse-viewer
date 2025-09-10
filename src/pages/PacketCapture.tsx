import { useState, useEffect } from 'react';
import { Play, Pause, Square, Search, Filter, Download, Eye, Clock, Globe, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PacketDetailsModal } from '@/components/PacketDetailsModal';
import { FileUploadNote } from '@/components/FileUploadNote';
import { useToast } from '@/hooks/use-toast';

// Mock packet data matching dns_output.txt format
const generateMockPacket = (id: number) => ({
  packetNumber: id,
  sourceIp: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
  destinationIp: `8.8.${Math.floor(Math.random() * 2) + 8}.8`,
  sourcePort: Math.floor(Math.random() * 65000) + 1024,
  destinationPort: 53, // DNS port
  domainQueried: ['google.com', 'cloudflare.com', 'github.com', 'stackoverflow.com', 'api.example.com', 'facebook.com', 'youtube.com'][Math.floor(Math.random() * 7)],
  queryResponseType: ['Query', 'Response'][Math.floor(Math.random() * 2)],
  transactionId: Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0'),
  timestamp: new Date().toISOString()
});

const PacketCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [packets, setPackets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedPacket, setSelectedPacket] = useState<any>(null);
  const [sortField, setSortField] = useState<string>('packetNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  // Simulate real-time packet capture
  useEffect(() => {
    if (!isCapturing) return;

    const interval = setInterval(() => {
      const newPacket = generateMockPacket(packets.length + 1);
      setPackets(prev => [newPacket, ...prev.slice(0, 199)]); // Keep last 200 packets
    }, Math.random() * 3000 + 1000); // Random interval between 1-4 seconds

    return () => clearInterval(interval);
  }, [isCapturing, packets.length]);

  const handleStartCapture = () => {
    setIsCapturing(true);
    toast({
      title: "Analysis Started",
      description: "DNS packet analysis is now active",
    });
  };

  const handleStopCapture = () => {
    setIsCapturing(false);
    toast({
      title: "Analysis Stopped", 
      description: "DNS packet analysis has been stopped",
    });
  };

  const handleClearPackets = () => {
    setPackets([]);
    toast({
      title: "Results Cleared",
      description: "All analyzed packets have been cleared",
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Packet Number', 'Source IP', 'Destination IP', 'Source Port', 'Destination Port', 'Domain Queried', 'Query/Response Type', 'Transaction ID'],
      ...packets.map(p => [p.packetNumber, p.sourceIp, p.destinationIp, p.sourcePort, p.destinationPort, p.domainQueried, p.queryResponseType, p.transactionId])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dns_analysis_results.csv';
    a.click();
    
    toast({
      title: "Export Complete",
      description: "DNS analysis results exported to CSV",
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort packets
  const filteredAndSortedPackets = packets
    .filter(packet => {
      const matchesSearch = !searchQuery || 
        packet.sourceIp.includes(searchQuery) ||
        packet.destinationIp.includes(searchQuery) ||
        packet.domainQueried.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterType === 'all' || 
        (filterType === 'query' && packet.queryResponseType === 'Query') ||
        (filterType === 'response' && packet.queryResponseType === 'Response');

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * modifier;
      }
      return String(aValue).localeCompare(String(bValue)) * modifier;
    });

  // Calculate statistics  
  const uniqueDomains = [...new Set(packets.map(p => p.domainQueried))];
  const domainCounts = packets.reduce((acc, p) => {
    acc[p.domainQueried] = (acc[p.domainQueried] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostQueriedDomain = Object.entries(domainCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0];

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">DNS Analysis Results</h1>
            <p className="text-muted-foreground">Real-time DNS packet analysis from dns_output.txt</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {!isCapturing ? (
              <Button onClick={handleStartCapture} className="bg-secondary hover:bg-secondary/90">
                <Play className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            ) : (
              <Button onClick={handleStopCapture} variant="destructive">
                <Pause className="h-4 w-4 mr-2" />
                Stop Analysis
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

        {/* File Integration Note */}
        <FileUploadNote />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="network-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Packets Analyzed</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{packets.length}</div>
            </CardContent>
          </Card>

          <Card className="network-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analysis Status</CardTitle>
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
              <CardTitle className="text-sm font-medium">Unique Domains</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {uniqueDomains.length}
              </div>
            </CardContent>
          </Card>

          <Card className="network-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Queried</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold truncate">
                {mostQueriedDomain ? mostQueriedDomain[0] : 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">
                {mostQueriedDomain ? `${mostQueriedDomain[1]} queries` : ''}
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
                  <SelectItem value="query">Queries Only</SelectItem>
                  <SelectItem value="response">Responses Only</SelectItem>
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
              DNS Analysis Results ({filteredAndSortedPackets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('packetNumber')}>
                      Packet # {sortField === 'packetNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('sourceIp')}>
                      Source IP {sortField === 'sourceIp' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('destinationIp')}>
                      Destination IP {sortField === 'destinationIp' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('sourcePort')}>
                      Source Port {sortField === 'sourcePort' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('destinationPort')}>
                      Dest Port {sortField === 'destinationPort' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('domainQueried')}>
                      Domain Queried {sortField === 'domainQueried' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('queryResponseType')}>
                      Type {sortField === 'queryResponseType' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('transactionId')}>
                      Transaction ID {sortField === 'transactionId' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedPackets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        {isCapturing ? "Waiting for DNS packets..." : "No packets analyzed. Start analysis to begin monitoring dns_output.txt"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedPackets.map((packet) => (
                      <TableRow key={packet.packetNumber} className="hover:bg-muted/50 cursor-pointer packet-flow">
                        <TableCell className="font-mono text-sm font-semibold">
                          {packet.packetNumber}
                        </TableCell>
                        <TableCell className="font-mono">{packet.sourceIp}</TableCell>
                        <TableCell className="font-mono">{packet.destinationIp}</TableCell>
                        <TableCell className="font-mono">{packet.sourcePort}</TableCell>
                        <TableCell className="font-mono">{packet.destinationPort}</TableCell>
                        <TableCell className="font-semibold">{packet.domainQueried}</TableCell>
                        <TableCell>
                          <Badge variant={packet.queryResponseType === 'Query' ? 'outline' : 'default'}>
                            {packet.queryResponseType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-accent">0x{packet.transactionId}</TableCell>
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