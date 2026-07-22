import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const { userUid, action } = await req.json();

    if (action === "get_stem_question") {
      const questions = [
        {
          id: "stem-1",
          question: "In un circuito LC ideale con L = 2mH e C = 5uF, calcola la frequenza di risonanza f0 in Hz.",
          options: ["1591 Hz", "3183 Hz", "5000 Hz", "1000 Hz"],
          correctOption: 0
        },
        {
          id: "stem-2",
          question: "Un algoritmo di ricerca binaria su un array ordinato di 1024 elementi esegue al massimo quanti confronti?",
          options: ["10 confronti", "1024 confronti", "512 confronti", "20 confronti"],
          correctOption: 0
        },
        {
          id: "stem-3",
          question: "Qual è la forza di Lorentz agibile su una carica q in un campo B alla velocità v perpendicolare?",
          options: ["F = q * v * B", "F = q * v / B", "F = m * a^2", "F = I * L"],
          correctOption: 0
        }
      ];
      const selected = questions[Math.floor(Math.random() * questions.length)];
      return NextResponse.json({ question: selected });
    }

    if (action === "drop_the_wall") {
      // Deterministic server calculation for spheres
      const slots = [1, 2, 3, 4, 5];
      const multipliers = [500, 1000, 1500, 2500, 5000];

      const spheres = Array.from({ length: 3 }).map((_, i) => {
        const slot = slots[Math.floor(Math.random() * slots.length)];
        const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
        return { id: i + 1, slot, multiplier };
      });

      const totalBonusTokens = spheres.reduce((sum, s) => sum + s.multiplier, 0);

      if (userUid) {
        const awardRef = doc(db, `users/${userUid}/awards`, `event-${Date.now()}`);
        await setDoc(awardRef, {
          spheres,
          totalBonusTokens,
          timestamp: new Date().toISOString()
        });
      }

      return NextResponse.json({
        spheres,
        totalBonusTokens,
        message: "The Wall Drop calcolato con successo dal server Quantaly!"
      });
    }

    return NextResponse.json({ error: "Azione non riconosciuta" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
