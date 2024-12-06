import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase"; // Firebase yapılandırması

// Kullanıcı bilgilerini Firestore'a kaydet
export const saveUserData = async (userId, userData) => {
    try {
        await setDoc(doc(db, "users", userId), userData); // "users" koleksiyonuna yaz
        console.log("Kullanıcı bilgileri başarıyla kaydedildi.");
    } catch (error) {
        console.error("Kullanıcı bilgileri kaydedilirken hata oluştu:", error.message);
    }
};

// Kullanıcı bilgilerini Firestore'dan getir
export const fetchUserData = async (userId) => {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("Kullanıcı bilgileri bulunamadı.");
            return null;
        }
    } catch (error) {
        console.error("Kullanıcı bilgileri alınırken hata oluştu:", error.message);
    }
};

// Kullanıcının harita durumlarını Firestore'a kaydet
export const saveMapData = async (userId, countries) => {
    try {
        const docRef = doc(db, "maps", userId);
        const existingDoc = await getDoc(docRef);

        if (existingDoc.exists()) {
            const existingData = existingDoc.data().countries || {};
            const updatedData = { ...existingData, ...countries }; // Mevcut verilerle birleştir
            await updateDoc(docRef, { countries: updatedData });
        } else {
            await setDoc(docRef, { countries });
        }

        console.log("Harita verisi başarıyla kaydedildi.");
    } catch (error) {
        console.error("Harita verisi kaydedilirken hata oluştu:", error.message);
    }
};

// Kullanıcının harita durumlarını Firestore'dan getir
export const fetchMapData = async (userId) => {
    try {
        const docRef = doc(db, "maps", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().countries;
        } else {
            console.log("Harita verisi bulunamadı.");
            return {};
        }
    } catch (error) {
        console.error("Harita verisi alınırken hata oluştu:", error.message);
    }
};
