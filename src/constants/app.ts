export const APP_VERSION = '3.2'
// export const APP_VERSION = '0.69' Latest BETA version before launch

export const NEW_USER_GREETINGS = [
    "Hi, what can I help you with today?",
    "Hello! How can I assist you?",
    "Hey there. What brings you here?",
    "Hi! Need help with something?",
    "What would you like to know today?",
    "Hi there! How can I support you?",
    "Hi there! Got a question for me?",
    "Hey! What can I do for you?",
    "Hello! Ready to get started?",
    "Hi, what can I help with?",
    "Good to see you! How can I help?",
    "Hi there! What's on your mind?",
    "Hello! Anything specific I can do for you?",
    "Hey! How can I make things easier for you today?",
    "Hi! I'm here to help whenever you're ready",
    "Hello there! Got something you'd like to explore?",
    "Hey! Looking for some answers?",
    "Hello! Tell me what you're looking for.",
    "Hi! Let's solve something together.",
]

export const RETURNING_USER_GREETINGS = [
    "Hi again! Welcome back.",
    "Hello again! What's new with you?",
    "Hey, good to see you again!",
    "Welcome back! What can I help you with this time?",
    "Hi again! What's on your mind today?",
    "Hello! Ready to continue where we left off?",
    "Hey, you're back! Got another question?",
    "Hi again! Let's dive right in.",
    "Good to see you again! What would you like to explore?",
    "Hey there! Back for more?",
    "Welcome back! How can I assist this time?",
    "Hi again! Always happy to help.",
    "Hello again! What shall we tackle today?",
    "Hey, good to have you back. Need a hand?",
    "Welcome back! What's next?",
    "Hi again! I'm here whenever you need.",
    "Hello again! What can I do for you today?",
    "Hey! Glad you returned. What's up?",
    "Welcome back! Got another topic in mind?",
    "Hi again! Let's continue your journey."
]

export const TECH_ISSUE_LLM = [
    "I'm really sorry, but I'm experiencing some technical difficulties at the moment. Please try again later, and I'll do my best to assist you. Thank you for your patience!",
    "Apologies for the inconvenience, but it seems I'm temporarily unable to provide responses due to a system issue or maintenance. Please check back shortly. Thank you for understanding!",
    "I'm sorry for the disruption, but I'm currently undergoing maintenance or experiencing an issue. Please come back soon and I'll be happy to help you with your questions. Thank you for waiting!",
    "Oops! It looks like I'm having a bit of a technical hiccup or they are doing some maintenance on me right now. Please check back later, and I'll be ready to assist with your questions!",
    "Thank you for reaching out! Unfortunately, I'm currently offline for some updates or maintenance. Please try again later. I appreciate your patience!",
    "My apologies, but I'm experiencing technical difficulties or maintenance downtime at the moment. Please come back later. I appreciate your understanding and hope to assist you soon!",
    "It seems I'm unable to process requests right now, but don't worry—I'll be up and running soon! Please check back later, and I'll be happy to help.",
    "I'm sorry, but my system is currently under maintenance or facing an issue. Rest assured, I'll be back shortly to assist you. Thank you for your patience and understanding!",
    "Apologies for the inconvenience! I'm temporarily offline due to maintenance or a technical issue. Please try again in a little while. Thank you for your patience!",
    "I'm currently unavailable due to technical issues or maintenance updates. I appreciate your understanding and hope to assist you again soon. Please check back later!",
    "Thank you for your understanding! I'm currently facing a temporary issue or undergoing updates. Please try again shortly, and I'll be here to assist you.",
    "Oh no! I'm experiencing a temporary glitch or maintenance downtime. Please bear with me and check back soon. I'll be happy to help once I'm back up.",
    "Sorry for the interruption! I'm momentarily offline due to a technical issue or updates. Please revisit in a bit, and I'll be ready to assist!",
    "Thank you for your patience! I'm unavailable right now due to a system update or issue. Please come back shortly, and I'll do my best to help you."
]

