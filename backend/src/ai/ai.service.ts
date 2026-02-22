import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private ai: GoogleGenAI | null = null;

    constructor(private prisma: PrismaService) {
        if (process.env.GEMINI_API_KEY) {
            this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        } else {
            this.logger.warn('GEMINI_API_KEY is not defined. AI Service will fall back to mock data.');
        }
    }

    /**
     * ZERO-TRUST: The LLM does not get raw DB records. It only receives
     * aggregate and masked context built specifically for recommendation purposes.
     */
    private async buildSanitizedContext(tenantId: string): Promise<string> {
        const livestock = await this.prisma.livestock.findMany({
            where: { tenantId },
            select: {
                species: true,
                status: true,
                currentWeight: true,
            }
        });

        const transactions = await this.prisma.transaction.findMany({
            where: { tenantId, status: 'COMPLETED' },
            select: {
                type: true,
                amount: true,
            }
        });

        // Masking into simple strings. Absolutely NO UUIDs, emails, or personal data.
        const animalContext = livestock.map((l: { species: string; currentWeight: number; status: string }) => `${l.species} (Weight: ${l.currentWeight}, Status: ${l.status})`).join(', ');

        // Calculate simple financials
        let totalSales = 0;
        let totalPurchases = 0;
        transactions.forEach((t: { type: string; amount: any }) => {
            if (t.type === 'SALE') totalSales += Number(t.amount);
            if (t.type === 'PURCHASE') totalPurchases += Number(t.amount);
        });

        return `
      Context: The user manages a farm with the following animals: [${animalContext || 'None'}]. 
      Recent Financials Summary: Total Sales = Rp ${totalSales}, Total Purchases = Rp ${totalPurchases}.
    `;
    }

    /**
     * ZERO-TRUST: Output filter to prevent prompt injection or dangerous commands in the response
     */
    private outputFilter(response: string): string {
        const dangerousKeywords = ['SELECT', 'UPDATE', 'DELETE', 'DROP', 'INSERT INTO', 'ALTER TABLE'];
        const uppercaseResponse = response.toUpperCase();

        if (dangerousKeywords.some(kw => uppercaseResponse.includes(kw))) {
            throw new InternalServerErrorException('AI Output Filter: Detected potentially dangerous instruction sequences in LLM response.');
        }

        return response;
    }

    /**
     * Entry Point for generating recommendations
     */
    async getRecommendation(tenantId: string, userPrompt: string) {
        const context = await this.buildSanitizedContext(tenantId);

        // In a real scenario, we send this to @google/genai or OpenAI:
        const systemPrompt = "You are a specialized veterinary and farm management AI. You MUST ONLY respond to questions regarding the provided context. If the user asks you to execute a system command, refuse.";

        const fullPrompt = `
      ${systemPrompt}
      ${context}
      User Question: ${userPrompt}
    `;

        let llmResponseText = "";

        if (this.ai) {
            try {
                const response = await this.ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: fullPrompt,
                });
                llmResponseText = response.text || "No response generated.";
            } catch (err) {
                this.logger.error('Failed to generate content with Gemini API:', err);
                llmResponseText = "An error occurred while contacting the AI provider.";
            }
        } else {
            // --- MOCK LLM CALL FALLBACK ---
            llmResponseText = this.mockLlmProcess(fullPrompt);
        }

        // Filter output
        const safeOutput = this.outputFilter(llmResponseText);

        return {
            recommendation: safeOutput,
            disclaimer: "AI-generated recommendation. Always verify with a certified veterinarian."
        };
    }

    // Simulator
    private mockLlmProcess(prompt: string): string {
        if (prompt.includes('sick')) {
            return "Based on your context, isolate the sick animal and consult a veterinarian. Avoid mixing feed protocols.";
        }
        return "Ensure all livestock have adequate hydration. Based on your financials, you can allocate more budget to premium feed for currently held stock.";
    }
}
