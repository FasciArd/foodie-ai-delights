import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, HelpCircle, Package, CreditCard, Truck, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const categories = [
    { icon: Package, title: 'Orders', description: 'Track, modify, or cancel orders' },
    { icon: CreditCard, title: 'Payments', description: 'Payment methods and refunds' },
    { icon: Truck, title: 'Delivery', description: 'Delivery times and issues' },
    { icon: MessageCircle, title: 'Account', description: 'Profile and settings help' },
  ];

  const faqs = [
    {
      id: '1',
      question: 'How do I track my order?',
      answer: 'You can track your order in real-time by going to "My Orders" section. Click on any active order to see live tracking with the rider\'s location on the map.',
    },
    {
      id: '2',
      question: 'What payment methods are accepted?',
      answer: 'We accept Cash on Delivery (COD), JazzCash, Easypaisa, and all major credit/debit cards including Visa and Mastercard.',
    },
    {
      id: '3',
      question: 'How do I cancel my order?',
      answer: 'You can cancel your order before the restaurant starts preparing it. Go to "My Orders", select the order, and tap "Cancel Order". Refunds are processed within 3-5 business days.',
    },
    {
      id: '4',
      question: 'What are the delivery hours?',
      answer: 'Delivery hours vary by restaurant. Most restaurants deliver from 10 AM to 12 AM. You can check specific timing on each restaurant\'s page.',
    },
    {
      id: '5',
      question: 'How do I become a FoodiePro member?',
      answer: 'Go to the FoodiePro page from the menu and choose a subscription plan. Pro members get free delivery on orders above Rs. 599 and exclusive discounts.',
    },
    {
      id: '6',
      question: 'How do I report an issue with my order?',
      answer: 'Go to "My Orders", select the problematic order, and tap "Report Issue". Our customer support team will respond within 24 hours.',
    },
  ];

  const filteredFaqs = faqs.filter(
    faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              How can we help?
            </h1>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help..."
                className="pl-12 py-6 text-lg rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-base p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-primary" />
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-base overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-foreground">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-4 pb-4"
                  >
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Help;
