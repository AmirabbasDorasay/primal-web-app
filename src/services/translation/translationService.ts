// Translation service for Primal Web App
// Supports LibreTranslate, DeepL, and Google (placeholder)

import { accountStore } from '../../stores/accountStore';

export interface TranslationSettings {
  provider: 'libretranslate' | 'deepl' | 'google';
  apiKey: string;
  libreUrl?: string;
  preferredLanguage: string;
}

export class TranslationService {
  private settings: TranslationSettings;
  // Cache for translated text: key is `${noteId}:${targetLang}`
  private cache: Map<string, string>;

  constructor() {
    // Initialize with default settings; will be updated from accountStore
    this.settings = {
      provider: 'libretranslate',
      apiKey: '',
      libreUrl: 'https://libretranslate.de',
      preferredLanguage: 'en',
    };
    this.cache = new Map();
    this.loadSettingsFromStore();
  }

  private loadSettingsFromStore() {
    // TODO: Implement proper subscription to accountStore changes
    // For now, we'll just read the current state
    // In a real app, we would subscribe to the store
    const state = accountStore.getState();
    // Assuming we have added these fields to accountStore
    if (state.translationProvider) {
      this.settings.provider = state.translationProvider;
    }
    if (state.translationApiKey) {
      this.settings.apiKey = state.translationApiKey;
    }
    if (state.translationLibreUrl) {
      this.settings.libreUrl = state.translationLibreUrl;
    }
    if (state.preferredLanguage) {
      this.settings.preferredLanguage = state.preferredLanguage;
    }
  }

  // Update settings when they change in the store
  public updateSettings(newSettings: Partial<TranslationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  async translate(text: string, targetLang: string, noteId?: string): Promise<string> {
    if (!text.trim()) {
      return text;
    }

    // If target language is the same as source (or we don't know source), return original
    // We assume source is auto-detected by the service, so we just translate to targetLang
    if (targetLang === this.settings.preferredLanguage) {
      return text;
    }

    // Create a cache key if noteId is provided
    const cacheKey = noteId ? `${noteId}:${targetLang}` : undefined;
    if (cacheKey && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      let translated: string;
      switch (this.settings.provider) {
        case 'libretranslate':
          translated = await this.translateLibreTranslate(text, targetLang);
          break;
        case 'deepl':
          translated = await this.translateDeepL(text, targetLang);
          break;
        case 'google':
          // Placeholder for Google Translate API
          translated = await this.translateGoogle(text, targetLang);
          break;
        default:
          throw new Error(`Unsupported translation provider: ${this.settings.provider}`);
      }

      // Cache the result if we have a noteId
      if (cacheKey) {
        this.cache.set(cacheKey, translated);
      }

      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      // Return original text on failure
      return text;
    }
  }

  private async translateLibreTranslate(text: string, targetLang: string): Promise<string> {
    const url = new URL('/translate', this.settings.libreUrl);
    const params = new URLSearchParams({
      q: text,
      source: 'auto',
      target: targetLang,
      format: 'text',
    });
    if (this.settings.apiKey) {
      params.set('api_key', this.settings.apiKey);
    }
    url.search = params.toString();

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText || text;
  }

  private async translateDeepL(text: string, targetLang: string): Promise<string> {
    const url = 'https://api-free.deepl.com/v2/translate';
    const params = new URLSearchParams({
      text: text,
      target: targetLang.toUpperCase(), // DeepL uses uppercase language codes
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.settings.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translations[0]?.text || text;
  }

  private async translateGoogle(text: string, targetLang: string): Promise<string> {
    // Placeholder for Google Translate API
    // In a real implementation, you would use the Google Cloud Translation API
    // For now, we'll just return the original text
    console.warn('Google Translate not implemented');
    return text;
  }
}

// Export a singleton instance
export const translationService = new TranslationService();