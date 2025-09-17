// Bu dosya: functions/src/index.ts

import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {VertexAI} from "@google-cloud/vertexai";

admin.initializeApp();
const db = admin.firestore();

// DÜZELTME: Konumu Avrupa olarak değiştirdik
const vertex_ai = new VertexAI({
  project: process.env.GCLOUD_PROJECT,
  location: "europe-west1",
});

const generativeModel = vertex_ai.getGenerativeModel({
    model: "gemini-1.0-pro",
});

// DÜZELTME: Fonksiyonun çalışacağı bölgeyi de Avrupa olarak belirttik
export const generateVakitContent = onDocumentUpdated(
    {
        document: "vakit_tanimlari/{docId}",
        region: "europe-west1",
    },
    async (event) => {
        const beforeData = event.data?.before.data();
        const afterData = event.data?.after.data();
        const docId = event.params.docId;

        if (!beforeData || !afterData || beforeData.sourceText === afterData.sourceText) {
            return null;
        }

        const kaynakMetin = afterData.sourceText;
        if (!kaynakMetin) {
            return null;
        }

        logger.info(`"${docId}" için AI içerik üretimi başladı (Bölge: europe-west1).`);
        
        const prompt = `Aşağıdaki metni, manevi derinliğini koruyarak, sade ve akıcı bir dille yaklaşık 150-200 kelimelik bir özet paragrafa dönüştür: "${kaynakMetin}"`;

        try {
          const resp = await generativeModel.generateContent(prompt);
          const ozet = resp.response.candidates?.[0].content.parts[0].text || "";

          if (ozet) {
            logger.info("Özet başarıyla oluşturuldu.");
            await db.collection("vakit_tanimlari").doc(docId).set({
              aiContent: {
                ozet: ozet,
                zihinHaritasi: afterData.aiContent?.zihinHaritasi || "(bekleniyor)",
                soruCevap: afterData.aiContent?.soruCevap || "(bekleniyor)",
              },
            }, {merge: true});
            return logger.info("Veritabanı başarıyla güncellendi.");
          }
        } catch (error) {
          return logger.error("Gemini API hatası:", error);
        }

        return null;
    }
);