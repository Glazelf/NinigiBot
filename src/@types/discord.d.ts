import {
    Collection,
    MessageFlags
} from "discord.js";

declare module "discord.js" {
    export interface Client {
        commands: Collection<any, any>;
    }

    export type MessageFlagsBitFieldDeferrable = BitFieldResolvable<"Ephemeral", MessageFlags.Ephemeral>
    export type MessageFlagsBitFieldSettable = BitFieldResolvable<"Ephemeral" | "SuppressEmbeds" | "SuppressNotifications", MessageFlags.Ephemeral | MessageFlags.SuppressEmbeds | MessageFlags.SuppressNotifications>
}