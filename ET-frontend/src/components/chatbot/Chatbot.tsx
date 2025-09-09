import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  X,
  Trash2,
  HelpCircle,
  Mic,
  MicOff,
  Volume2,
} from "lucide-react";
import {
  sendChatMessage,
  getChatHistory,
  clearChatHistory,
  getChatbotCapabilities,
  speechToText,
  getSpeechServiceStatus,
  type ChatMessage,
  type ChatResponse,
} from "@/api";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded?: () => void; // Callback to refresh expenses list
  onIncomeAdded?: () => void; // Callback to refresh income list
}

export const Chatbot: React.FC<ChatbotProps> = ({
  isOpen,
  onClose,
  onExpenseAdded,
  onIncomeAdded,
}) => {
  const { currency, formatCurrency } = useCurrency();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [capabilities, setCapabilities] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load chat history and capabilities on mount
  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
      loadCapabilities();
      checkVoiceAvailability();
    }
  }, [isOpen]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const data = await getChatHistory(20);
      setMessages(data.history);
    } catch (error: any) {
      console.error("Failed to load chat history:", error);
      if (error.response?.status === 401) {
        toast.error("Please login to use the chatbot");
        onClose();
      }
    }
  };

  const loadCapabilities = async () => {
    try {
      const data = await getChatbotCapabilities();
      setCapabilities(data);
    } catch (error: any) {
      console.error("Failed to load capabilities:", error);
      if (error.response?.status === 401) {
        toast.error("Please login to use the chatbot");
        onClose();
      }
    }
  };

  const checkVoiceAvailability = async () => {
    try {
      // Check if browser supports media recording
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsVoiceAvailable(false);
        return;
      }

      // Always show mic button - we'll handle service availability during actual use
      setIsVoiceAvailable(true);
    } catch (error: any) {
      console.error("Failed to check voice availability:", error);
      setIsVoiceAvailable(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // Add user message to UI immediately
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userMessage: userMessage,
      botResponse: "",
      success: true,
    };

    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response: ChatResponse = await sendChatMessage(userMessage, {
        code: currency.code,
        symbol: currency.symbol,
        position: currency.position,
      });

      // Update the temporary message with bot response
      const botMessage: ChatMessage = {
        id: response.sessionId,
        timestamp: response.timestamp,
        userMessage: userMessage,
        botResponse: response.response,
        success: true,
      };

      setMessages((prev) => [...prev.slice(0, -1), botMessage]);

      // Handle successful actions
      if (response.actionResult?.success) {
        if (response.action?.type === "ADD_EXPENSE" && onExpenseAdded) {
          onExpenseAdded();
          toast.success("Expense added successfully!");
        } else if (response.action?.type === "ADD_INCOME" && onIncomeAdded) {
          onIncomeAdded();
          toast.success("Income added successfully!");
        } else if (
          response.action?.type === "DELETE_EXPENSE" &&
          onExpenseAdded
        ) {
          onExpenseAdded();
          toast.success("Expense deleted successfully!");
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);

      let errorMsg = "I'm sorry, I encountered an error. Please try again.";
      if (error.response?.status === 401) {
        errorMsg = "Authentication required. Please login to continue.";
        toast.error("Please login to use the chatbot");
        setTimeout(() => onClose(), 2000);
      }

      // Update with error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userMessage: userMessage,
        botResponse: errorMsg,
        success: false,
      };

      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
      if (error.response?.status !== 401) {
        toast.error("Failed to process message");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory();
      setMessages([]);
      toast.success("Chat history cleared");
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast.error("Failed to clear chat history");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const formatMessage = (message: string) => {
    // Convert newlines to <br> for better formatting
    return message.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < message.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const getWelcomeMessage = () => {
    return `👋 Hi! I'm your personal finance assistant. I can help you manage your expenses and income using natural language. Try saying things like:\n\n• "I spent ${formatCurrency(
      25
    )} on lunch"\n• "Add ${formatCurrency(
      3000
    )} salary income"\n• "Show my expenses"\n• "Analyze my spending"\n\n${
      isVoiceAvailable
        ? "🎤 You can also use voice messages by clicking the microphone button!"
        : ""
    }\n\nWhat would you like to do?`;
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm;codecs=opus" });
        await handleVoiceToText(audioBlob);

        // Cleanup
        stream.getTracks().forEach((track) => track.stop());
        setAudioChunks([]);
        setRecordingDuration(0);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks(chunks);

      // Start timer
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      toast.success("🎤 Listening... Speak your message!");
    } catch (error: any) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
      toast.info("Converting speech to text...");
    }
  };

  const handleVoiceToText = async (audioBlob: Blob) => {
    setIsLoading(true);

    try {
      // Convert speech to text only (not full chatbot processing)
      const response = await speechToText(audioBlob, {
        language: "en-US",
      });

      if (response.transcript) {
        // Put the transcribed text into the input field
        setInputMessage(response.transcript);
        toast.success(
          "✅ Speech converted to text! Edit if needed, then send."
        );

        // Show confidence if low
        if (response.confidence < 0.8) {
          toast.warning(
            `Voice recognition confidence: ${Math.round(
              response.confidence * 100
            )}%`
          );
        }
      } else {
        toast.error("No speech detected. Please try again.");
      }
    } catch (error: any) {
      console.error("Speech-to-text error:", error);

      let errorMsg = "Failed to convert speech to text. Please try again.";
      if (error.response?.status === 401) {
        errorMsg = "Please login to use voice features.";
        toast.error("Please login to use voice messages");
        setTimeout(() => onClose(), 2000);
      } else if (error.response?.status === 503) {
        errorMsg = "Voice service is temporarily unavailable.";
      }

      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full  h-[80vh] flex flex-col p-0 bg-card shadow-large [&>button]:hidden">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              <Bot className="h-6 w-6 text-primary" />
              AI Finance Assistant
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
                className="text-muted-foreground hover:text-foreground"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Help Panel */}
        {showHelp && capabilities && (
          <div className="p-4 bg-surface">
            <h4 className="font-semibold mb-2 text-foreground">
              What I can help you with:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {capabilities.intents
                ?.slice(0, 4)
                .map((intent: any, index: number) => (
                  <div key={index} className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {intent.name}:
                    </span>{" "}
                    "{intent.examples[0]}"
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <Card className="bg-surface shadow-sm">
                    <CardContent className="p-3">
                      <p className="text-sm text-foreground whitespace-pre-line">
                        {formatMessage(getWelcomeMessage())}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {/* User Message */}
                <div className="flex gap-3 justify-end">
                  <div className="flex-1 max-w-[80%]">
                    <Card className="bg-primary text-primary-foreground shadow-sm">
                      <CardContent className="p-3">
                        <p className="text-sm">{message.userMessage}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                {/* Bot Response */}
                {message.botResponse && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.success
                            ? "bg-primary/10"
                            : "bg-destructive/10"
                        }`}
                      >
                        <Bot
                          className={`h-4 w-4 ${
                            message.success
                              ? "text-primary"
                              : "text-destructive"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <Card
                        className={`shadow-sm ${
                          message.success ? "bg-surface" : "bg-destructive/5"
                        }`}
                      >
                        <CardContent className="p-3">
                          <p className="text-sm text-foreground whitespace-pre-line">
                            {formatMessage(message.botResponse)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <Card className="bg-surface shadow-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span>Thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4">
          {/* Recording Status */}
          {isRecording && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-primary">
                    Listening...
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatRecordingTime(recordingDuration)}
                  </span>
                </div>
                <Button
                  onClick={stopRecording}
                  size="sm"
                  className="bg-destructive hover:bg-destructive/90"
                >
                  <MicOff className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Speak clearly - your speech will be converted to text for
                editing...
              </p>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2">
            {/* Input field with integrated mic button */}
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Type your message${
                  isVoiceAvailable ? " or click mic to speak" : ""
                }... (e.g., 'I spent ${formatCurrency(25)} on lunch')`}
                disabled={isLoading || isRecording}
                className={`focus:ring-primary ${
                  isVoiceAvailable ? "pr-12" : ""
                }`}
              />

              {/* Voice Button Inside Input */}
              {isVoiceAvailable && (
                <Button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  variant="ghost"
                  size="sm"
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 transition-all duration-200 ${
                    isRecording
                      ? "text-destructive animate-pulse hover:text-destructive/80"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  }`}
                  title={isRecording ? "Stop recording" : "Click to speak"}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={isLoading || !inputMessage.trim() || isRecording}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Powered by AI • Type naturally to manage your finances
            </p>
            {isVoiceAvailable && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                Voice enabled
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
