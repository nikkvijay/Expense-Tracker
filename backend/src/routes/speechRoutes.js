const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const speechService = require('../services/speechService');
const chatbotService = require('../services/chatbotService');

// Speech-to-text endpoint
router.post('/speech-to-text', authMiddleware, speechService.getUploadMiddleware(), async (req, res) => {
  try {
    // Validate that speech service is available
    if (!speechService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Speech recognition service is not available'
      });
    }

    // Validate uploaded file
    const fileValidation = speechService.validateAudioFile(req.file);
    if (!fileValidation.valid) {
      return res.status(400).json({
        success: false,
        message: fileValidation.error
      });
    }

    // Get user context from request
    const userContext = {
      language: req.body.language || 'en-US',
      userId: req.user.id
    };

    // Process the speech file
    const result = await speechService.speechToTextFromFile(
      req.file.path,
      {
        languageCode: userContext.language,
        encoding: req.body.encoding,
        sampleRate: req.body.sampleRate ? parseInt(req.body.sampleRate) : undefined
      }
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        details: result
      });
    }

    res.json({
      success: true,
      data: {
        transcript: result.transcript,
        confidence: result.confidence,
        alternatives: result.alternatives,
        metadata: {
          processedAt: new Date().toISOString(),
          language: userContext.language,
          userId: req.user.id
        }
      }
    });

  } catch (error) {
    console.error('Speech-to-text API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during speech processing'
    });
  }
});

// Voice message endpoint - combines speech-to-text with chatbot processing
router.post('/voice-message', authMiddleware, speechService.getUploadMiddleware(), async (req, res) => {
  try {
    // Validate that speech service is available
    if (!speechService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Speech recognition service is not available'
      });
    }

    // Validate uploaded file
    const fileValidation = speechService.validateAudioFile(req.file);
    if (!fileValidation.valid) {
      return res.status(400).json({
        success: false,
        message: fileValidation.error
      });
    }

    // Get user context
    const userContext = {
      language: req.body.language || 'en-US',
      userId: req.user.id,
      currency: req.body.currency ? JSON.parse(req.body.currency) : null
    };

    // Convert speech to text
    const speechResult = await speechService.speechToTextFromFile(
      req.file.path,
      {
        languageCode: userContext.language,
        encoding: req.body.encoding,
        sampleRate: req.body.sampleRate ? parseInt(req.body.sampleRate) : undefined
      }
    );

    if (!speechResult.success) {
      return res.status(400).json({
        success: false,
        message: speechResult.message,
        speechResult: speechResult
      });
    }

    // Get user's expenses and incomes for context (you might want to fetch these)
    const userExpenses = []; // TODO: Fetch from database
    const userIncomes = [];  // TODO: Fetch from database

    // Process the transcribed message with chatbot
    const chatbotResult = await chatbotService.processMessage(
      speechResult.transcript,
      req.user.id,
      userExpenses,
      userIncomes,
      userContext.currency
    );

    // Combine speech and chatbot results
    const response = {
      success: true,
      data: {
        speech: {
          transcript: speechResult.transcript,
          confidence: speechResult.confidence,
          alternatives: speechResult.alternatives
        },
        chatbot: {
          response: chatbotResult.response,
          action: chatbotResult.action,
          success: chatbotResult.success
        },
        metadata: {
          processedAt: new Date().toISOString(),
          language: userContext.language,
          userId: req.user.id,
          inputMethod: 'voice'
        }
      },
      // For compatibility with existing chatbot API
      response: chatbotResult.response,
      action: chatbotResult.action,
      actionResult: chatbotResult.actionResult,
      timestamp: new Date().toISOString(),
      sessionId: `voice_${Date.now()}_${req.user.id}`
    };

    res.json(response);

  } catch (error) {
    console.error('Voice message API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during voice message processing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get supported languages for speech recognition
router.get('/languages', authMiddleware, (req, res) => {
  try {
    const languages = speechService.getSupportedLanguages();
    res.json({
      success: true,
      data: {
        languages: languages,
        default: 'en-US'
      }
    });
  } catch (error) {
    console.error('Languages API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supported languages'
    });
  }
});

// Check speech service availability
router.get('/status', authMiddleware, (req, res) => {
  try {
    const isAvailable = speechService.isAvailable();
    res.json({
      success: true,
      data: {
        available: isAvailable,
        message: isAvailable 
          ? 'Speech recognition service is available'
          : 'Speech recognition service is not configured'
      }
    });
  } catch (error) {
    console.error('Speech status API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check speech service status'
    });
  }
});

module.exports = router;