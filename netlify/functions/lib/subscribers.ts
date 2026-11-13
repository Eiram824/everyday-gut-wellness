export interface SubscriberRecord {
  id: string;
  name: string;
  email: string;
  date: string;
  source: string;
  marketingConsent: boolean;
  consentDate: string | null;
  senderSynced: boolean;
}
