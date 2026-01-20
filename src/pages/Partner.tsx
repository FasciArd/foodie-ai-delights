import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Store, TrendingUp, Users, DollarSign, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const Partner = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    cuisine: '',
    message: '',
  });

  const benefits = [
    { icon: Users, title: 'Reach More Customers', description: 'Access to 1M+ hungry customers in Karachi' },
    { icon: TrendingUp, title: 'Grow Your Business', description: 'Average 40% increase in orders for partners' },
    { icon: DollarSign, title: 'Competitive Rates', description: 'Low commission rates with transparent pricing' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.restaurantName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Application submitted! Our team will contact you within 48 hours.');
    setFormData({
      restaurantName: '',
      ownerName: '',
      email: '',
      phone: '',
      address: '',
      cuisine: '',
      message: '',
    });
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
            <div className="flex items-center gap-3 mb-4">
              <Store className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Become a Restaurant Partner
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Join Karachi's fastest-growing food delivery platform and reach thousands 
              of new customers. Start receiving orders today!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-background/50"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Apply Now</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Restaurant Name *</Label>
                  <Input
                    value={formData.restaurantName}
                    onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                    placeholder="Your restaurant name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="restaurant@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Restaurant Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                />
              </div>

              <div className="space-y-2">
                <Label>Cuisine Type</Label>
                <Input
                  value={formData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                  placeholder="Pakistani, Chinese, Fast Food..."
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Information</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your restaurant..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Submit Application
                <CheckCircle className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partner;
