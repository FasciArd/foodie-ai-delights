import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using FoodieHub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.',
    },
    {
      title: '2. Use of Services',
      content: 'FoodieHub provides a platform connecting customers with restaurants and delivery partners. You must be at least 18 years old to use our services. You are responsible for maintaining the confidentiality of your account.',
    },
    {
      title: '3. Orders and Payments',
      content: 'All orders placed through FoodieHub are subject to availability and restaurant acceptance. Prices displayed include applicable taxes. Payment must be made at the time of order or upon delivery (COD).',
    },
    {
      title: '4. Delivery',
      content: 'Delivery times are estimates and may vary based on distance, traffic, and restaurant preparation time. FoodieHub and its delivery partners are not liable for delays caused by factors beyond our control.',
    },
    {
      title: '5. Cancellations and Refunds',
      content: 'Orders may be cancelled before the restaurant starts preparation. Refunds for cancelled orders are processed within 5-7 business days. Refunds for quality issues are subject to investigation.',
    },
    {
      title: '6. User Conduct',
      content: 'Users agree not to misuse the platform, engage in fraudulent activities, or harass restaurant staff or delivery partners. Violation may result in account suspension.',
    },
    {
      title: '7. Limitation of Liability',
      content: 'FoodieHub is not liable for the quality of food prepared by restaurants, food allergies, or any health issues arising from food consumption. We act solely as an intermediary platform.',
    },
    {
      title: '8. Changes to Terms',
      content: 'FoodieHub reserves the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.',
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
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Terms of Service
              </h1>
            </div>
            <p className="text-muted-foreground">
              Last updated: January 1, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <h2 className="text-xl font-bold text-foreground mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
