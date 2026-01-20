import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '@/components/Footer';
import { useState } from 'react';
import ShareModal from '@/components/ShareModal';

const blogPosts: Record<string, {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  authorImage: string;
  date: string;
  readTime: string;
  category: string;
}> = {
  '1': {
    title: 'Top 10 Biryani Spots in Karachi You Must Try',
    excerpt: 'Discover the best biryani restaurants in Karachi, from traditional Hyderabadi to spicy Sindhi styles.',
    content: `
Karachi is known as the biryani capital of Pakistan, and for good reason. The city boasts some of the most flavorful and aromatic biryani you'll ever taste. Here's our curated list of the top 10 biryani spots you absolutely must try.

## 1. Student Biryani
A legendary name in Karachi, Student Biryani has been serving authentic flavors since 1960. Their signature beef biryani is a must-try, with perfectly layered rice and tender meat.

## 2. Biryani of the Seas
Known for their seafood biryani, this spot offers a unique twist on the classic dish. The prawns are perfectly cooked and the spices are balanced to perfection.

## 3. Al-Rehman
Famous for their generous portions and rich taste, Al-Rehman's biryani is comfort food at its best. The aloo (potato) in their biryani is a signature touch.

## 4. Burns Garden Biryani
A hidden gem that locals swear by. Their mutton biryani is cooked slow and served hot, with raita that perfectly complements the spicy rice.

## 5. Karachi Biryani House
True to its name, this spot serves authentic Karachi-style biryani with just the right amount of heat and a beautiful saffron color.

## Tips for Enjoying Biryani
- Always order raita on the side
- Try the special masala chai to complete your meal
- Visit during lunch for the freshest servings
- Don't forget to try their seekh kababs as starters

Whether you're a local or a visitor, these biryani spots are essential stops on your culinary journey through Karachi.
    `,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200',
    author: 'Ali Hassan',
    authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    date: 'Dec 15, 2025',
    readTime: '5 min read',
    category: 'Food Guide',
  },
  '2': {
    title: 'How to Order Smart: Save Money on Food Delivery',
    excerpt: 'Pro tips and tricks to maximize your savings while ordering from your favorite restaurants.',
    content: `
Food delivery has become an essential part of modern life, but the costs can add up quickly. Here are our proven strategies to save money while still enjoying your favorite meals.

## 1. Subscribe to FoodiePro
Our Pro membership offers free delivery on orders above Rs. 599 and exclusive discounts. The subscription pays for itself in just a few orders.

## 2. Order During Off-Peak Hours
Many restaurants offer special discounts during slower hours (2-5 PM). Take advantage of these quiet periods for better deals.

## 3. Group Orders with Friends or Family
Splitting delivery fees across multiple people significantly reduces the per-person cost. Plus, you might qualify for bulk discounts.

## 4. Use Wallet Top-ups
Top up your FoodiePay wallet in larger amounts to get bonus credits. A Rs. 2000 top-up gives you Rs. 100 extra!

## 5. Check Daily Deals
We feature different restaurant deals every day. Make it a habit to check the deals section before placing your order.

## 6. Order Complete Meals
Instead of ordering individual items with high margins, look for complete meal deals that offer better value.

## 7. Collect Loyalty Points
Every order earns you points that can be redeemed for discounts on future orders. The more you order, the more you save.

## Pro Tips
- Set order reminders for flash sales
- Follow your favorite restaurants for exclusive offers
- Refer friends for credits
- Rate orders to earn bonus points

Happy saving!
    `,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200',
    author: 'Sara Ahmed',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    date: 'Dec 10, 2025',
    readTime: '4 min read',
    category: 'Tips & Tricks',
  },
  '3': {
    title: 'The Rise of Home Chefs in Karachi',
    excerpt: 'Meet the passionate home cooks who are bringing authentic flavors to your doorstep.',
    content: `
A quiet revolution is happening in Karachi's food scene. Home chefs—passionate cooks working from their own kitchens—are changing how we experience food delivery.

## The Home Chef Movement
What started as a way for talented home cooks to share their recipes has grown into a thriving ecosystem of micro-restaurants. These aren't your typical eateries; they're love projects by people who cook with soul.

## Why Home Chefs Are Winning
### Authenticity
Home chefs often specialize in family recipes passed down through generations. This isn't food made for masses—it's food made with memories.

### Quality Control
With smaller operations, home chefs can focus on quality over quantity. Every dish gets personal attention.

### Unique Offerings
From grandmother's secret korma recipe to innovative fusion dishes, home chefs offer things you won't find elsewhere.

## Meet Some Stars

### Ammi Ki Rasoi
Fatima Begum started cooking commercially after her husband's retirement. Her nihari has a 48-hour preparation process, and the waiting list proves it's worth every minute.

### Dadi Ka Kitchen
Two sisters revived their grandmother's recipes and now serve over 100 families weekly. Their haleem is legendary.

### Karachi Homemade
A young couple combining traditional recipes with modern presentation. Their seekh kababs are Instagram-famous for a reason.

## How to Order from Home Chefs
FoodieHub's HomeChefs section connects you directly with these culinary artisans. Just browse, order, and enjoy authentic home-cooked meals delivered to your door.

The future of food is homemade!
    `,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
    author: 'Ahmed Khan',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    date: 'Dec 5, 2025',
    readTime: '6 min read',
    category: 'Stories',
  },
  '4': {
    title: 'Healthy Eating: Best Salad Bowls in Town',
    excerpt: 'Looking for nutritious options? Check out these amazing salad bowl restaurants.',
    content: `
Who says healthy food can't be delicious? Karachi's salad bowl scene has evolved dramatically, offering nutritious options that don't compromise on flavor.

## Top Salad Bowl Destinations

### 1. Green Bliss
Their signature Mediterranean Bowl combines quinoa, grilled chicken, feta cheese, and a zesty lemon dressing. At 450 calories, it's a satisfying yet guilt-free meal.

### 2. Poke Paradise
Hawaiian-inspired poke bowls with fresh fish, avocado, and unique toppings. The Salmon Sensation is a must-try.

### 3. Buddha Bowl Co.
Vegetarian-focused with creative combinations. Their Roasted Veggie Buddha Bowl is filling and flavorful.

## Building Your Perfect Bowl

### Base Options
- Mixed Greens (lowest calorie)
- Quinoa (protein-rich)
- Brown Rice (filling)
- Zoodles (low-carb)

### Proteins
- Grilled Chicken
- Salmon
- Tofu
- Chickpeas
- Falafel

### Toppings
- Roasted Vegetables
- Nuts and Seeds
- Cheese (feta, goat)
- Fresh Fruits
- Avocado

### Dressings
- Lemon Vinaigrette
- Tahini
- Greek Yogurt
- Olive Oil & Herbs

## Ordering Tips
- Ask for dressing on the side to control portions
- Add nuts for healthy fats and crunch
- Choose grilled over fried proteins
- Include at least 3 different colored vegetables

Stay healthy, Karachi!
    `,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200',
    author: 'Fatima Malik',
    authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    date: 'Nov 28, 2025',
    readTime: '5 min read',
    category: 'Health',
  },
};

