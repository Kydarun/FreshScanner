export class DateFormatter {
  /**
   * Formats a timestamp into YYYY-MM-DD hh:mm aa
   * Example: 2026-05-18 01:23 PM
   */
  static formatDateTime(timestamp: number): string {
    const d = new Date(timestamp);
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const aa = h >= 12 ? 'PM' : 'AM';
    
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    const hh = String(h).padStart(2, '0');
    
    return `${yyyy}-${MM}-${dd} ${hh}:${m} ${aa}`;
  }

  /**
   * Formats a timestamp into YYYY-MM-DD
   * Example: 2026-05-18
   */
  static formatDate(timestamp: number): string {
    const d = new Date(timestamp);
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd}`;
  }
}
