import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, MapPin, Clock, ArrowRight, Users, Zap, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const Careers = () => {
  const navigate = useNavigate();

  const perks = [
    { icon: Coffee, title: 'Free Meals', description: 'Daily lunch credits on FoodieHub' },
    { icon: Zap, title: 'Growth', description: 'Fast-paced learning environment' },
    { icon: Users, title: 'Great Team', description: 'Work with passionate people' },
  ];

  const jobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Karachi, Pakistan',
      type: 'Full-time',
    },
    {
      id: '2',
      title: 'Product Manager',
      department: 'Product',
      location: 'Karachi, Pakistan',
      type: 'Full-time',
    },
    {
      id: '3',
      title: 'Customer Support Lead',
      department: 'Operations',
      location: 'Karachi, Pakistan',
      type: 'Full-time',
    },
    {
      id: '4',
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
    },
    {
      id: '5',
      title: 'Delivery Operations Manager',
      department: 'Operations',
      location: 'Karachi, Pakistan',
      type: 'Full-time',
    },
  ];

  const handleApply = (jobTitle: string) => {
    toast.success(`Application for ${jobTitle} submitted! We'll be in touch soon.`);
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
              Join Our Team
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Help us revolutionize food delivery in Pakistan. We're always looking for 
              talented individuals who share our passion for great food and technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-12 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-6">
            {perks.map((perk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-background/50"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <perk.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{perk.title}</h3>
                  <p className="text-sm text-muted-foreground">{perk.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-primary" />
            Open Positions
          </h2>
          
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-base p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="bg-secondary px-2 py-1 rounded">{job.department}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => handleApply(job.title)}>
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
