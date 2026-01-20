import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Shield, Eye, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const Privacy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: 'We collect information you provide directly, including name, email, phone number, delivery address, and payment information. We also collect order history and preferences to improve your experience.',
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: 'Your information is used to process orders, communicate with you, improve our services, and personalize your experience. We may send promotional offers unless you opt out.',
    },
    {
      icon: Shield,
      title: 'Data Security',
      content: 'We implement industry-standard security measures to protect your data. Payment information is encrypted and processed through secure payment gateways. We never store complete card details.',
    },
    {
      icon: Lock,
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal data. You can update your preferences in your account settings or contact our support team for assistance.',
    },
  ];

  const dataPoints = [
    'Personal details (name, email, phone)',
    'Delivery addresses',
    'Order history and preferences',
    'Payment transaction records',
    'Device and usage information',
    'Location data (when permitted)',
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
              <Lock className="w-8 h-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Privacy Policy
              </h1>
            </div>
            <p className="text-muted-foreground">
              Last updated: January 1, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-base p-6"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <section.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{section.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>

          {/* Data We Collect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-6"
          >
            <h3 className="text-lg font-bold text-foreground mb-4">Data We Collect</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {dataPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  {point}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
