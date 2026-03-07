import type { Metadata } from 'next';
import BotFeedbackContent from './BotFeedbackContent';

export const metadata: Metadata = {
  title: 'Chatbot Feedback | TotalGuard Admin',
  robots: 'noindex, nofollow',
};

export default function BotFeedbackPage() {
  return <BotFeedbackContent />;
}
