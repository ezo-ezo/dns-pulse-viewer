import { X, Copy, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface PacketDetailsModalProps {
  packet: any;
  onClose: () => void;
}

export const PacketDetailsModal = ({ packet, onClose }: PacketDetailsModalProps) => {
  const { toast } = useToast();

  if (!packet) return null;

  const handleCopyData = () => {
    const packetData = JSON.stringify(packet, null, 2);
    navigator.clipboard.writeText(packetData);
    toast({
      title: "Copied to Clipboard",
      description: "Packet data has been copied to your clipboard",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Packet details are being exported",
    });
  };

  // Mock detailed packet information
  const packetDetails = {
    header: {
      id: packet.id,
      flags: {
        qr: 1,
        opcode: 0,
        aa: 0,
        tc: 0,
        rd: 1,
        ra: 1,
        z: 0,
        rcode: packet.response === 'Success' ? 0 : 3
      },
      questionCount: 1,
      answerCount: packet.response === 'Success' ? 1 : 0,
      authorityCount: 0,
      additionalCount: 1
    },
    question: {
      name: packet.queryName,
      type: packet.queryType,
      class: 'IN'
    },
    answer: packet.response === 'Success' ? {
      name: packet.queryName,
      type: packet.queryType,
      class: 'IN',
      ttl: Math.floor(Math.random() * 3600) + 300,
      data: packet.queryType === 'A' ? '93.184.216.34' : 
            packet.queryType === 'AAAA' ? '2606:2800:220:1:248:1893:25c8:1946' :
            packet.queryType === 'MX' ? '10 mail.example.com' :
            packet.queryType === 'CNAME' ? 'www.example.com' : 'ns1.example.com'
    } : null
  };

  return (
    <Dialog open={!!packet} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto network-card">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-primary">
              Packet Details - ID {packet.id}
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyData}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="font-mono">{new Date(packet.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source IP:</span>
                  <span className="font-mono">{packet.sourceIp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination IP:</span>
                  <span className="font-mono">{packet.destinationIp}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Query Name:</span>
                  <span className="font-semibold">{packet.queryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Query Type:</span>
                  <Badge variant="outline">{packet.queryType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Status:</span>
                  <Badge variant={packet.response === 'Success' ? 'default' : 'destructive'}>
                    {packet.response}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* DNS Header */}
          <div>
            <h3 className="text-lg font-semibold text-secondary mb-3">DNS Header</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Transaction ID</div>
                <div className="font-mono">{packetDetails.header.id}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Questions</div>
                <div className="font-mono">{packetDetails.header.questionCount}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Answers</div>
                <div className="font-mono">{packetDetails.header.answerCount}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Additional</div>
                <div className="font-mono">{packetDetails.header.additionalCount}</div>
              </div>
            </div>
            
            {/* Flags */}
            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-2">Flags</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={packetDetails.header.flags.qr ? 'default' : 'secondary'}>
                  QR: {packetDetails.header.flags.qr}
                </Badge>
                <Badge variant={packetDetails.header.flags.rd ? 'default' : 'secondary'}>
                  RD: {packetDetails.header.flags.rd}
                </Badge>
                <Badge variant={packetDetails.header.flags.ra ? 'default' : 'secondary'}>
                  RA: {packetDetails.header.flags.ra}
                </Badge>
                <Badge variant={packetDetails.header.flags.rcode === 0 ? 'default' : 'destructive'}>
                  RCODE: {packetDetails.header.flags.rcode}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Question Section */}
          <div>
            <h3 className="text-lg font-semibold text-accent mb-3">Question Section</h3>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="font-mono">{packetDetails.question.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-mono">{packetDetails.question.type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Class</div>
                  <div className="font-mono">{packetDetails.question.class}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Answer Section */}
          {packetDetails.answer && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-success mb-3">Answer Section</h3>
                <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Name</div>
                      <div className="font-mono">{packetDetails.answer.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Type</div>
                      <div className="font-mono">{packetDetails.answer.type}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">TTL</div>
                      <div className="font-mono">{packetDetails.answer.ttl}s</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Data</div>
                      <div className="font-mono">{packetDetails.answer.data}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{packet.responseTime}ms</div>
                <div className="text-sm text-muted-foreground">Response Time</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold text-accent">{packet.size}B</div>
                <div className="text-sm text-muted-foreground">Packet Size</div>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <div className="text-2xl font-bold text-secondary">
                  {packet.response === 'Success' ? '✓' : '✗'}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};