import { db } from "@/config/firebase";
import { doc, getDoc, setDoc, updateDoc, increment, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, DocumentData } from "firebase/firestore";

const GUEST_QUOTA_KEY = "freshscan_guest_quota";

export class UserQuota {
  constructor(
    public last_scan_date: string,
    public scan_count: number
  ) {}

  toJSON() {
    return {
      last_scan_date: this.last_scan_date,
      scan_count: this.scan_count
    };
  }

  static converter: FirestoreDataConverter<UserQuota> = {
    toFirestore: (quota: UserQuota): DocumentData => ({
      last_scan_date: quota.last_scan_date,
      scan_count: quota.scan_count
    }),
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): UserQuota => {
      const data = snapshot.data(options);
      return new UserQuota(data.last_scan_date || "", data.scan_count || 0);
    }
  };
}

export class UserRepository {
  static getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  static async getCloudQuota(userId: string): Promise<UserQuota> {
    const docRef = doc(db, "users", userId).withConverter(UserQuota.converter);
    const snap = await getDoc(docRef);
    const today = this.getTodayDateString();

    if (snap.exists()) {
      const quota = snap.data();
      if (quota.last_scan_date === today) {
        return quota; // Returns the class instance
      }
    }
    // Return fresh quota if no doc or new day
    return new UserQuota(today, 0);
  }

  static async incrementCloudQuota(userId: string): Promise<void> {
    const docRef = doc(db, "users", userId).withConverter(UserQuota.converter);
    const snap = await getDoc(docRef);
    const today = this.getTodayDateString();

    if (snap.exists() && snap.data().last_scan_date === today) {
      await updateDoc(docRef, { scan_count: increment(1) });
    } else {
      await setDoc(docRef, new UserQuota(today, 1), { merge: true });
    }
  }

  static getLocalQuota(): UserQuota {
    if (typeof window === 'undefined') return new UserQuota(this.getTodayDateString(), 0);
    const today = this.getTodayDateString();
    const data = localStorage.getItem(GUEST_QUOTA_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.last_scan_date === today) {
          return new UserQuota(parsed.last_scan_date, parsed.scan_count || 0);
        }
      } catch {
        // Ignored, just fallback
      }
    }
    return new UserQuota(today, 0);
  }

  static incrementLocalQuota(): void {
    const current = this.getLocalQuota();
    current.scan_count += 1;
    localStorage.setItem(GUEST_QUOTA_KEY, JSON.stringify(current.toJSON()));
  }
}