export const WELCOME_RESPONSES = [
    "You are welcome! If you have a specific question about HPx, please let me know and I'll do my best to provide accurate information.",
    "No problem! Feel free to ask me anything about HPx and I'll help however I can.",
    "You're very welcome! Do you have a particular question about HPx I can answer?",
    "Glad I could help! If there's something specific about HPx you'd like to know, just ask.",
    "You're welcome! Let me know your HPx question and I'll do my best to assist.",
    "Anytime! If you'd like more details about HPx, just tell me what you're curious about.",
    "You are welcome! Do you want me to go into something specific regarding HPx?",
    "Happy to help! If you have a focused question on HPx, let me know.",
    "You're very welcome! What would you like to dive into about HPx?",
    "No worries! If you'd like, I can explain something specific about HPx for you."
]

export const API_URL = ''

export const LOCAL_API_URL = 'http://127.0.0.1:5000'

export const feedbackHeaders = [
    {
        name: 'CREATED',
        value: 'createdAt',
    },
    {
        name: 'APP VERSION',
        value: 'appVersion',
    },
    {
        name: 'USERNAME',
        value: 'username',
    },
    {
        name: 'TYPE',
        value: 'type',
    },
    {
        name: 'COMMENTS',
        value: 'comments',
    },
    {
        name: 'SCORE',
        value: 'score',
    },
]

export const questionStarters = [
    // Common question words
    "who", "what", "when", "where", "why", "how", "which", "whose", "whom",

    // Common contractions
    "who's", "what's", "when's", "where's", "why's", "how's", "which's", "who've", "who'd",

    // Modal verbs & auxiliary verbs
    "can", "could", "would", "should", "shall", "may", "might", "must",
    "do", "does", "did", "is", "are", "was", "were", "will", "won't",
    "have", "has", "had", "haven't", "hasn't", "hadn't", "am", "aren't", "isn't",
    "doesn't", "didn't", "wouldn't", "couldn't", "shouldn't", "can't", "mightn't",

    // Prepositions (sometimes used in questions)
    "in", "on", "at", "for", "with", "without", "by", "about", "because", "from",
    "through", "under", "over", "between", "against", "into", "onto", "since", "during",

    // Conjunctions (occasionally used in questions)
    "and", "or", "but", "so", "if", "nor", "yet", "although", "though", "unless", "whether",

    // Shortened spoken forms
    "wanna", "gonna", "gotta", "lemme", "could've", "should've", "would've"
]

export const referencePatterns = [
    // Pronouns and references
    "it", "this", "that", "those", "them", "they", "he", "she", "him", "her",
    "these", "one", "ones", "something", "someone", "somebody", "thing", "to",

    // Continuation words
    "but", "so", "then", "also", "and", "or", "besides", "anyway", "however",
    "furthermore", "nevertheless", "moreover", "thus", "therefore", "hence",
    "mean", "refer", "meant", "meaning", "translate",

    // Common phrases indicating a follow-up
    "tell me", "more", "explain", "continue", "go on",
    "expand", "elaborate", "details", "info", "wrong",
    "else", "about", "what is", "whats", "what's", "what mean", "what you", "what do",
    "clarify", "remind",

    // Questions referring to prior context
    "say", "next", "which", "who", "why",

    // Commands that imply previous discussion
    "keep", "finish", "sum",
    "summary", "summarize", "key", "other",
    "example",
]

export const greetingPatterns = [
    "hi", "hello", "hey", "good morning", "good afternoon", "good evening",
    "what's up", "howdy", "greetings", "sup", "morning", "evening",
    "hola", "bonjour", "ciao", "salut", "hallo", "namaste",
    "hej", "god morgon", "hejdå", "tjena", "hallå"
]

export const gratitudePatterns = [
    "thanks", "thank you", "thank you!", "thx", "appreciate it", "much appreciated",
    "gracias", "merci", "danke", "thanks a lot", "thank you so much",
    "many thanks", "thanks a bunch", "thanks a million", "thanks again", "tack", "ok"
]

export const pageReferences = [
    "this page", "the page", "current page", " here", "the webpage", "current webpage",
    "this section", "the section", "current section", "this part", "this parragraph", "this topic",
    "this document", "this documentation",
    "this article", "the article", "this post", "the post", "this site",
    "this chapter", "where i am", "this content",
]

export const instructionStart = 'Based on the context and the following conversation history, which may or may not be relevant: "'
export const instructionEnd = '", respond to this: '

export const POPUP_WIDTH = 140
export const POPUP_HEIGHT = 60
export const POPUP_WINDOW_WIDTH = 650
export const POPUP_WINDOW_HEIGHT = 750