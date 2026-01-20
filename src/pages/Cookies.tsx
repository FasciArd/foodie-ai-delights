import { motion } from 'framer-motion';
import { ArrowLeft, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const Cookies = () => {
  const navigate = useNavigate();

  const cookieTypes = [
    {
      title: 'Essential Cookies',
      description: 'Required for basic site functionality. These cannot be disabled as they are necessary for the website to work properly.',
      examples: ['Session management', 'Authentication', 'Security'],
    },
    {
      title: 'Functional Cookies',
      description: 'Remember your preferences and settings to provide a personalized experience.',
      examples: ['Language preferences', 'Location settings', 'Theme preferences'],
    },
    {
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors use our website so we can improve our services.',
      examples: ['Page views', 'User behavior', 'Performance metrics'],
    },
    {
      title: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements and track the effectiveness of marketing campaigns.',
      examples: ['Ad targeting', 'Campaign tracking', 'Social media integration'],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-8 h-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Cookie Policy
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              This policy explains how FoodieHub uses cookies and similar technologies 
              to recognize you when you visit our website and mobile app.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-sm max-w-none mb-12"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">What are cookies?</h2>
            <p className="text-muted-foreground mb-8">
              Cookies are small text files that are stored on your device when you visit a website. 
              They help the website remember your preferences and understand how you use the site.
            </p>
          </motion.div>

          <h2 className="text-xl font-bold text-foreground mb-6">Types of Cookies We Use</h2>
          <div className="space-y-6">
            {cookieTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-base p-6"
              >
                <h3 className="font-bold text-foreground mb-2">{type.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{type.description}</p>
                <div className="flex flex-wrap gap-2">
                  {type.examples.map((example, i) => (
                    <span key={i} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                      {example}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-6 bg-gradient-warm rounded-2xl"
          >
            <h3 className="font-bold text-foreground mb-3">Managing Your Cookie Preferences</h3>
            <p className="text-muted-foreground text-sm">
              You can control and manage cookies in your browser settings. Please note that 
              disabling certain cookies may affect the functionality of our website.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cookies;
