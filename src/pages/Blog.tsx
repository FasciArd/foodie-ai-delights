import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const Blog = () => {
  const navigate = useNavigate();

  const posts = [
    {
      id: '1',
      title: 'Top 10 Biryani Spots in Karachi You Must Try',
      excerpt: 'Discover the best biryani restaurants in Karachi, from traditional Hyderabadi to spicy Sindhi styles.',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600',
      author: 'Ali Hassan',
      date: 'Dec 15, 2025',
      category: 'Food Guide',
    },
    {
      id: '2',
      title: 'How to Order Smart: Save Money on Food Delivery',
      excerpt: 'Pro tips and tricks to maximize your savings while ordering from your favorite restaurants.',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
      author: 'Sara Ahmed',
      date: 'Dec 10, 2025',
      category: 'Tips & Tricks',
    },
    {
      id: '3',
      title: 'The Rise of Home Chefs in Karachi',
      excerpt: 'Meet the passionate home cooks who are bringing authentic flavors to your doorstep.',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
      author: 'Ahmed Khan',
      date: 'Dec 5, 2025',
      category: 'Stories',
    },
    {
      id: '4',
      title: 'Healthy Eating: Best Salad Bowls in Town',
      excerpt: 'Looking for nutritious options? Check out these amazing salad bowl restaurants.',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
      author: 'Fatima Malik',
      date: 'Nov 28, 2025',
      category: 'Health',
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
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              FoodieHub Blog
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Discover the latest food trends, restaurant reviews, and tips to make the most 
              of your food delivery experience in Karachi.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-base overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/blog/${post.id}`)}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    {post.category}
                  </span>
                  <h2 className="text-xl font-bold text-foreground mt-3 mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
