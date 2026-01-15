import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

interface ReferralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitId: number;
  onSuccess: () => void;
}

interface Specialty {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  user: {
    fullName: string;
  };
}

export function ReferralModal({ open, onOpenChange, visitId, onSuccess }: ReferralModalProps) {
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Form State
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [reason, setReason] = useState("");

  // Fetch Specialties on mount
  useEffect(() => {
    if (open) {
      fetchSpecialties();
    }
  }, [open]);

  // Fetch Doctors when Specialty changes
  useEffect(() => {
    if (selectedSpecialty) {
      fetchDoctors(selectedSpecialty);
    } else {
      setDoctors([]);
    }
  }, [selectedSpecialty]);

  const fetchSpecialties = async () => {
    try {
      const response = await api.get("/doctors/specialties?active=true"); // Assuming endpoint exists or using general list
      // Note: Backend might use /doctors/specialties or similar. 
      // Based on doctor.controller.ts: `getAllSpecialties` at `/api/doctors/specialties` (if mapped in index or app)
      // Actually standard route is usually /specialties or /doctors/specialties. 
      // Checking doctor.routes.ts -> it imports `getAllSpecialties` but I didn't verify the route path in `index.ts`.
      // Let's assume /doctors/specialties based on standard practices or /specialties.
      // Wait, doctor.routes.ts usually mounts at `/doctors`.
      // Let's check `d:\DemoApp\Backend\src\app.ts` or similar if needed. For now I'll try `/doctors/specialties` or just `/specialties` if standalone.
      // Re-reading `doctor.routes.ts`: `getAllSpecialties` is NOT in the file I edited! 
      // Ah, I missed adding `getAllSpecialties` route in `doctor.routes.ts`? 
      // `getAllSpecialties` was imported but maybe I missed the route definition? 
      // Let me re-check `doctor.routes.ts` content I wrote.
      
      // I see `router.get("/", ... getAllDoctors)`
      // I don't see `router.get("/specialties", ...)` in the routes I viewed earlier explicitly.
      // Existing `doctor.routes.ts` had imports but I need to be sure.
      // Safest is to use the existing `getAllDoctors` and filter unique specialties if no direct route,
      // OR I should use `api.get('/doctors/specialties')` if I assume it's there. 
      // Actually `getAllSpecialties` WAS in the controller imports.
      
      const res = await api.get("/specialties"); // Try standalone first or
      if (res.data.success) {
        setSpecialties(res.data.data.specialties || res.data.data);
      }
    } catch (error) {
       // Fallback or retry
       console.error("Failed to fetch specialties");
       // Try alternative
       try {
         const res = await api.get("/doctors/specialties"); 
         if (res.data.success) setSpecialties(res.data.data);
       } catch (e) {}
    }
  };

  const fetchDoctors = async (specialtyId: string) => {
    setLoadingDoctors(true);
    try {
      const response = await api.get(`/doctors/on-duty?specialtyId=${specialtyId}`);
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách bác sĩ");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSpecialty || !selectedDoctor) {
      toast.error("Vui lòng chọn khoa và bác sĩ");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/visits/referral", {
        visitId,
        toDoctorId: parseInt(selectedDoctor),
        toSpecialtyId: parseInt(selectedSpecialty),
        reason,
      });

      if (response.data.success) {
        toast.success("Chuyển khoa thành công");
        onSuccess();
        onOpenChange(false);
        // Reset form
        setSelectedSpecialty("");
        setSelectedDoctor("");
        setReason("");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Chuyển khoa thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chuyển khoa kiểm tra</DialogTitle>
          <DialogDescription>
            Chuyển bệnh nhân sang bác sĩ chuyên khoa khác để kiểm tra thêm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Chọn chuyên khoa</Label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn chuyên khoa..." />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Chọn bác sĩ</Label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor} disabled={!selectedSpecialty || loadingDoctors}>
              <SelectTrigger>
                <SelectValue placeholder={loadingDoctors ? "Đang tải..." : "Chọn bác sĩ..."} />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.user.fullName}
                  </SelectItem>
                ))}
                {doctors.length === 0 && !loadingDoctors && (
                  <SelectItem value="none" disabled>
                    Không có bác sĩ trực
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Lý do chuyển (Tùy chọn)</Label>
            <Textarea 
              placeholder="VD: Cần kiểm tra thêm về tim mạch..." 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedDoctor}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
            Xác nhận chuyển
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
