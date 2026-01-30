
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
