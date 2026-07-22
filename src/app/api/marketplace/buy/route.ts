import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, runTransaction } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const { buyerUid, sellerUid, itemId, itemTitle, priceQnt, driveFileUrl, pdfDataUrl, pdfFileName } = await req.json();

    if (!buyerUid || !priceQnt || !itemId) {
      return NextResponse.json({ error: "Parametri incompleti" }, { status: 400 });
    }

    const buyerRef = doc(db, "users", buyerUid);
    const sellerRef = sellerUid ? doc(db, "users", sellerUid) : null;

    let transactionResult: any = {};

    await runTransaction(db, async (transaction) => {
      const buyerDoc = await transaction.get(buyerRef);
      if (!buyerDoc.exists()) {
        throw new Error("Utente compratore non trovato su Firestore");
      }

      const buyerData = buyerDoc.data();
      const currentTokens = buyerData.qntTokens || 0;

      if (currentTokens < priceQnt) {
        throw new Error(`Saldo $QNT insufficiente. Richiesti: ${priceQnt}, Disponibili: ${currentTokens}`);
      }

      const newBuyerTokens = currentTokens - priceQnt;
      transaction.update(buyerRef, { qntTokens: newBuyerTokens });

      if (sellerRef) {
        const sellerDoc = await transaction.get(sellerRef);
        if (sellerDoc.exists()) {
          const sellerData = sellerDoc.data();
          const newSellerTokens = (sellerData.qntTokens || 0) + priceQnt;
          transaction.update(sellerRef, { qntTokens: newSellerTokens });
        }
      }

      // Save purchase record
      const purchaseRef = doc(db, `users/${buyerUid}/purchases`, itemId);
      transaction.set(purchaseRef, {
        itemId,
        itemTitle,
        priceQnt,
        driveFileUrl: driveFileUrl || "https://drive.google.com",
        pdfDataUrl: pdfDataUrl || null,
        pdfFileName: pdfFileName || null,
        purchasedAt: new Date().toISOString()
      });

      transactionResult = {
        newBuyerBalance: newBuyerTokens,
        driveFileUrl: driveFileUrl || "https://drive.google.com",
        pdfDataUrl: pdfDataUrl || null,
        pdfFileName: pdfFileName || null
      };
    });

    return NextResponse.json({
      success: true,
      message: `Acquisto di "${itemTitle}" completato con successo!`,
      ...transactionResult
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Errore durante la transazione atomica" }, { status: 500 });
  }
}
