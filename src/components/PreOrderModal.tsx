import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface PreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
}

const PreOrderModal = ({ isOpen, onClose, onConfirm }: PreOrderModalProps) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });

  // Generate time slots from 10 AM to 10 PM
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = 10 + i;
    const time = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
    return { value: `${hour}:00`, label: time };
  });

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirm(selectedDate, selectedTime);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule Your Order
          </DialogTitle>
          <DialogDescription>
            Choose when you'd like your order delivered
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Select Date
            </label>
            <div className="grid grid-cols-4 gap-2">
              {dates.map((date) => (
                <motion.button
                  key={date.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(date.value)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedDate === date.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="text-sm font-medium">{date.label}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Select Time
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {timeSlots.map((slot) => (
                <motion.button
                  key={slot.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTime(slot.value)}
                  className={`p-2 rounded-lg border text-sm transition-all ${
                    selectedTime === slot.value
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {slot.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="hero" 
            className="flex-1" 
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
          >
            Schedule Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreOrderModal;
