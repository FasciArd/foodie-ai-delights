import { motion } from 'framer-motion';
import { ArrowLeft, Newspaper, Download, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const Press = () => {
  const navigate = useNavigate();

  const pressReleases = [
    {
      id: '1',
      title: 'FoodieHub Raises $10M Series A Funding',
      date: 'December 2025',
      excerpt: 'FoodieHub secures significant investment to expand operations across Pakistan.',
    },
    {
      id: '2',
      title: 'Launch of HomeChefs Platform',
      date: 'October 2025',
      excerpt: 'New platform connects home-based chefs with food lovers across Karachi.',
    },
    {
      id: '3',
      title: 'FoodieHub Reaches 1 Million Orders',
      date: 'August 2025',
      excerpt: 'Milestone achievement demonstrates rapid growth in Pakistan food delivery market.',
    },
  ];

  const handleDownloadKit = () => {
    toast.success('Press kit download started!');
  };

  const handleContactPress = () => {
    toast.success('Press inquiry submitted! Our PR team will contact you shortly.');
  };

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Press & Media
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Get the latest news, press releases, and media resources from FoodieHub.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleDownloadKit}>
                <Download className="w-4 h-4 mr-2" />
                Download Press Kit
              </Button>
              <Button variant="outline" onClick={handleContactPress}>
                <Mail className="w-4 h-4 mr-2" />
                Contact PR Team
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
            <Newspaper className="w-6 h-6 text-primary" />
            Press Releases
          </h2>
          
          <div className="space-y-6">
            {pressReleases.map((release, index) => (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/press/${release.id}`)}
                className="card-base p-6 group cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-sm text-primary font-medium">{release.date}</span>
                    <h3 className="text-lg font-bold text-foreground mt-1 mb-2 group-hover:text-primary transition-colors">
                      {release.title}
                    </h3>
                    <p className="text-muted-foreground">{release.excerpt}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Contact */}
      <section className="py-16 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Media Inquiries</h2>
            <p className="text-muted-foreground mb-6">
              For press inquiries, interviews, or media partnerships, please contact our PR team.
            </p>
            <div className="inline-flex items-center gap-2 text-primary font-medium">
              <Mail className="w-5 h-5" />
              press@foodiehub.pk
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Press;
