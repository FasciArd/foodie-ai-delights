import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';

interface AICarouselProps {
  items: MenuItem[];
  title: string;
  subtitle?: string;
}

const AICarousel = ({ items, title, subtitle }: AICarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addItem } = useCart();
  const itemsPerView = 3;

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + itemsPerView >= items.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, items.length - itemsPerView) : prev - 1
    );
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="icon"
            size="icon-sm"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="icon"
            size="icon-sm"
            onClick={nextSlide}
            disabled={currentIndex + itemsPerView >= items.length}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden">
        <motion.div
          animate={{ x: `-${currentIndex * (100 / itemsPerView)}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex gap-4"
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="min-w-[calc(33.333%-1rem)] flex-shrink-0"
            >
              <div className="card-base overflow-hidden group cursor-pointer h-full">
                <div className="relative h-32 overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                    AI Pick
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm mb-1 line-clamp-1">{item.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">
                      ${item.price.toFixed(2)}
                    </span>
                    <Button
                      variant="cart"
                      size="icon-sm"
                      onClick={() => addItem(item)}
                    >
                      <motion.span whileTap={{ scale: 0.8 }}>+</motion.span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AICarousel;
