
export enum Sender {
  USER = 'user',
  BOT = 'bot',
}

export interface MessageOption {
  text: string;
  value: string;
}

export interface Message {
  id: number;
  text: string;
  sender: Sender;
  options?: MessageOption[];
}
interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;  // Add this line
  source: string;
  image?: string;       // Add this line (GNews uses 'image' field)
}