const BlogPost = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [liked, setLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const post = id ? blogPosts[id] : null;

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col pt-20">
        <section className="py-16 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-7xl mb-6">📝</div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Blog Post Not Found
            </h2>
            <p className="text-muted-foreground mb-8">
              The article you're looking for doesn't exist.
            </p>
            <Button variant="hero" onClick={() => navigate('/blog')}>
              Back to Blog
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Hero Image */}
      <section className="relative h-64 sm:h-96 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute top-4 left-4">
          <Button variant="secondary" size="sm" onClick={() => navigate('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 flex-1">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Category */}
            <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              {post.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-6">
              {post.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <img
                  src={post.authorImage}
                  alt={post.author}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-foreground">{post.author}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLiked(!liked)}
                  className={liked ? 'text-red-500' : ''}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShareOpen(true)}>
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert mt-8 max-w-none">
              {post.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  return (
                    <li key={index} className="text-muted-foreground ml-4">
                      {paragraph.replace('- ', '')}
                    </li>
                  );
                }
                if (paragraph.trim()) {
                  return (
                    <p key={index} className="text-muted-foreground mb-4">
                      {paragraph}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </motion.article>
        </div>
      </section>

      {/* Share Modal */}
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        title={post.title}
        url={`${window.location.origin}/blog/${id}`}
        description={post.excerpt}
      />

      <Footer />
    </div>
  );
};

export default BlogPost;
