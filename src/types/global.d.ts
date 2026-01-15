import { Collection, Client, Interaction, Message } from 'discord.js';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      DEBUG?: string;
    }
  }
}

export interface CommandProps {
  commandObject: {
    name: string;
    type?: number;
    contexts?: number[];
    integration_types?: number[];
    [key: string]: any;
  };
  run?: (interaction: Interaction, messageFlags?: any) => Promise<any>;
  [key: string]: any;
}

export interface ExtendedClient extends Client {
  commands: Collection<string, CommandProps>;
}

export interface GlobalVars {
  NinigiID: string;
  ShinxServerID: string;
  ShinxServerInvite: string;
  eventChannelID: string;
  sysbotChannelIDs: string[];
  sysbotLogChannelID: string;
  currency: string;
  embedColor: [number, number, number];
  embedColorError: [number, number, number];
  lackPermsString: string;
  ephemeralOptionDescription: string;
  starboardLimit: number;
  battling: {
    yes: boolean;
  };
  displayAvatarSettings: {
    size: number;
    extension: string;
  };
  splatoon3: {
    languageJSONs: Record<string, any>;
  };
  presence?: any;
}

export interface ColorHexes {
  [key: string]: string;
}

export {};
