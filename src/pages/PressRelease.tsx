import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Building2, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '@/components/Footer';
import { useState } from 'react';
import ShareModal from '@/components/ShareModal';

const pressReleases: Record<string, {
  title: string;
  date: string;
  content: string;
  category: string;
}> = {
  '1': {
    title: 'FoodieHub Raises $10M Series A Funding',
    date: 'December 2025',
    category: 'Funding',
    content: `
**KARACHI, Pakistan - December 15, 2025** - FoodieHub, Pakistan's leading food delivery platform, today announced the successful close of its $10 million Series A funding round.

## Investment Details

The round was led by prominent regional and international investors, including:
- Venture Capital Partners Asia
- Pakistan Tech Ventures
- Food Innovation Fund

This investment will fuel FoodieHub's expansion across Pakistan and enhance its technology infrastructure.

## Company Growth

Since its launch, FoodieHub has achieved remarkable growth:
- Over 1 million orders delivered
- 500+ restaurant partners
- Operating in 5 major cities
- 10,000+ active delivery partners

## Strategic Plans

"This funding validates our vision of transforming food delivery in Pakistan," said [CEO Name], Founder and CEO of FoodieHub. "We will use these resources to expand our HomeChefs program, invest in AI-powered recommendations, and bring faster delivery to more neighborhoods."

## Technology Focus

Key investments will include:
- Advanced AI for personalized recommendations
- Real-time tracking improvements
- Enhanced restaurant partner tools
- Carbon-neutral delivery initiatives

## About FoodieHub

FoodieHub is Pakistan's fastest-growing food delivery platform, connecting food lovers with the best restaurants and home chefs. Our mission is to make great food accessible to everyone while supporting local culinary entrepreneurs.

---

**Media Contact:**
press@foodiehub.pk
+92 21 1234 5678
    `,
  },
  '2': {
    title: 'Launch of HomeChefs Platform',
    date: 'October 2025',
    category: 'Product Launch',
    content: `
**KARACHI, Pakistan - October 10, 2025** - FoodieHub today announced the launch of HomeChefs, a revolutionary platform connecting home-based chefs with food lovers across Karachi.

## A New Era for Home Cooking

HomeChefs enables talented home cooks to reach customers through FoodieHub's delivery network, creating new income opportunities while offering consumers authentic, home-cooked meals.

## Platform Features

The HomeChefs platform includes:
- Easy onboarding for home-based cooks
- Quality and hygiene certification
- Integrated payment processing
- Delivery through FoodieHub's network
- Customer ratings and reviews

## Initial Response

Within the first month of soft launch:
- 100+ home chefs registered
- 50,000+ meals delivered
- Average rating of 4.8/5 stars
- 95% customer satisfaction rate

## Empowering Entrepreneurs

"HomeChefs is about more than food—it's about empowering culinary entrepreneurs who have incredible skills but lack access to customers," said [Product Lead Name], Head of Product at FoodieHub.

## Joining HomeChefs

Home cooks interested in joining can apply through the FoodieHub app or website. The selection process includes:
1. Application submission
2. Kitchen inspection
3. Food safety training
4. Menu curation support
5. Launch and ongoing support

## Expansion Plans

Following the success in Karachi, HomeChefs will expand to:
- Lahore (January 2026)
- Islamabad (February 2026)
- Faisalabad (March 2026)

---

**Media Contact:**
press@foodiehub.pk
    `,
  },
  '3': {
    title: 'FoodieHub Reaches 1 Million Orders',
    date: 'August 2025',
    category: 'Milestone',
    content: `
**KARACHI, Pakistan - August 20, 2025** - FoodieHub today celebrated a significant milestone: delivering its one-millionth order since launch.

## Rapid Growth Story

The journey to one million orders showcases the rapid adoption of digital food delivery in Pakistan:
- Month 1-3: 50,000 orders
- Month 4-6: 200,000 orders
- Month 7-9: 350,000 orders
- Month 10-12: 400,000 orders

## Customer Love

The milestone order was placed by Kareem Ahmed from DHA, Karachi, who ordered biryani from his favorite local restaurant. As a celebration, Kareem received free FoodieHub Pro membership for a year and Rs. 50,000 in credits.

## What Customers Are Saying

"FoodieHub has changed how my family eats. The variety, the convenience, and especially the HomeChefs option—it's become an essential part of our weekly routine." - Ayesha, Regular Customer

## Impact on Partners

Our growth has directly benefited:
- 300+ restaurant partners with 40% average order increase
- 5,000+ delivery partners earning consistent income
- 50+ home chefs launched through HomeChefs

## Sustainability Commitment

As we grow, we're committed to reducing our environmental impact:
- Eco-friendly packaging initiative
- Electric bike pilot program
- Carbon offset for all deliveries

## Looking Ahead

"One million orders is just the beginning," said [CEO Name]. "Our goal is to serve 10 million orders by the end of 2026 while maintaining the quality and reliability our customers trust."

## Thank You

We thank our customers, restaurant partners, delivery heroes, and investors for making this milestone possible.

---

**Media Contact:**
press@foodiehub.pk
    `,
  },
};

const PressRelease = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [shareOpen, setShareOpen] = useState(false);

  const release = id ? pressReleases[id] : null;

  if (!release) {
    return (
      <div className="min-h-screen flex flex-col pt-20">
        <section className="py-16 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-7xl mb-6">📰</div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Press Release Not Found
            </h2>
            <p className="text-muted-foreground mb-8">
              The press release you're looking for doesn't exist.
            </p>
            <Button variant="hero" onClick={() => navigate('/press')}>
              Back to Press
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Header */}
      <section className="py-12 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <Button variant="ghost" size="sm" onClick={() => navigate('/press')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Press
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              {release.category}
            </span>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
              {release.title}
            </h1>
            
            <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {release.date}
              </span>
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                FoodieHub
              </span>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            {release.content.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return (
                  <p key={index} className="font-bold text-foreground mb-4">
                    {paragraph.replace(/\*\*/g, '')}
                  </p>
                );
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <li key={index} className="text-muted-foreground ml-4">
                    {paragraph.replace('- ', '')}
                  </li>
                );
              }
              if (paragraph.startsWith('1. ') || paragraph.match(/^\d\. /)) {
                return (
                  <li key={index} className="text-muted-foreground ml-4 list-decimal">
                    {paragraph.replace(/^\d\. /, '')}
                  </li>
                );
              }
              if (paragraph.trim() === '---') {
                return <hr key={index} className="my-8 border-border" />;
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
          </motion.article>
        </div>
      </section>

      {/* Share Modal */}
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        title={release.title}
        url={`${window.location.origin}/press/${id}`}
        description={`${release.title} - FoodieHub Press Release`}
      />

      <Footer />
    </div>
  );
};

export default PressRelease;
