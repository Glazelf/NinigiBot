import {
    Collection,
    MessageFlags
} from "discord.js";

declare module "discord.js" {
    // Adjust Client type to include commands
    export interface Client {
        commands: Collection<any, any>;
    }

    // Create an alternative MessageFlagsBitField that includes just the settable bits
    export type MessageFlagsBitFieldSettable = BitFieldResolvable<"Ephemeral" | "SuppressEmbeds" | "SuppressNotifications", MessageFlags.Ephemeral | MessageFlags.SuppressEmbeds | MessageFlags.SuppressNotifications>
    // Create a message object type
    export interface MessageObject {
        content?: String,
        embeds?: EmbedBuilder[]
        components?: []
        files?: []
        flags: MessageFlagsBitField,
        allowedMentions: {}
    }
}