import { Id } from './id.js';

export interface WhatsappProfile {
  id: Id;
  status: number;
  isBusiness: boolean;
  canReceiveMessage: boolean;
  numberExists: boolean;
  profilePic: string;
}
