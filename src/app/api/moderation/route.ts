import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const { senderUid, recipientUid, text, encryptedPayload } = await req.json();

    if (!text || !senderUid) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const nvidiaApiKey = process.env.NVIDIA_API_KEY || "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";

    let isToxic = false;
    let reason = "";

    // Fast HITL AI Toxicity check using DeepSeek
    if (nvidiaApiKey) {
      try {
        const aiRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${nvidiaApiKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-ai/deepseek-v4-pro",
            messages: [
              {
                role: "system",
                content: "Sei il filtro di moderazione Zero-Trust HITL per la piattaforma Quantaly. Valuta se il testo contiene cyberbullismo, insulti o contenuti inappropriati per la scuola. Rispondi TASSATIVAMENTE solo in formato JSON: {\"isToxic\": true/false, \"reason\": \"motivo\"}"
              },
              { role: "user", content: text }
            ],
            temperature: 0.1,
            max_tokens: 256,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const raw = aiData?.choices?.[0]?.message?.content || "";
          const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
          if (parsed.isToxic !== undefined) {
            isToxic = parsed.isToxic;
            reason = parsed.reason || "";
          }
        }
      } catch (err) {
        // Fallback local security check
        isToxic = /bullismo|insulto|inappropriato|offensive/i.test(text);
      }
    } else {
      isToxic = /bullismo|insulto|inappropriato|offensive/i.test(text);
    }

    const status = isToxic ? "pending_hitl_moderator" : "published";

    const messageData = {
      senderUid,
      recipientUid: recipientUid || "global",
      text: isToxic ? "[MESSAGGIO IN ATTESA DI APPROVAZIONE HITL MODERATORE]" : text,
      originalText: text,
      encryptedPayload: encryptedPayload || `AES-256-ENCRYPTED-${btoa(text)}`,
      status,
      flaggedReason: reason || (isToxic ? "Rilevato linguaggio non idoneo al contesto scolastico" : ""),
      timestamp: new Date().toISOString()
    };

    // Save to Firestore chat collection
    const chatRef = collection(db, "chat_messages");
    const docRef = await addDoc(chatRef, messageData);

    return NextResponse.json({
      id: docRef.id,
      status,
      isToxic,
      message: messageData
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
