import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DoctorSidebar from "@/components/sidebar/doctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Save,
  Plus,
  Trash2,
  Pill,
  FileText,
  Undo2,
  Heart,
  Activity,
  Search,
  Loader2,
} from "lucide-react";

// Interfaces
interface Medicine {
  id: number;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  unitPrice: number;
}

interface PatientData {
  id: number;
  fullName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  appointmentId?: number;
  visitId?: number;
  symptomInitial?: string;
}

interface DiagnosisData {
  primaryDiagnosis: string;
  note: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
  };
}

interface Medication {
  id: string;
  medicineId: number | null;
  name: string;
  quantity: number;
  dosageMorning: number;
  dosageNoon: number;
  dosageAfternoon: number;
  dosageEvening: number;
  instruction: string;
}

export default function PrescribeMed() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Data states
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [diagnosisData, setDiagnosisData] = useState<DiagnosisData | null>(
    null
  );
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingAppointment, setUpdatingAppointment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State cho danh sách thuốc Ä‘Æ°á»£c khám
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      medicineId: null,
      name: "",
      quantity: 0,
      dosageMorning: 0,
      dosageNoon: 0,
      dosageAfternoon: 0,
      dosageEvening: 0,
      instruction: "",
    },
  ]);

  // State cho ghi chÃƒÂº thÃƒÂªm
  const [additionalNotes, setAdditionalNotes] = useState("");

  // State cho tÃƒÂ¬m kiÃ¡ÂºÂ¿m thuÃ¡Â»â€˜c
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const [showSuggestions, setShowSuggestions] = useState<{
    [key: string]: boolean;
  }>({});

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);

        // Fetch medicines list
        const medicinesResponse = await api.get("/medicines");
        if (medicinesResponse.data.success) {
          setMedicines(medicinesResponse.data.data);
        }

        // Fetch patient data directly by appointment ID (similar to formMedical)
        const recordId = parseInt(id);

        // Try to fetch as visit first (if patient was checked in and examination was saved)
        try {
          const visitResponse = await api.get(`/visits/${recordId}`);
          if (visitResponse.data.success && visitResponse.data.data) {
            const visit = visitResponse.data.data;
            const appointment = visit.appointment || {};
            const patient = visit.patient || {};
            const patientUser = patient.user || {};

            if (patient) {
              setPatientData({
                id: patient.id,
                fullName: patientUser.fullName || patient.fullName || "Unknown",
                dateOfBirth: patient.dateOfBirth || "",
                gender: patient.gender || "MALE",
                phoneNumber: patient.phoneNumber || "",
                appointmentId: appointment.id || visit.appointmentId,
                visitId: visit.id,
                symptomInitial: appointment.symptomInitial,
              });

              // Parse diagnosis from visit note
              setDiagnosisData({
                primaryDiagnosis: visit.diagnosis || "Pending diagnosis",
                note:
                  visit.note ||
                  appointment.symptomInitial ||
                  "No symptoms reported",
                vitalSigns: {
                  bloodPressure: "120/80",
                  heartRate: "72",
                  temperature: "36.5",
                  weight: "70",
                },
              });
              setError(null);
              return;
            }
          }
        } catch (visitErr: any) {
          // Visit not found, try fetching as appointment
        }

        // If visit not found, fetch appointment by id directly
        const response = await api.get(`/appointments/${recordId}`);
        const appointment = response.data.data || response.data;

        if (appointment) {
          const patient = appointment.patient || appointment.Patient;
          const patientUser = patient?.user || patient?.User || {};

          if (patient) {
            console.log("Appointment data:", appointment);
            console.log("Visit data:", appointment.visit || appointment.Visit);
            const visitId = appointment.visit?.id || appointment.Visit?.id;
            console.log("Visit ID:", visitId);

            setPatientData({
              id: patient.id,
              fullName: patientUser.fullName || patient.fullName || "Unknown",
              dateOfBirth: patient.dateOfBirth || "",
              gender: patient.gender || "MALE",
              phoneNumber: patient.phoneNumber || "",
              appointmentId: appointment.id,
              visitId: visitId,
              symptomInitial: appointment.symptomInitial,
            });

            // Mock diagnosis data for now
            setDiagnosisData({
              primaryDiagnosis: "Pending diagnosis",
              note: appointment.symptomInitial || "No symptoms reported",
              vitalSigns: {
                bloodPressure: "120/80",
                heartRate: "72",
                temperature: "36.5",
                weight: "70",
              },
            });
            setError(null);
            return;
          }
        }

        // Neither visit nor appointment found
        toast.error(
          "KhÃ´ng tÃ¬m tháº¥y lá»‹ch háº¹n hoáº·c thÃ´ng tin khÃ¡m bá»‡nh"
        );
        setError("Appointment not found");
      } catch (err: any) {
        console.error("Error fetching data:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to load data";
        toast.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Láº¥y danh sÃ¡ch thuá»‘c theo tá»« khÃ³a tÃ¬m kiáº¿m
  const getFilteredMedicines = (searchTerm: string) => {
    if (!searchTerm) return [];
    return medicines
      .filter(
        (medicine) =>
          medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5); // Chá»‰ hiá»ƒn thá»‹ 5 káº¿t quáº£ Ä‘áº§u tiÃªn
  };

  // Chá»n thuá»‘c tá»« danh sÃ¡ch gá»£i Ã½
  const selectMedicine = (medicationId: string, medicine: Medicine) => {
    updateMedication(medicationId, "name", medicine.name);
    updateMedication(medicationId, "medicineId", medicine.id);
    setShowSuggestions((prev) => ({ ...prev, [medicationId]: false }));
    setSearchTerms((prev) => ({ ...prev, [medicationId]: medicine.name }));
  };

  // Add Medicine má»›i
  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      medicineId: null,
      name: "",
      quantity: 0,
      dosageMorning: 0,
      dosageNoon: 0,
      dosageAfternoon: 0,
      dosageEvening: 0,
      instruction: "",
    };
    setMedications([...medications, newMedication]);
  };

  // XÃ³a thuá»‘c
  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter((med) => med.id !== id));
    }
  };

  // Cáº­p nháº­t thÃ´ng tin thuá»‘c
  const updateMedication = (
    id: string,
    field: keyof Medication,
    value: string | number | null
  ) => {
    setMedications(
      medications.map((med) => {
        if (med.id === id) {
          const updatedMed = { ...med, [field]: value };

          // Tá»± Ä‘á»™ng tÃ­nh tá»•ng sá»‘ lÆ°á»£ng khi thay Ä‘á»•i dosage
          if (
            field === "dosageMorning" ||
            field === "dosageNoon" ||
            field === "dosageAfternoon" ||
            field === "dosageEvening"
          ) {
            const morning =
              field === "dosageMorning" ? (value as number) : med.dosageMorning;
            const afternoon =
              field === "dosageAfternoon"
                ? (value as number)
                : med.dosageAfternoon;
            const evening =
              field === "dosageEvening" ? (value as number) : med.dosageEvening;
            updatedMed.quantity = morning + afternoon + evening;
          }

          return updatedMed;
        }
        return med;
      })
    );

    // CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t search term khi thay Ã„â€˜Ã¡Â»â€¢i tÃƒÂªn thuÃ¡Â»â€˜c
    if (field === "name") {
      setSearchTerms((prev) => ({ ...prev, [id]: value as string }));
    }
  };

  // XÃ¡Â»Â­ lÃƒÂ½ thay Ã„â€˜Ã¡Â»â€¢i input tÃƒÂ¬m kiÃ¡ÂºÂ¿m thuÃ¡Â»â€˜c
  const handleMedicineSearch = (medicationId: string, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [medicationId]: value }));
    setShowSuggestions((prev) => ({
      ...prev,
      [medicationId]: value.length > 0,
    }));
    updateMedication(medicationId, "name", value);
    updateMedication(medicationId, "medicineId", null); // Reset medicine ID when typing
  };

  // LÃ†Â°u Ã„â€˜Ã†Â¡n thuÃ¡Â»â€˜c
  const handleSavePrescription = async () => {
    if (!patientData || !diagnosisData) return;

    try {
      setSaving(true);
      setError(null);

      // Form validation
      const validMedications = medications.filter(
        (med) => med.medicineId && med.quantity > 0
      );

      if (validMedications.length === 0) {
        toast.error(
          "Vui lÃƒÂ²ng thÃƒÂªm ÃƒÂ­t nhÃ¡ÂºÂ¥t mÃ¡Â»â„¢t loÃ¡ÂºÂ¡i thuÃ¡Â»â€˜c vÃƒÂ o Ã„â€˜Ã†Â¡n"
        );
        setError(
          "Vui lÃƒÂ²ng thÃƒÂªm ÃƒÂ­t nhÃ¡ÂºÂ¥t mÃ¡Â»â„¢t loÃ¡ÂºÂ¡i thuÃ¡Â»â€˜c vÃƒÂ o Ã„â€˜Ã†Â¡n"
        );
        return;
      }

      // Validate each medicine has at least one dosage > 0
      for (let i = 0; i < validMedications.length; i++) {
        const med = validMedications[i];
        const totalDosage =
          (med.dosageMorning || 0) +
          (med.dosageNoon || 0) +
          (med.dosageAfternoon || 0) +
          (med.dosageEvening || 0);

        if (totalDosage <= 0) {
          toast.error(
            `ThuÃ¡Â»â€˜c "${
              med.name || "thÃ¡Â»Â© " + (i + 1)
            }" phÃ¡ÂºÂ£i cÃƒÂ³ ÃƒÂ­t nhÃ¡ÂºÂ¥t mÃ¡Â»â„¢t liÃ¡Â»Âu dÃƒÂ¹ng lÃ¡Â»â€ºn hÃ†Â¡n 0`
          );
          setError(
            `ThuÃ¡Â»â€˜c "${
              med.name || "thÃ¡Â»Â© " + (i + 1)
            }" phÃ¡ÂºÂ£i cÃƒÂ³ ÃƒÂ­t nhÃ¡ÂºÂ¥t mÃ¡Â»â„¢t liÃ¡Â»Âu dÃƒÂ¹ng lÃ¡Â»â€ºn hÃ†Â¡n 0`
          );
          return;
        }

        if (!med.medicineId) {
          toast.error(
            `Vui lÃƒÂ²ng chÃ¡Â»Ân thuÃ¡Â»â€˜c cho dÃƒÂ²ng thÃ¡Â»Â© ${i + 1}`
          );
          setError(
            `Vui lÃƒÂ²ng chÃ¡Â»Ân thuÃ¡Â»â€˜c cho dÃƒÂ²ng thÃ¡Â»Â© ${i + 1}`
          );
          return;
        }
      }

      // Step 1: Get or create visitId
      let visitId = patientData.visitId;

      // If no visitId, check-in the appointment to create a visit
      if (!visitId && patientData.appointmentId) {
        try {
          const { checkInAppointment } = await import(
            "@/services/visit.service"
          );
          const visit = await checkInAppointment(patientData.appointmentId);
          visitId = visit.id;
          console.log("Visit created successfully:", visitId);
          toast.success("Ã„ÂÃƒÂ£ tÃ¡ÂºÂ¡o visit cho bÃ¡Â»â€¡nh nhÃƒÂ¢n");
        } catch (checkInError: any) {
          const errorMessage =
            checkInError.response?.data?.message ||
            "KhÃƒÂ´ng thÃ¡Â»Æ’ tÃ¡ÂºÂ¡o visit";
          console.error("Check-in error:", errorMessage);
          toast.error(errorMessage);
          setError(errorMessage);
          return;
        }
      }

      if (!visitId) {
        toast.error(
          "KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y visit ID vÃƒÂ  khÃƒÂ´ng cÃƒÂ³ appointment ID."
        );
        setError("KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y visit ID");
        return;
      }

      // Step 2: Complete visit with diagnosis
      try {
        const { completeVisit } = await import("@/services/visit.service");
        await completeVisit(visitId, {
          diagnosis: diagnosisData.primaryDiagnosis,
          note: diagnosisData.note,
          examinationFee: 100000,
        });
        console.log("Visit completed successfully");
      } catch (visitError: any) {
        // If visit already completed, that's OK, continue
        if (
          !visitError.response?.data?.message?.includes("already completed")
        ) {
          const errorMessage =
            visitError.response?.data?.message ||
            "KhÃƒÂ´ng thÃ¡Â»Æ’ hoÃƒÂ n thÃƒÂ nh visit";
          console.error("Visit completion error:", errorMessage);
          toast.error(errorMessage);
          setError(errorMessage);
          return;
        }
      }

      // Step 3: Save prescription with visitId
      const prescriptionData = {
        visitId: visitId,
        patientId: patientData.id,
        medicines: validMedications.map((med) => ({
          medicineId: med.medicineId,
          quantity: med.quantity,
          dosageMorning: med.dosageMorning || 0,
          dosageNoon: med.dosageNoon || 0,
          dosageAfternoon: med.dosageAfternoon || 0,
          dosageEvening: med.dosageEvening || 0,
          instruction:
            med.instruction ||
            "UÃ¡Â»â€˜ng theo chÃ¡Â»â€° dÃ¡ÂºÂ«n cÃ¡Â»Â§a bÃƒÂ¡c sÃ„Â©",
        })),
        note: additionalNotes,
      };

      console.log("Saving prescription:", prescriptionData);

      const response = await api.post("/prescriptions", prescriptionData);

      if (response.data.success) {
        console.log("Prescription saved successfully:", response.data);

        // Check if invoice was created
        const invoice = response.data.data?.invoice;
        if (invoice) {
          toast.success(
            `Đơn thuốc đã lưu! Hóa đơn ${
              invoice.invoiceCode
            } đã được tạo (${invoice.totalAmount.toLocaleString()} VNĐ). Bệnh nhân có thể thanh toán tại quầy.`,
            { duration: 5000 }
          );
          console.log("Invoice created:", invoice);
        } else {
          toast.success("Lưu đơn thuốc thành công!");
        }

        navigate("/doctor/medicalList");
        return;
      }
    } catch (err: any) {
      console.error("Error saving prescription:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to save prescription";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // HoÃƒÂ n tÃƒÂ¡c khÃƒÂ¡m (quay lÃ¡ÂºÂ¡i form khÃƒÂ¡m)
  const handleBackToExamination = async () => {
    if (!patientData?.appointmentId) {
      navigate(`/doctor/patients/${id}/examination`);
      return;
    }

    try {
      setUpdatingAppointment(true);

      // 1. LÃ†Â°u prescription trÃ†Â°Ã¡Â»â€ºc (nÃ¡ÂºÂ¿u cÃƒÂ³ thuÃ¡Â»â€˜c Ã„â€˜Ã†Â°Ã¡Â»Â£c kÃƒÂª)
      const validMedications = medications.filter(
        (med) => med.medicineId && med.quantity > 0
      );

      if (validMedications.length > 0) {
        // Get or create visitId (allow saving even after â€œhoÃ n tÃ¡c khÃ¡mâ€)
        let visitId = patientData.visitId;

        if (!visitId && patientData.appointmentId) {
          try {
            const { checkInAppointment } = await import(
              "@/services/visit.service"
            );
            const visit = await checkInAppointment(patientData.appointmentId);
            visitId = visit.id;
            toast.success("Visit created for patient");
          } catch (checkInError: any) {
            const errorMessage =
              checkInError.response?.data?.message || "Cannot create visit";
            console.error("Check-in error:", errorMessage);
            toast.error(errorMessage);
            navigate(`/doctor/patients/${id}/examination`);
            return;
          }
        }

        if (!visitId) {
          console.log("No visitId available, skipping prescription save");
          toast.info("ChÆ°a cÃ³ visit, khÃ´ng thá»ƒ lÆ°u Ä‘Æ¡n thuá»‘c");
          navigate(`/doctor/patients/${id}/examination`);
          return;
        }
        const prescriptionData = {
          visitId: visitId,
          patientId: patientData.id,
          medicines: validMedications.map((med) => ({
            medicineId: med.medicineId,
            quantity: med.quantity,
            dosageMorning: med.dosageMorning,
            dosageNoon: med.dosageNoon,
            dosageAfternoon: med.dosageAfternoon,
            dosageEvening: med.dosageEvening,
            instruction:
              med.instruction || "UÃ´ng theo chá»‰ dáº«n cá»§a bÃ¡c sÄ©",
          })),
          note: additionalNotes,
        };

        try {
          await api.post("/prescriptions", prescriptionData);
          console.log("Prescription saved successfully");
          toast.success("Đã lưu đơn thuốc thành công!");
        } catch (prescriptionError: any) {
          console.log(
            "Prescription save failed, continuing with navigation:",
            prescriptionError.response?.data?.message
          );
          toast.error(
            "Không thể lưu đơn thuốc: " +
              (prescriptionError.response?.data?.message ||
                "Lỗi không xác định")
          );
        }
      }

      // Vẫn điều hướng về trang khám bệnh dù có lỗi
      navigate(`/doctor/patients/${id}/examination`);
    } catch (error: any) {
      console.error("Error in handleBackToExamination:", error);
      // Vẫn điều hướng về trang khám bệnh dù có lỗi
      navigate(`/doctor/patients/${id}/examination`);
    } finally {
      setUpdatingAppointment(false);
    }
  };

  if (loading) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Loading prescription data...</p>
          </div>
        </div>
      </DoctorSidebar>
    );
  }

  if (error && !patientData) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Error loading data</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={() => navigate("/doctor/medicalList")}>
              Back to Medical List
            </Button>
          </div>
        </div>
      </DoctorSidebar>
    );
  }

  if (!patientData || !diagnosisData) {
    return null;
  }

  return (
    <DoctorSidebar>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4 -ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/doctor/medicalList")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách bệnh nhân
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Patient Info Header */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {patientData.fullName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {patientData.fullName}
                  </h1>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      ID: #{patientData.appointmentId}
                    </span>
                    <span>{calculateAge(patientData.dateOfBirth)} tuổi</span>
                    <span>{patientData.gender === "MALE" ? "Nam" : "Nữ"}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    <div>SÃ„ÂT: {patientData.phoneNumber}</div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-600">Ngày khám</div>
                <div className="font-semibold text-slate-900">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              <CardTitle className="text-xl">Chẩn đoán</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Diagnosis Details */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">
                    Chẩn đoán chính
                  </Label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-slate-900">
                      {diagnosisData.primaryDiagnosis}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-600">
                    Triệu chứng & Ghi chú
                  </Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <div className="text-slate-900">{diagnosisData.note}</div>
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <Label className="text-sm font-medium text-slate-600">
                    Chỉ số sinh hiệu
                  </Label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-slate-600 mb-1">Huyết áp</div>
                    <div className="text-lg font-bold text-slate-900">
                      {diagnosisData.vitalSigns.bloodPressure}
                    </div>
                    <div className="text-xs text-slate-500">mmHg</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xs text-slate-600 mb-1">Nhịp tim</div>
                    <div className="text-lg font-bold text-slate-900">
                      {diagnosisData.vitalSigns.heartRate}
                    </div>
                    <div className="text-xs text-slate-500">bpm</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-xs text-slate-600 mb-1">Nhiệt độ</div>
                    <div className="text-lg font-bold text-slate-900">
                      {diagnosisData.vitalSigns.temperature}
                    </div>
                    <div className="text-xs text-slate-500">°C</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xs text-slate-600 mb-1">Cân nặng</div>
                    <div className="text-lg font-bold text-slate-900">
                      {diagnosisData.vitalSigns.weight}
                    </div>
                    <div className="text-xs text-slate-500">kg</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prescription Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-xl">Kê đơn Thuốc</CardTitle>
            </div>
            <Button
              onClick={addMedication}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm thuốc
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-slate-700 w-12">
                      STT
                    </th>
                    <th className="text-left p-3 font-semibold text-slate-700">
                      Tên thuốc
                    </th>
                    <th className="text-left p-3 font-semibold text-slate-700 w-24">
                      Tương SL
                    </th>
                    <th className="text-left p-3 font-semibold text-slate-700 w-20">
                      Sáng
                    </th>
                    <th className="text-left p-3 font-semibold text-slate-700 w-20">
                      Trưa
                    </th>
                    <th className="text-left p-3 font-semibold text-slate-700 w-20">
                      Tối
                    </th>
                    <th className="text-left p-3 font-semibold text-slate-700">
                      Ghi chú
                    </th>
                    <th className="text-left p-3 font-semibold text-slate-700 w-16">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((medication, index) => (
                    <tr
                      key={medication.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-3 text-center font-medium text-slate-600">
                        {index + 1}
                      </td>
                      <td className="p-3">
                        <div className="relative">
                          <div className="relative">
                            <Input
                              placeholder="Tìm kiếm thuốc..."
                              value={
                                searchTerms[medication.id] || medication.name
                              }
                              onChange={(e) =>
                                handleMedicineSearch(
                                  medication.id,
                                  e.target.value
                                )
                              }
                              onFocus={() =>
                                setShowSuggestions((prev) => ({
                                  ...prev,
                                  [medication.id]:
                                    (
                                      searchTerms[medication.id] ||
                                      medication.name
                                    ).length > 0,
                                }))
                              }
                              className="border-gray-300 focus:border-blue-500 pr-8"
                            />
                            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>

                          {/* Dropdown gÃ¡Â»Â£i ÃƒÂ½ thuÃ¡Â»â€˜c */}
                          {showSuggestions[medication.id] && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                              {getFilteredMedicines(
                                searchTerms[medication.id] || medication.name
                              ).map((medicine) => (
                                <div
                                  key={medicine.id}
                                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() =>
                                    selectMedicine(medication.id, medicine)
                                  }
                                >
                                  <div className="font-medium text-slate-900">
                                    {medicine.name}
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    {medicine.category} Ã¢â‚¬Â¢ {medicine.unit}{" "}
                                    Ã¢â‚¬Â¢ Stock: {medicine.currentStock}
                                  </div>
                                </div>
                              ))}
                              {getFilteredMedicines(
                                searchTerms[medication.id] || medication.name
                              ).length === 0 && (
                                <div className="p-3 text-gray-500 text-center">
                                  KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y thuÃ¡Â»â€˜c phÃƒÂ¹
                                  hÃ¡Â»Â£p
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          placeholder="0"
                          value={medication.quantity || ""}
                          className="border-gray-300 bg-gray-50 text-center font-semibold text-blue-600"
                          readOnly
                          title="TÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng tÃƒÂ­nh tÃ¡Â»Â« tÃ¡Â»â€¢ng cÃƒÂ¡c liÃ¡Â»Âu"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={medication.dosageMorning || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            if (value >= 0) {
                              updateMedication(
                                medication.id,
                                "dosageMorning",
                                value
                              );
                            }
                          }}
                          className="border-gray-300 focus:border-blue-500 text-center"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={medication.dosageAfternoon || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            if (value >= 0) {
                              updateMedication(
                                medication.id,
                                "dosageAfternoon",
                                value
                              );
                            }
                          }}
                          className="border-gray-300 focus:border-blue-500 text-center"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={medication.dosageEvening || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            if (value >= 0) {
                              updateMedication(
                                medication.id,
                                "dosageEvening",
                                value
                              );
                            }
                          }}
                          className="border-gray-300 focus:border-blue-500 text-center"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          placeholder="Ghi chÃƒÂº..."
                          value={medication.instruction}
                          onChange={(e) =>
                            updateMedication(
                              medication.id,
                              "instruction",
                              e.target.value
                            )
                          }
                          className="border-gray-300 focus:border-blue-500"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedication(medication.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          disabled={medications.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-xl">Ghi ChÃƒÂº ThÃƒÂªm</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="NhÃ¡ÂºÂ­p ghi chÃƒÂº thÃƒÂªm vÃ¡Â»Â cÃƒÂ¡ch sÃ¡Â»Â­ dÃ¡Â»Â¥ng thuÃ¡Â»â€˜c, lÃ†Â°u ÃƒÂ½ Ã„â€˜Ã¡ÂºÂ·c biÃ¡Â»â€¡t..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={4}
              className="resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="text-xs text-slate-500 mt-1">
              {additionalNotes.length}/500 kÃƒÂ½ tÃ¡Â»Â±
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="text-sm text-slate-600 text-right">
            <span className="text-orange-600">Ã°Å¸â€™Â¡ LÃ†Â°u ÃƒÂ½:</span>{" "}
            NÃƒÂºt "HoÃƒÂ n tÃƒÂ¡c khÃƒÂ¡m" sÃ¡ÂºÂ½ tÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng
            lÃ†Â°u Ã„â€˜Ã†Â¡n thuÃ¡Â»â€˜c (nÃ¡ÂºÂ¿u cÃƒÂ³) vÃƒÂ  hoÃƒÂ n
            tÃ¡ÂºÂ¥t lÃ¡Â»â€¹ch khÃƒÂ¡m
          </div>
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={handleBackToExamination}
              disabled={updatingAppointment}
              className="flex items-center gap-2 border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              {updatingAppointment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ã„Âang lÃ†Â°u & hoÃƒÂ n tÃƒÂ¡c...
                </>
              ) : (
                <>
                  <Undo2 className="w-4 h-4" />
                  HoÃƒÂ n tÃƒÂ¡c khÃƒÂ¡m
                </>
              )}
            </Button>

            <Button
              onClick={handleSavePrescription}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ã„Âang lÃ†Â°u...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  LÃ†Â°u Ã„â€˜Ã†Â¡n thuÃ¡Â»â€˜c
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DoctorSidebar>
  );
}
