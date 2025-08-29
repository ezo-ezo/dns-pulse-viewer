import { Link } from 'react-router-dom';
import { Activity, BarChart3, Network, Shield, Zap, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import heroImage from '@/assets/hero-network.jpg';

const Index = () => {
  const features = [
    {
      icon: Activity,
      title: 'Real-time Capture',
      description: 'Monitor DNS packets as they flow through your network in real-time with advanced filtering capabilities.'
    },
    {
      icon: Eye,
      title: 'Detailed Analysis',
      description: 'Deep dive into packet structure, headers, and payload data for comprehensive network diagnostics.'
    },
    {
      icon: BarChart3,
      title: 'Visual Statistics',
      description: 'Interactive charts and graphs showing traffic patterns, query types, and network performance metrics.'
    },
    {
      icon: Shield,
      title: 'Security Insights',
      description: 'Identify potential security threats and anomalous DNS behavior patterns in your network.'
    },
    {
      icon: Zap,
      title: 'High Performance',
      description: 'Optimized for high-throughput networks with minimal impact on system performance.'
    },
    {
      icon: Network,
      title: 'Network Topology',
      description: 'Visualize DNS query paths and network relationships for better network understanding.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative py-20 lg:py-32 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(34, 39, 46, 0.8), rgba(34, 39, 46, 0.9)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="network-pulse inline-block mb-6">
            <Network className="h-16 w-16 text-primary mx-auto" />
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 data-glow">
            <span className="text-primary">DNS</span> Pulse Viewer
          </h1>
          
          <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Capture and analyze DNS packets in real-time. 
            <br />
            <span className="text-secondary">Professional network monitoring made simple.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/capture">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg data-glow">
                Start Analysis
              </Button>
            </Link>
            
            <Link to="/stats">
              <Button variant="outline" size="lg" className="border-secondary text-secondary hover:bg-secondary/10 px-8 py-3 text-lg">
                View Statistics
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Professional <span className="text-primary">Network Analysis</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced DNS packet analysis tools designed for network administrators, 
              security professionals, and developers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="network-card hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Monitor Your Network?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start capturing and analyzing DNS traffic in real-time.
          </p>
          <Link to="/capture">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3">
              Begin Packet Capture
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;