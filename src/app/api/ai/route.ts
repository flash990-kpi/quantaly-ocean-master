import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, systemPrompt, jsonMode = false, category = "Generale", temperature = 0.7 } = await req.json();

    const nvidiaApiKey = process.env.NVIDIA_API_KEY || "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";

    if (nvidiaApiKey) {
      try {
        const messages = [];
        if (systemPrompt) {
          messages.push({ role: "system", content: systemPrompt });
        } else if (jsonMode) {
          messages.push({
            role: "system",
            content: "Sei il motore di apprendimento adattivo Quantaly. Rispondi ESCLUSIVAMENTE in un formato JSON valido. Non aggiungere blocchi di testo al di fuori del JSON."
          });
        }

        messages.push({ role: "user", content: prompt });

        const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${nvidiaApiKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-ai/deepseek-v4-pro",
            messages,
            temperature,
            top_p: 0.95,
            max_tokens: 2048,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            return NextResponse.json({ text: content, source: "deepseek-v4-pro" });
          }
        }
      } catch (err) {
        console.warn("NVIDIA API call failed, using category template fallback:", err);
      }
    }

    // Dynamic Category Decomposition Template Fallback if API fails
    const templatesByCategory: Record<string, string[]> = {
      Matematica: [
        "Passo 1: Identifica i dati del problema ed evidenzia le incognite",
        "Passo 2: Esegui 30s di respirazione guidata per la concentrazione",
        "Passo 3: Applica la formula principale e verifica i passaggi intermedi",
        "Passo 4: Controlla le unità di misura e registra i token QNT"
      ],
      Informatica: [
        "Passo 1: Analizza il problema e disegna lo schema di flusso concettuale",
        "Passo 2: Fai una pausa bio e sintetizza la struttura dati ideale",
        "Passo 3: Scrivi il primo blocco di codice verificando la sintassi",
        "Passo 4: Esegui i test di verifica ed esegui la sincronizzazione su Drive"
      ],
      Fisica: [
        "Passo 1: Schematizza il sistema fisico e individua le forze in gioco",
        "Passo 2: Attiva la maschera di lettura per ridurre l'affaticamento visivo",
        "Passo 3: Sviluppa le equazioni di stato del sistema",
        "Passo 4: Sottoponi i risultati al controllo di plausibilità"
      ],
      Storia: [
        "Passo 1: Colloca l'evento sulla linea del tempo concettuale",
        "Passo 2: Ascolta la sintesi vocale dei punti salienti",
        "Passo 3: Collega le cause storiche con le conseguenze sociali",
        "Passo 4: Salva le parole chiave nel tuo Hub di Studio"
      ],
      Generale: [
        "Passo 1: Leggi il titolo e sintetizza il concetto in una frase",
        "Passo 2: Fai una pausa di 30 secondi con respirazione guidata",
        "Passo 3: Rispondi ai primi quesiti chiave dividendo il compito",
        "Passo 4: Sincronizza i risultati su Google Tasks"
      ]
    };

    const steps = templatesByCategory[category] || templatesByCategory.Generale;

    if (jsonMode) {
      return NextResponse.json({
        text: JSON.stringify({ steps }),
        source: "quantaly-template-engine"
      });
    }

    const fallbackText = `[Quantaly DeepSeek Neural Engine - Modello Adattivo]\n\nScomposizione completata per: "${prompt.slice(0, 60)}..."\n\n1. Concetto Chiave: Riduzione del carico cognitivo tramite scomposizione temporale.\n2. Passi suggeriti: ${steps.join(" → ")}`;

    return NextResponse.json({ text: fallbackText, source: "quantaly-template-engine" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Errore durante l'elaborazione dell'IA", details: error.message },
      { status: 500 }
    );
  }
}
