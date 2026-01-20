import { motion } from 'framer-motion';
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Users, Truck, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const Safety = () => {
  const navigate = useNavigate();

  const safetyMeasures = [
    {
      icon: Store,
      title: 'Restaurant Safety',
      items: [
        'All partner restaurants are verified and inspected',
        'Regular hygiene audits and compliance checks',
        'Temperature monitoring for food storage',
        'Staff health and safety training',
      ],
    },
    {
      icon: Truck,
      title: 'Delivery Safety',
      items: [
        'Background verified delivery partners',
        'Contactless delivery options',
        'Tamper-proof packaging seals',
        'Real-time GPS tracking',
      ],
    },
    {
      icon: Users,
      title: 'Customer Safety',
      items: [
        'Secure payment processing',
        'Data privacy protection',
        '24/7 customer support',
        'Easy refund and dispute resolution',
      ],
    },
  ];

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
              <Shield className="w-10 h-10 text-primary" />
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                Safety First
              </h1>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your safety is our top priority. We implement rigorous standards to ensure 
              every order is prepared and delivered with the highest safety measures.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Safety Measures */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {safetyMeasures.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-base p-6"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <section.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Safety Concern */}
      <section className="py-16 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Report a Safety Concern
            </h2>
            <p className="text-muted-foreground mb-6">
              If you encounter any safety issues with your order or delivery, please let us know 
              immediately. We take all reports seriously and will investigate promptly.
            </p>
            <Button onClick={() => navigate('/help')}>
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Safety;
