import { db } from "@/config/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, writeBatch, doc } from "firebase/firestore";
import { ScanRecord } from "@/types";

const LOCAL_STORAGE_KEY = "food_scanner_history";

export class ScanRepository {
  static async getCloudScans(userId: string): Promise<ScanRecord[]> {
    const q = query(
      collection(db, "scan_history"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    const firestoreHistory: ScanRecord[] = [];
    querySnapshot.forEach((doc) => {
      firestoreHistory.push({ ...doc.data(), id: doc.id } as ScanRecord);
    });
    return firestoreHistory;
  }

  static async addCloudScan(userId: string, record: Omit<ScanRecord, "id" | "userId">): Promise<ScanRecord> {
    const docRef = await addDoc(collection(db, "scan_history"), {
      ...record,
      userId,
    });
    return { ...record, id: docRef.id, userId } as ScanRecord;
  }

  static getLocalScans(): ScanRecord[] {
    if (typeof window === 'undefined') return [];
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!localData) return [];
    try {
      return JSON.parse(localData) as ScanRecord[];
    } catch {
      return [];
    }
  }

  static addLocalScan(record: Omit<ScanRecord, "id" | "userId">, currentHistory: ScanRecord[]): ScanRecord {
    const newRecord = { ...record, id: Date.now().toString() } as ScanRecord;
    const newHistory = [newRecord, ...currentHistory];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
    return newRecord;
  }

  static async syncLocalToCloud(userId: string): Promise<void> {
    const localHistory = this.getLocalScans();
    if (localHistory.length === 0) return;

    const batch = writeBatch(db);
    localHistory.forEach((record) => {
      const docRef = doc(collection(db, "scan_history"));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...dataToSave } = record;
      batch.set(docRef, { ...dataToSave, userId });
    });
    
    await batch.commit();
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}
