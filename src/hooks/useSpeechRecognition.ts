// hooks/useSpeechRecognition.ts
import { useState, useEffect, useRef } from "react"

export function useSpeechRecognition(onFinalTranscript?: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const recognitionRef = useRef<any>(null)
  const speechAvailable = useRef(true)

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.error("Web Speech API is not supported in this browser.")
      speechAvailable.current = false
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.continuous = false       // stops automatically when user pauses
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const part = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += part
        } else {
          interimTranscript += part
        }
      }

      setTranscript(finalTranscript || interimTranscript)

      // If we got a final transcript → send automatically
      if (finalTranscript && onFinalTranscript) {
        onFinalTranscript(finalTranscript.trim())
      }
    }

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
  }, [onFinalTranscript])

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      setTranscript("")
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop() // manually stop
    }
  }

  return { transcript, listening, startListening, stopListening, speechAvailable }
}