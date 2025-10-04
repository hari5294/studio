'use server';

/**
 * @fileOverview Identifies trending badges based on join metrics.
 *
 * - trendingBadgeDiscovery - A function that discovers trending badges.
 * - TrendingBadgeDiscoveryInput - The input type for the trendingBadgeDiscovery function.
 * - TrendingBadgeDiscoveryOutput - The return type for the trendingBadgeDiscovery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrendingBadgeDiscoveryInputSchema = z.object({
  badgeJoinMetrics: z.array(
    z.object({
      badgeId: z.string().describe('The ID of the badge.'),
      joinCount: z.number().describe('The number of times the badge has been joined.'),
    })
  ).describe('An array of badge join metrics.'),
  numberOfTrendingBadges: z.number().default(5).describe('The number of trending badges to return.'),
});
export type TrendingBadgeDiscoveryInput = z.infer<typeof TrendingBadgeDiscoveryInputSchema>;

const TrendingBadgeDiscoveryOutputSchema = z.object({
  trendingBadges: z.array(
    z.object({
      badgeId: z.string().describe('The ID of the trending badge.'),
      trendScore: z.number().describe('A score indicating how trending the badge is.'),
    })
  ).describe('An array of trending badges.'),
});
export type TrendingBadgeDiscoveryOutput = z.infer<typeof TrendingBadgeDiscoveryOutputSchema>;

export async function trendingBadgeDiscovery(input: TrendingBadgeDiscoveryInput): Promise<TrendingBadgeDiscoveryOutput> {
  return trendingBadgeDiscoveryFlow(input);
}

const trendingBadgeDiscoveryPrompt = ai.definePrompt({
  name: 'trendingBadgeDiscoveryPrompt',
  input: {schema: TrendingBadgeDiscoveryInputSchema},
  output: {schema: TrendingBadgeDiscoveryOutputSchema},
  prompt: `You are an expert in identifying trending items based on metrics.

  Given the following badge join metrics, identify the top {{numberOfTrendingBadges}} trending badges.
  Return the badge IDs and a trend score for each, indicating how trending the badge is. The higher the joinCount, the higher the trendScore should be.

  Badge Join Metrics:
  {{#each badgeJoinMetrics}}
  - Badge ID: {{badgeId}}, Join Count: {{joinCount}}
  {{/each}}`,
});

const trendingBadgeDiscoveryFlow = ai.defineFlow(
  {
    name: 'trendingBadgeDiscoveryFlow',
    inputSchema: TrendingBadgeDiscoveryInputSchema,
    outputSchema: TrendingBadgeDiscoveryOutputSchema,
  },
  async input => {
    const {output} = await trendingBadgeDiscoveryPrompt(input);
    return output!;
  }
);
