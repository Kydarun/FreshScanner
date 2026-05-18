import { db } from "@/config/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, writeBatch, doc, updateDoc, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, DocumentData } from "firebase/firestore";
import { ScanRecord, StorageEnvironment, ShelfLifeEstimates } from "@/types";
import { FreshnessStatus } from "@/config/status";

const LOCAL_STORAGE_KEY = "food_scanner_history";

export class ScanRecordModel implements ScanRecord {
  public id: string;
  public identified_item: string;
  public specific_cut_or_part: string;
  public freshness_status: FreshnessStatus;
  public confidence_score: number;
  public analysis: string;
  public visual_cues_detected: string[];
  public recommended_storage: StorageEnvironment;
  public estimated_shelf_life_days: ShelfLifeEstimates;
  public timestamp: number;
  public userId?: string;
  public image_url?: string;
  public in_virtual_fridge?: boolean;
  public current_storage?: StorageEnvironment;

  constructor(data: Partial<ScanRecord> & { id: string }) {
    this.id = data.id;
    this.identified_item = data.identified_item || "Unknown";
    this.specific_cut_or_part = data.specific_cut_or_part || "N/A";
    this.freshness_status = data.freshness_status || "UNCLEAR";
    this.confidence_score = data.confidence_score || 0;
    this.analysis = data.analysis || "";
    this.visual_cues_detected = data.visual_cues_detected || [];
    this.recommended_storage = data.recommended_storage || "N/A";
    this.estimated_shelf_life_days = data.estimated_shelf_life_days || { PANTRY: -1, FRIDGE: -1, FREEZER: -1 };
    this.timestamp = data.timestamp || 0;
    this.userId = data.userId;
    this.image_url = data.image_url;
    this.in_virtual_fridge = data.in_virtual_fridge;
    this.current_storage = data.current_storage;
  }

  toJSON(): ScanRecord {
    return { ...this };
  }

  static converter: FirestoreDataConverter<ScanRecordModel> = {
    toFirestore: (record: ScanRecordModel): DocumentData => {
      const data = record.toJSON();
      delete (data as any).id;
      // Remove undefined values to keep Firestore clean
      Object.keys(data).forEach(key => (data as any)[key] === undefined && delete (data as any)[key]);
      return data;
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): ScanRecordModel => {
      const data = snapshot.data(options);
      return new ScanRecordModel({ id: snapshot.id, ...data });
    }
  };
}

export class ScanRepository {
  static getCollectionRef() {
    return collection(db, "scan_history").withConverter(ScanRecordModel.converter);
  }

  static async getCloudScans(userId: string): Promise<ScanRecord[]> {
    const q = query(
      this.getCollectionRef(),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    const firestoreHistory: ScanRecord[] = [];
    querySnapshot.forEach((doc) => {
      // Convert to POJO (Plain Object) to prevent React serialization errors
      firestoreHistory.push(doc.data().toJSON());
    });
    return firestoreHistory;
  }

  static async addCloudScan(userId: string, record: Omit<ScanRecord, "id" | "userId">): Promise<ScanRecord> {
    const tempModel = new ScanRecordModel({ id: "temp", ...record, userId });
    const docRef = await addDoc(this.getCollectionRef(), tempModel);
    tempModel.id = docRef.id;
    return tempModel.toJSON();
  }

  static async updateCloudScan(recordId: string, updates: Partial<ScanRecord>): Promise<void> {
    const docRef = doc(db, "scan_history", recordId);
    const safeUpdates = { ...updates };
    Object.keys(safeUpdates).forEach(key => (safeUpdates as any)[key] === undefined && delete (safeUpdates as any)[key]);
    await updateDoc(docRef, safeUpdates);
  }

  static getLocalScans(): ScanRecord[] {
    if (typeof window === 'undefined') return [];
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!localData) return [];
    try {
      const parsed = JSON.parse(localData) as any[];
      // Run local data through the class constructor to ensure defaults are populated
      return parsed.map(data => new ScanRecordModel(data).toJSON());
    } catch {
      return [];
    }
  }

  static addLocalScan(record: Omit<ScanRecord, "id" | "userId">, currentHistory: ScanRecord[]): ScanRecord {
    const newRecord = new ScanRecordModel({ ...record, id: Date.now().toString() }).toJSON();
    const newHistory = [newRecord, ...currentHistory];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
    return newRecord;
  }

  static updateLocalScan(recordId: string, updates: Partial<ScanRecord>, currentHistory: ScanRecord[]): void {
    const newHistory = currentHistory.map(record => {
      if (record.id === recordId) {
        return new ScanRecordModel({ ...record, ...updates, id: record.id }).toJSON();
      }
      return record;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
  }

  static async syncLocalToCloud(userId: string): Promise<void> {
    const localHistory = this.getLocalScans();
    if (localHistory.length === 0) return;

    const batch = writeBatch(db);
    localHistory.forEach((record) => {
      const docRef = doc(this.getCollectionRef());
      const model = new ScanRecordModel({ ...record, id: docRef.id, userId });
      batch.set(docRef, model);
    });
    
    await batch.commit();
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}
