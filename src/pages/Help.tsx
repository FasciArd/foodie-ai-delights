import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, HelpCircle, Package, CreditCard, Truck, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

type CategoryKey = 'all' | 'Orders' | 'Payments' | 'Delivery' | 'Account';

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');

  const categories = [
    { key: 'Orders' as CategoryKey, icon: Package, title: 'Orders', description: 'Track, modify, or cancel orders' },
    { key: 'Payments' as CategoryKey, icon: CreditCard, title: 'Payments', description: 'Payment methods and refunds' },
    { key: 'Delivery' as CategoryKey, icon: Truck, title: 'Delivery', description: 'Delivery times and issues' },
    { key: 'Account' as CategoryKey, icon: MessageCircle, title: 'Account', description: 'Profile and settings help' },
  ];

  const faqs = [
    {
      id: '1',
      category: 'Orders',
      question: 'How do I track my order?',
      answer: 'You can track your order in real-time by going to "My Orders" section. Click on any active order to see live tracking with the rider\'s location on the map.',
    },
    {
      id: '2',
      category: 'Payments',
      question: 'What payment methods are accepted?',
      answer: 'We accept Cash on Delivery (COD), JazzCash, Easypaisa, FoodiePay Wallet, and all major credit/debit cards including Visa and Mastercard.',
    },
    {
      id: '3',
      category: 'Orders',
      question: 'How do I cancel my order?',
      answer: 'You can cancel your order before the restaurant starts preparing it. Go to "My Orders", select the order, and tap "Cancel Order". Refunds are processed within 3-5 business days.',
    },
    {
      id: '4',
      category: 'Delivery',
      question: 'What are the delivery hours?',
      answer: 'Delivery hours vary by restaurant. Most restaurants deliver from 10 AM to 12 AM. You can check specific timing on each restaurant\'s page.',
    },
    {
      id: '5',
      category: 'Account',
      question: 'How do I become a FoodiePro member?',
      answer: 'Go to the FoodiePro page from the menu and choose a subscription plan. Pro members get free delivery on orders above Rs. 599 and exclusive discounts.',
    },
    {
      id: '6',
      category: 'Orders',
      question: 'How do I report an issue with my order?',
      answer: 'Go to "My Orders", select the delivered order, and tap "Report Issue". You can describe the problem and upload a photo. Our customer support team will respond within 24 hours.',
    },
    {
      id: '7',
      category: 'Payments',
      question: 'How do I add money to my wallet?',
      answer: 'Go to "My Wallet" from the menu, tap "Add Money", select an amount, choose your payment method (JazzCash, Easypaisa, or Card), and complete the transaction. Bonus credits are added for larger top-ups!',
    },
    {
      id: '8',
      category: 'Payments',
      question: 'How long do refunds take?',
      answer: 'Refunds for cancelled orders are processed within 3-5 business days. Wallet refunds are instant. For card payments, it may take 5-7 business days to reflect in your bank account.',
    },
    {
      id: '9',
      category: 'Delivery',
      question: 'What if my order is late?',
      answer: 'If your order is taking longer than expected, you can track the rider\'s location in real-time. If there are significant delays, contact our support and you may be eligible for a delivery fee refund.',
    },
    {
      id: '10',
      category: 'Delivery',
      question: 'Can I change my delivery address after placing an order?',
      answer: 'You can change your delivery address only if the restaurant hasn\'t started preparing your order. Contact support immediately for address changes.',
    },
    {
      id: '11',
      category: 'Account',
      question: 'How do I change my password?',
      answer: 'Go to your Profile, tap on Settings, and select "Change Password". You\'ll need to enter your current password and then set a new one.',
    },
    {
      id: '12',
      category: 'Account',
      question: 'How do I delete my account?',
      answer: 'Contact our support team at support@foodiehub.pk to request account deletion. Please note that this action is irreversible and you\'ll lose all your order history and wallet balance.',
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
                onClick={() => setSelectedCategory(selectedCategory === category.key ? 'all' : category.key)}
                className={`card-base p-6 text-center cursor-pointer transition-all ${
                  selectedCategory === category.key 
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
                    : 'hover:border-primary/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                  selectedCategory === category.key ? 'bg-primary' : 'bg-primary/10'
                }`}>
                  <category.icon className={`w-6 h-6 ${
                    selectedCategory === category.key ? 'text-primary-foreground' : 'text-primary'
                  }`} />
                </div>
                <h3 className="font-bold text-foreground mb-1">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </motion.div>
            ))}
          </div>
          
          {selectedCategory !== 'all' && (
            <div className="text-center mt-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategory('all')}>
                Clear filter
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-primary" />
            {selectedCategory === 'all' ? 'Frequently Asked Questions' : `${selectedCategory} Help`}
            <span className="text-sm font-normal text-muted-foreground">
              ({filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'})
            </span>
          </h2>
          
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No results found</p>
              <p className="text-sm text-muted-foreground">Try a different search term or category</p>
            </div>
          ) : (
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
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {faq.category}
                      </span>
                      <span className="font-medium text-foreground">{faq.question}</span>
                    </div>
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
                      <p className="text-muted-foreground pl-20">{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-12 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is available 24/7 to assist you with any questions or issues.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="hero" onClick={() => navigate('/partner')}>
                Contact Support
              </Button>
              <Button variant="outline" onClick={() => window.location.href = 'mailto:support@foodiehub.pk'}>
                Email Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Help;
