import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CalorieEstimate {
  calories: number;
  breakdown: {
    protein: string;
    carbs: string;
    fat: string;
  };
  confidence: 'low' | 'medium' | 'high';
}

interface UseAICaloriesResult {
  estimating: boolean;
  estimate: CalorieEstimate | null;
  estimateCalories: (foodName: string, description?: string, imageBase64?: string) => Promise<CalorieEstimate | null>;
  clearEstimate: () => void;
}

export function useAICalories(): UseAICaloriesResult {
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<CalorieEstimate | null>(null);

  const estimateCalories = async (
    foodName: string, 
    description?: string, 
    imageBase64?: string
  ): Promise<CalorieEstimate | null> => {
    if (!foodName.trim()) {
      toast.error('Please enter a food name first');
      return null;
    }

    setEstimating(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-calories', {
        body: { 
          foodName,
          description,
          imageBase64,
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else {
          throw new Error(data.error);
        }
        return null;
      }

      const result: CalorieEstimate = {
        calories: data.calories || 0,
        breakdown: data.breakdown || { protein: 'N/A', carbs: 'N/A', fat: 'N/A' },
        confidence: data.confidence || 'low',
      };

      setEstimate(result);
      toast.success(`Estimated ${result.calories} calories (${result.confidence} confidence)`);
      return result;
    } catch (error: any) {
      console.error('Calorie estimation error:', error);
      toast.error(error.message || 'Failed to estimate calories');
      return null;
    } finally {
      setEstimating(false);
    }
  };

  const clearEstimate = () => {
    setEstimate(null);
  };

  return {
    estimating,
    estimate,
    estimateCalories,
    clearEstimate,
  };
}
