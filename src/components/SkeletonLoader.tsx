import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'card' | 'menu' | 'text' | 'avatar';
  count?: number;
}

const SkeletonCard = () => (
  <div className="card-base overflow-hidden">
    <div className="h-48 skeleton" />
    <div className="p-5 space-y-3">
      <div className="h-6 w-3/4 skeleton rounded-lg" />
      <div className="h-4 w-1/2 skeleton rounded-lg" />
      <div className="flex gap-2">
        <div className="h-6 w-16 skeleton rounded-md" />
        <div className="h-6 w-16 skeleton rounded-md" />
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-20 skeleton rounded-lg" />
        <div className="h-4 w-20 skeleton rounded-lg" />
      </div>
    </div>
  </div>
);

const SkeletonMenu = () => (
  <div className="card-base overflow-hidden flex">
    <div className="w-40 h-32 skeleton shrink-0" />
    <div className="flex-1 p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-1/2 skeleton rounded-lg" />
        <div className="h-5 w-16 skeleton rounded-lg" />
      </div>
      <div className="h-4 w-full skeleton rounded-lg" />
      <div className="h-4 w-3/4 skeleton rounded-lg" />
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="h-6 w-16 skeleton rounded-md" />
          <div className="h-6 w-16 skeleton rounded-md" />
        </div>
        <div className="h-10 w-10 skeleton rounded-full" />
      </div>
    </div>
  </div>
);

const SkeletonText = () => (
  <div className="space-y-2">
    <div className="h-4 w-full skeleton rounded-lg" />
    <div className="h-4 w-5/6 skeleton rounded-lg" />
    <div className="h-4 w-4/6 skeleton rounded-lg" />
  </div>
);

const SkeletonAvatar = () => (
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 skeleton rounded-full" />
    <div className="space-y-2">
      <div className="h-4 w-24 skeleton rounded-lg" />
      <div className="h-3 w-16 skeleton rounded-lg" />
    </div>
  </div>
);

const SkeletonLoader = ({ variant = 'card', count = 1 }: SkeletonLoaderProps) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return <SkeletonCard />;
      case 'menu':
        return <SkeletonMenu />;
      case 'text':
        return <SkeletonText />;
      case 'avatar':
        return <SkeletonAvatar />;
      default:
        return <SkeletonCard />;
    }
  };

  return (
    <>
      {skeletons.map((index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </>
  );
};

export default SkeletonLoader;
