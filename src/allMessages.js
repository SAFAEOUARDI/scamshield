import { testMessages } from "./testMessages";
import { multilingualMessages } from "./testMessagesIntl";

// All 20 test messages with a language field.
export const allMessages = [
  ...testMessages.map((m) => ({ ...m, language: "English" })),
  ...multilingualMessages,
];

export const LANGUAGES = ["English", "French", "Darija", "Arabic", "Spanish"];
