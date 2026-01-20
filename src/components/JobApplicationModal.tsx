import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface JobApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
}

export function JobApplicationModal({ open, onOpenChange, jobTitle }: JobApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeFile) {
      toast.error('Please upload your resume');
      return;
    }

    if (!formData.name || !formData.email) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success(`Application for ${jobTitle} submitted! We'll be in touch soon.`);
    setLoading(false);
    onOpenChange(false);
    
    // Reset form
    setFormData({ name: '', email: '', phone: '', message: '' });
    setResumeFile(null);
  };

  const removeFile = () => {
    setResumeFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Apply for {jobTitle}
          </DialogTitle>
          <DialogDescription>
            Submit your application and we'll get back to you within 5 business days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="applicant-name">Full Name *</Label>
            <Input
              id="applicant-name"
              name="applicant-name"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => {
                e.stopPropagation();
                setFormData({ ...formData, name: e.target.value });
              }}
              autoComplete="off"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="applicant-email">Email Address *</Label>
            <Input
              id="applicant-email"
              name="applicant-email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => {
                e.stopPropagation();
                setFormData({ ...formData, email: e.target.value });
              }}
              autoComplete="off"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="applicant-phone">Phone Number</Label>
            <Input
              id="applicant-phone"
              name="applicant-phone"
              type="tel"
              placeholder="03XX-XXXXXXX"
              value={formData.phone}
              onChange={(e) => {
                e.stopPropagation();
                setFormData({ ...formData, phone: e.target.value });
              }}
              autoComplete="off"
            />
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label>Resume / CV *</Label>
            {resumeFile ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{resumeFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(resumeFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Cover Letter / Message */}
          <div className="space-y-2">
            <Label htmlFor="applicant-message">Cover Letter (Optional)</Label>
            <Textarea
              id="applicant-message"
              name="applicant-message"
              placeholder="Tell us why you're a great fit for this role..."
              value={formData.message}
              onChange={(e) => {
                e.stopPropagation();
                setFormData({ ...formData, message: e.target.value });
              }}
              onKeyDown={(e) => e.stopPropagation()}
              autoComplete="off"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="hero" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
