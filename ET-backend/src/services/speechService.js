const { createClient } = require("@deepgram/sdk");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

class SpeechService {
  constructor() {
    this.deepgramClient = null;
    this.initialized = false;
    this.initializeUpload();
    this.checkCredentials();
  }

  checkCredentials() {
    // Check if Deepgram API key is available and not a placeholder
    const hasDeepgramKey =
      process.env.DEEPGRAM_API_KEY &&
      process.env.DEEPGRAM_API_KEY !== "your-deepgram-api-key-here";

    this.credentialsAvailable = !!hasDeepgramKey;

    if (!this.credentialsAvailable) {
      if (process.env.DEEPGRAM_API_KEY === "your-deepgram-api-key-here") {
        console.warn("⚠️  Deepgram API key is set to placeholder value");
      } else {
        console.warn("⚠️  Deepgram API key not found");
      }
      console.warn("📝 Speech features will be disabled. To enable, set:");
      console.warn("   - DEEPGRAM_API_KEY=your-actual-deepgram-api-key");
      console.warn("🔗 Get API key: https://console.deepgram.com/");
    } else {
      console.log("✅ Deepgram API key found - speech features available");
    }
  }

  async initializeClient() {
    if (this.initialized || !this.credentialsAvailable) {
      return;
    }

    try {
      this.deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);
      this.initialized = true;
    } catch (error) {
      console.error("❌ Failed to initialize Deepgram client:", error.message);
      console.warn(
        "🔧 Speech features will be disabled. Please check your Deepgram API key"
      );
      this.deepgramClient = null;
    }
  }

  initializeUpload() {
    // Configure multer for audio file uploads - use /tmp for serverless
    const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp' : 'uploads/audio/';
    this.upload = multer({
      dest: uploadDir,
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit (Deepgram supports larger files)
      },
      fileFilter: (req, file, cb) => {
        // Accept audio files
        if (
          file.mimetype.startsWith("audio/") ||
          file.originalname.endsWith(".webm") ||
          file.originalname.endsWith(".wav") ||
          file.originalname.endsWith(".mp3") ||
          file.originalname.endsWith(".m4a") ||
          file.originalname.endsWith(".flac") ||
          file.originalname.endsWith(".ogg")
        ) {
          cb(null, true);
        } else {
          cb(new Error("Only audio files are allowed"), false);
        }
      },
    });
  }

  // Convert speech to text from audio buffer
  async speechToText(audioBuffer, options = {}) {
    // Initialize client on first use
    if (!this.initialized) {
      await this.initializeClient();
    }

    if (!this.deepgramClient) {
      throw new Error(
        "Speech-to-Text service not available - missing API credentials"
      );
    }

    try {
      // Deepgram configuration
      const deepgramOptions = {
        model: options.model || "nova-2",
        language: options.languageCode || "en-US",
        smart_format: true,
        punctuate: true,
        diarize: false,
        filler_words: false,
        utterances: false,
        ...(this.getDeepgramEncoding(options.encoding) && {
          encoding: this.getDeepgramEncoding(options.encoding),
        }),
        sample_rate: options.sampleRate || 48000,
        channels: 1,
        ...options.deepgramConfig,
      };

      // Use Deepgram's transcription API - v4 SDK format
      const response =
        await this.deepgramClient.listen.prerecorded.transcribeFile(
          audioBuffer,
          deepgramOptions
        );

      if (response.error) {
        throw new Error(
          `Deepgram API error: ${JSON.stringify(response.error)}`
        );
      }

      const result = response.result;

      if (
        !result.results ||
        !result.results.channels ||
        result.results.channels.length === 0
      ) {
        return {
          success: false,
          transcript: "",
          confidence: 0,
          message: "No speech detected in audio",
        };
      }

      const channel = result.results.channels[0];
      if (!channel.alternatives || channel.alternatives.length === 0) {
        return {
          success: false,
          transcript: "",
          confidence: 0,
          message: "No transcription alternatives found",
        };
      }

      const primaryAlternative = channel.alternatives[0];
      const transcript = primaryAlternative.transcript || "";
      const confidence = primaryAlternative.confidence || 0;

      return {
        success: true,
        transcript: transcript.trim(),
        confidence: confidence,
        alternatives: channel.alternatives.slice(0, 3).map((alt) => ({
          transcript: alt.transcript || "",
          confidence: alt.confidence || 0,
        })),
        metadata: {
          model: deepgramOptions.model,
          language: deepgramOptions.language,
          duration: result.metadata?.duration || 0,
          processedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Deepgram speech recognition error:", error);

      // Handle specific error types
      if (
        error.message?.includes("401") ||
        error.message?.includes("unauthorized")
      ) {
        return {
          success: false,
          transcript: "",
          confidence: 0,
          message: "Invalid API key. Please check your Deepgram credentials.",
        };
      } else if (
        error.message?.includes("402") ||
        error.message?.includes("payment")
      ) {
        return {
          success: false,
          transcript: "",
          confidence: 0,
          message:
            "Insufficient credits. Please check your Deepgram account balance.",
        };
      } else if (
        error.message?.includes("429") ||
        error.message?.includes("rate limit")
      ) {
        return {
          success: false,
          transcript: "",
          confidence: 0,
          message: "Rate limit exceeded. Please try again later.",
        };
      }

      return {
        success: false,
        transcript: "",
        confidence: 0,
        message: "Failed to process speech. Please try again.",
      };
    }
  }

  // Convert speech to text from file path
  async speechToTextFromFile(filePath, options = {}) {
    // Initialize client on first use
    if (!this.initialized) {
      await this.initializeClient();
    }

    if (!this.deepgramClient) {
      throw new Error(
        "Speech-to-Text service not available - missing API credentials"
      );
    }

    try {
      // Deepgram configuration
      const deepgramOptions = {
        model: options.model || "nova-2",
        language: options.languageCode || "en-US",
        smart_format: true,
        punctuate: true,
        diarize: false,
        filler_words: false,
        utterances: false,
        sample_rate: options.sampleRate || 48000,
        channels: 1,
        ...options.deepgramConfig,
      };

      // Debug: Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`Audio file not found: ${filePath}`);
      }

      // Use Deepgram's transcription API directly with file stream
      const response =
        await this.deepgramClient.listen.prerecorded.transcribeFile(
          fs.createReadStream(filePath),
          deepgramOptions
        );

      if (response.error) {
        throw new Error(
          `Deepgram API error: ${JSON.stringify(response.error)}`
        );
      }

      const result = response.result;

      if (
        !result.results ||
        !result.results.channels ||
        result.results.channels.length === 0
      ) {
        return {
          success: false,
          transcript: "",
          confidence: 0,
          message: "No speech detected in audio",
        };
      }

      const channel = result.results.channels[0];
      if (!channel.alternatives || channel.alternatives.length === 0) {
        return {
          success: false,
          transcript: "",
          confidence: 0,
          message: "No transcription alternatives found",
        };
      }

      const primaryAlternative = channel.alternatives[0];
      const transcript = primaryAlternative.transcript || "";
      const confidence = primaryAlternative.confidence || 0;

      // Clean up temporary file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn("Failed to cleanup audio file:", cleanupError);
      }

      return {
        success: true,
        transcript: transcript.trim(),
        confidence: confidence,
        alternatives: channel.alternatives.slice(0, 3).map((alt) => ({
          transcript: alt.transcript || "",
          confidence: alt.confidence || 0,
        })),
        metadata: {
          model: deepgramOptions.model,
          language: deepgramOptions.language,
          duration: result.metadata?.duration || 0,
          processedAt: new Date().toISOString(),
          provider: "deepgram",
        },
      };
    } catch (error) {
      console.error("File processing error:", error);

      // Clean up temporary file on error too
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn("Failed to cleanup audio file after error:", cleanupError);
      }

      // Handle specific error types
      if (
        error.message?.includes("401") ||
        error.message?.includes("unauthorized")
      ) {
        return {
          success: false,
          transcript: "",
          confidence: 0,
          message: "Invalid API key. Please check your Deepgram credentials.",
        };
      } else if (
        error.message?.includes("402") ||
        error.message?.includes("payment")
      ) {
        return {
          success: false,
          transcript: "",
          confidence: 0,
          message:
            "Insufficient credits. Please check your Deepgram account balance.",
        };
      } else if (
        error.message?.includes("429") ||
        error.message?.includes("rate limit")
      ) {
        return {
          success: false,
          transcript: "",
          confidence: 0,
          message: "Rate limit exceeded. Please try again later.",
        };
      }

      return {
        success: false,
        transcript: "",
        confidence: 0,
        message: "Failed to process audio file",
      };
    }
  }

  // Stream-based speech recognition (for real-time)
  async createSpeechStream(options = {}) {
    // Initialize client on first use
    if (!this.initialized) {
      await this.initializeClient();
    }

    if (!this.deepgramClient) {
      throw new Error("Speech-to-Text service not available");
    }

    const deepgramOptions = {
      model: options.model || "nova-2",
      language: options.languageCode || "en-US",
      smart_format: true,
      punctuate: true,
      interim_results: options.interimResults || true,
      utterance_end_ms: options.utteranceEndMs || 1000,
      vad_events: true,
      encoding: this.getDeepgramEncoding(options.encoding) || "linear16",
      sample_rate: options.sampleRate || 16000,
      channels: 1,
      ...options.deepgramConfig,
    };

    // Create live transcription connection
    const dgConnection = this.deepgramClient.listen.live(deepgramOptions);

    return dgConnection;
  }

  // Get supported languages for speech recognition
  getSupportedLanguages() {
    return [
      { code: "en-US", name: "English (US)" },
      { code: "en-GB", name: "English (UK)" },
      { code: "en-AU", name: "English (Australia)" },
      { code: "en-CA", name: "English (Canada)" },
      { code: "es-ES", name: "Spanish (Spain)" },
      { code: "es-US", name: "Spanish (US)" },
      { code: "es-MX", name: "Spanish (Mexico)" },
      { code: "fr-FR", name: "French (France)" },
      { code: "fr-CA", name: "French (Canada)" },
      { code: "de-DE", name: "German (Germany)" },
      { code: "it-IT", name: "Italian (Italy)" },
      { code: "pt-BR", name: "Portuguese (Brazil)" },
      { code: "pt-PT", name: "Portuguese (Portugal)" },
      { code: "ru-RU", name: "Russian (Russia)" },
      { code: "ja-JP", name: "Japanese (Japan)" },
      { code: "ko-KR", name: "Korean (South Korea)" },
      { code: "zh-CN", name: "Chinese (Mandarin, Simplified)" },
      { code: "zh-TW", name: "Chinese (Traditional)" },
      { code: "hi-IN", name: "Hindi (India)" },
      { code: "ar-SA", name: "Arabic (Saudi Arabia)" },
      { code: "nl-NL", name: "Dutch (Netherlands)" },
      { code: "sv-SE", name: "Swedish (Sweden)" },
      { code: "da-DK", name: "Danish (Denmark)" },
      { code: "no-NO", name: "Norwegian (Norway)" },
      { code: "fi-FI", name: "Finnish (Finland)" },
      { code: "pl-PL", name: "Polish (Poland)" },
      { code: "tr-TR", name: "Turkish (Turkey)" },
      { code: "uk-UA", name: "Ukrainian (Ukraine)" },
    ];
  }

  // Map common audio encodings to Deepgram format
  getDeepgramEncoding(encoding) {
    if (!encoding) return null;

    const encodingMap = {
      LINEAR16: "linear16",
      WEBM_OPUS: "webm",
      MP3: "mp3",
      MP4: "aac",
      FLAC: "flac",
      OGG_OPUS: "ogg",
      MULAW: "mulaw",
      AMR: "amr",
      AMR_WB: "amr-wb",
    };

    return encodingMap[encoding.toUpperCase()] || encoding.toLowerCase();
  }

  // Check if service is available
  isAvailable() {
    return this.credentialsAvailable;
  }

  // Get multer upload middleware
  getUploadMiddleware() {
    return this.upload.single("audio");
  }

  // Validate audio file
  validateAudioFile(file) {
    if (!file) {
      return { valid: false, error: "No audio file provided" };
    }

    // Check file size (25MB limit for Deepgram)
    if (file.size > 25 * 1024 * 1024) {
      return { valid: false, error: "Audio file too large (max 25MB)" };
    }

    // Check if it's an audio file
    const validMimeTypes = [
      "audio/webm",
      "audio/wav",
      "audio/mp3",
      "audio/mpeg",
      "audio/mp4",
      "audio/x-m4a",
      "audio/flac",
      "audio/ogg",
    ];

    const validExtensions = [
      ".webm",
      ".wav",
      ".mp3",
      ".m4a",
      ".mp4",
      ".flac",
      ".ogg",
    ];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (
      !validMimeTypes.includes(file.mimetype) &&
      !validExtensions.includes(fileExtension)
    ) {
      return {
        valid: false,
        error:
          "Invalid audio format. Supported formats: WEBM, WAV, MP3, M4A, FLAC, OGG",
      };
    }

    return { valid: true };
  }

  // Enhanced speech processing with smart financial analysis
  async processVoiceInput(audioBuffer, userContext = {}) {
    try {
      // Convert speech to text
      const speechResult = await this.speechToText(audioBuffer, {
        languageCode: userContext.language || "en-US",
        model: userContext.model || "nova-2",
      });

      if (!speechResult.success) {
        return speechResult;
      }

      // Analyze transcript for financial content
      const financialAnalysis = await this.analyzeFinancialContent(speechResult.transcript);

      // Enhanced result with metadata and financial analysis
      return {
        ...speechResult,
        financialAnalysis: financialAnalysis,
        metadata: {
          ...speechResult.metadata,
          audioProcessedAt: new Date().toISOString(),
          userLanguage: userContext.language || "en-US",
          contextProvided: Object.keys(userContext).length > 0,
          provider: "deepgram",
          hasFinancialContent: financialAnalysis.hasFinancialContent,
          requiresClarification: financialAnalysis.needsClarification
        },
      };
    } catch (error) {
      console.error("Voice input processing error:", error);
      return {
        success: false,
        transcript: "",
        confidence: 0,
        message: "Failed to process voice input",
      };
    }
  }

  // Analyze transcript content for financial information
  async analyzeFinancialContent(transcript) {
    try {
      // Import aiService here to avoid circular dependency
      const aiService = require("./aiService");
      
      // Use our enhanced AI service to analyze the transcript
      const analysis = await aiService.analyzeFinancialTransaction(transcript);
      
      return {
        hasFinancialContent: analysis.confidence > 0.3,
        transactionType: analysis.transactionType,
        category: analysis.category,
        confidence: analysis.confidence,
        amount: analysis.amount,
        needsClarification: analysis.needsClarification,
        suggestions: analysis.suggestions,
        reasoning: analysis.reasoning,
        clarificationQuestions: analysis.clarificationQuestions || [],
        contextualHints: analysis.contextualHints || []
      };
    } catch (error) {
      console.error("Financial content analysis error:", error);
      return {
        hasFinancialContent: false,
        transactionType: "unknown",
        category: "other",
        confidence: 0,
        amount: null,
        needsClarification: true,
        suggestions: [],
        reasoning: "Analysis failed",
        clarificationQuestions: ["Could you clarify what type of transaction this is?"]
      };
    }
  }

  // Get available models
  getAvailableModels() {
    return [
      {
        id: "nova-2",
        name: "Nova-2 (Latest, Best Accuracy)",
        description: "Most accurate model with latest improvements",
      },
      {
        id: "nova",
        name: "Nova (Fast & Accurate)",
        description: "Balanced speed and accuracy",
      },
      {
        id: "enhanced",
        name: "Enhanced (Legacy)",
        description: "Older enhanced model",
      },
      {
        id: "base",
        name: "Base (Fastest)",
        description: "Fastest transcription, lower accuracy",
      },
    ];
  }

  // Health check for the service
  async healthCheck() {
    try {
      if (!this.credentialsAvailable) {
        return {
          status: "unavailable",
          message: "Deepgram API key not configured",
        };
      }

      if (!this.initialized) {
        await this.initializeClient();
      }

      if (!this.deepgramClient) {
        return {
          status: "error",
          message: "Failed to initialize Deepgram client",
        };
      }

      return {
        status: "healthy",
        message: "Deepgram speech service is operational",
        provider: "deepgram",
        models: this.getAvailableModels().map((m) => m.id),
      };
    } catch (error) {
      return {
        status: "error",
        message: `Health check failed: ${error.message}`,
      };
    }
  }
}

module.exports = new SpeechService();
