import Anthropic from '@anthropic-ai/sdk';
import type { SentimentAnalysis } from '../types';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be called from a backend
});

export async function analyzeSentiment(reviewText: string): Promise<SentimentAnalysis> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Analyze this customer review and return ONLY a JSON object with: {sentiment_score: 0-1, sentiment_label: 'positive'|'neutral'|'negative', key_themes: [array of 3 themes]}. Review: ${reviewText}`
        }
      ]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysis: SentimentAnalysis = JSON.parse(jsonMatch[0]);

    // Validate the response
    if (
      typeof analysis.sentiment_score !== 'number' ||
      !['positive', 'neutral', 'negative'].includes(analysis.sentiment_label) ||
      !Array.isArray(analysis.key_themes)
    ) {
      throw new Error('Invalid analysis format');
    }

    return analysis;
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    throw new Error('Failed to analyze sentiment');
  }
}
