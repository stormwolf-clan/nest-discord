export interface CommandOptions {
  name: string;
  description: string;
  //usage?: string;
  guildOnly?: boolean;
  aliases?: string[];
  cooldown?: number;
}
