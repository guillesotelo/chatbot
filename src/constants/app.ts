export const APP_VERSION = '1.2'
// export const APP_VERSION = '0.69' Latest BETA version before launch

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
    "these", "one", "ones", "something", "someone", "somebody", "thing",
    
    // Continuation words
    "but", "so", "then", "also", "and", "or", "besides", "anyway", "however",
    "furthermore", "nevertheless", "moreover", "thus", "therefore", "hence",
    "mean", "refer", "meant", "meaning",

    // Common phrases indicating a follow-up
    "tell me more", "explain", "what about", "continue", "go on",
    "expand on that", "elaborate", "give me details", "more info",
    "what else", "how about", "what was that", "can you clarify", "remind me",

    // Questions referring to prior context
    "what do you mean", "what did you say", "did you mean", "what happened next",
    "why did you say that", "what was that about", "why?", "why not?",

    // Commands that imply previous discussion
    "keep going", "finish your thought", "more details", "clarify that", "sum it up",
    "give me a summary", "summarize", "tell me the key points", "other", "more", "else",
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

export const instructionStart = 'Based on the context and the following conversation history, which may or may not be relevant: "'
export const instructionEnd = '", respond to this: '

export const POPUP_WIDTH = 140
export const POPUP_HEIGHT = 60
export const POPUP_WINDOW_WIDTH = 650
export const POPUP_WINDOW_HEIGHT = 750