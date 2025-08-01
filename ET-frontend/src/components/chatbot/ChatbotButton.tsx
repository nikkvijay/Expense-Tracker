import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { Chatbot } from './Chatbot';

interface ChatbotButtonProps {
  onExpenseAdded?: () => void;
  onIncomeAdded?: () => void;
}

export const ChatbotButton: React.FC<ChatbotButtonProps> = ({
  onExpenseAdded,
  onIncomeAdded
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsChatOpen(true)}
          size="lg"
          className="w-14 h-14 rounded-full bg-gradient-primary hover:shadow-glow transition-all duration-300 transform hover:scale-110 shadow-large"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Chatbot Dialog */}
      <Chatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onExpenseAdded={onExpenseAdded}
        onIncomeAdded={onIncomeAdded}
      />
    </>
  );
};