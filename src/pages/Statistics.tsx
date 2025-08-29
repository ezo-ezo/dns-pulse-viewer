import { useState } from 'react';
import { BarChart3, TrendingUp, Globe, Clock, Shield, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

// Mock data for charts
const queryTypeData = [
  { type: 'A', count: 1245, percentage: 45 },
  { type: 'AAAA', count: 678, percentage: 25 },
  { type: 'MX', count: 432, percentage: 16 },
  { type: 'CNAME', count: 289, percentage: 10 },
  { type: 'NS', count: 108, percentage: 4 }
];

const topDomains = [
  { domain: 'google.com', queries: 856, percentage: 35 },
  { domain: 'cloudflare.com', queries: 623, percentage: 25 },
  { domain: 'github.com', queries: 445, percentage: 18 },
  { domain: 'stackoverflow.com', queries: 334, percentage: 14 },
  { domain: 'api.example.com', queries: 198, percentage: 8 }
];

const sourceIps = [
  { ip: '192.168.1.100', queries: 1234, percentage: 28 },
  { ip: '192.168.1.50', queries: 987, percentage: 22 },
  { ip: '192.168.1.25', queries: 765, percentage: 17 },
  { ip: '192.168.1.150', queries: 543, percentage: 12 },
  { ip: '192.168.1.75', queries: 432, percentage: 10 }
];

const Statistics = () => {
  const [timeRange, setTimeRange] = useState('24h');

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Statistics Dashboard</h1>
            <p className="text-muted-foreground">DNS traffic analysis and network insights</p>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="network-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">24,756</div>
              <p className="text-xs text-success">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="network-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">98.2%</div>
              <p className="text-xs text-muted-foreground">
                24,321 successful queries
              </p>
            </CardContent>
          </Card>

          <Card className="network-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24ms</div>
              <p className="text-xs text-success">
                -5ms from last period
              </p>
            </CardContent>
          </Card>

          <Card className="network-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Sources</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">147</div>
              <p className="text-xs text-muted-foreground">
                Active IP addresses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Query Types Distribution */}
          <Card className="network-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Query Types Distribution
              </CardTitle>
              <CardDescription>
                DNS record types queried in the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queryTypeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary network-pulse" />
                      <span className="font-mono text-sm">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <Progress value={item.percentage} className="flex-1" />
                      <span className="text-sm text-muted-foreground min-w-[40px]">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="text-sm font-medium">{item.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Queried Domains */}
          <Card className="network-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-secondary" />
                Most Queried Domains
              </CardTitle>
              <CardDescription>
                Domains with the highest query frequency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDomains.map((domain, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">
                        {index + 1}
                      </div>
                      <span className="font-medium truncate">{domain.domain}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <Progress value={domain.percentage} className="flex-1" />
                      <span className="text-sm text-muted-foreground min-w-[40px]">
                        {domain.percentage}%
                      </span>
                    </div>
                    <div className="text-sm font-medium">{domain.queries}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Source IP Analysis */}
        <Card className="network-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Source IP Activity
            </CardTitle>
            <CardDescription>
              Network hosts generating DNS queries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sourceIps.map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{source.ip}</span>
                    <span className="text-sm text-muted-foreground">
                      {source.queries} queries
                    </span>
                  </div>
                  <Progress value={source.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {source.percentage}% of total traffic
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Network Health Summary */}
        <Card className="network-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Network Health Summary
            </CardTitle>
            <CardDescription>
              Overall DNS network performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success mb-2">Excellent</div>
                <div className="text-sm text-muted-foreground">Query Success Rate</div>
                <div className="text-xs text-muted-foreground mt-1">98.2% success</div>
              </div>
              
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">Fast</div>
                <div className="text-sm text-muted-foreground">Response Performance</div>
                <div className="text-xs text-muted-foreground mt-1">24ms average</div>
              </div>
              
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <div className="text-2xl font-bold text-secondary mb-2">Active</div>
                <div className="text-sm text-muted-foreground">Network Usage</div>
                <div className="text-xs text-muted-foreground mt-1">147 active sources</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;