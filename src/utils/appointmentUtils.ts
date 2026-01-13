/**
 * Calculate estimated time for an appointment based on shift start time and slot number
 * @param shiftStartTime HH:mm:ss
 * @param slotNumber 1-indexed
 * @returns HH:mm
 */
export function calculateEstimatedTime(shiftStartTime: string, slotNumber: number): string {
    const [hours, minutes] = shiftStartTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + (slotNumber - 1) * 10);
    
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
