import { motion } from 'framer-motion';
import { ChefHat, Star, Clock, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const homeChefs = [
  {
    id: '1',
    name: 'Ammi Ki Rasoi',
    specialty: 'Authentic Biryani & Nihari',
    rating: 4.9,
    reviews: 234,
    deliveryTime: '45-60 min',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    featured: true,
  },
  {
    id: '2',
    name: 'Dadi Ka Kitchen',
    specialty: 'Traditional Haleem & Korma',
    rating: 4.8,
    reviews: 189,
    deliveryTime: '40-55 min',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
    featured: false,
  },
  {
    id: '3',
    name: 'Karachi Homemade',
    specialty: 'Seekh Kabab & Karahi',
    rating: 4.7,
    reviews: 156,
    deliveryTime: '35-50 min',
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400',
    featured: true,
  },
  {
    id: '4',
    name: 'Nani Ka Ghar',
    specialty: 'Paratha & Qeema',
    rating: 4.9,
    reviews: 312,
    deliveryTime: '30-45 min',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    featured: false,
  },
];

const HomeChefsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 sm:py-16 bg-gradient-warm">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"
            >
              <ChefHat className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                HomeChefs
              </h2>
              <p className="text-muted-foreground">
                Authentic homemade meals from Karachi's best home kitchens
              </p>
            </div>
          </div>
          <Button variant="outline" className="hidden sm:flex" onClick={() => navigate('/homechefs')}>
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Chefs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {homeChefs.map((chef, index) => (
            <motion.div
              key={chef.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              onClick={() => navigate(`/homechefs/${chef.id}`)}
              className="card-base overflow-hidden cursor-pointer group"
            >
              <div className="relative h-40 overflow-hidden">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  src={chef.image}
                  alt={chef.name}
                  className="w-full h-full object-cover"
                />
                {chef.featured && (
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current" />
                    Featured
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="font-semibold text-sm">{chef.rating}</span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {chef.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{chef.specialty}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{chef.deliveryTime}</span>
                  </div>
                  <span className="text-xs bg-secondary px-2 py-1 rounded-md">
                    {chef.reviews} reviews
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" onClick={() => navigate('/homechefs')}>
            View All HomeChefs
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HomeChefsSection;
