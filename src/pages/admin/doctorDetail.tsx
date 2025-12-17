import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import AdminSidebar from '@/components/sidebar/admin';
import { 
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Save,
  X,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

// Doctor data - trong thực tế sẽ fetch từ API
const doctorsData = [
  {
    id: "1",
    name: "Dr. Nguyen A",
    specialty: "Cardiology",
    doctorId: "D-738491",
    experience: "12 Years",
    status: "Active",
    avatar: "NA",
    dateOfBirth: "1984/02/08",
    gender: "Male",
    email: "nguyena@email.com",
    phone: "+84 123 456 789",
    address: "123 Medical Center Dr, Suite 400, New York, NY",
  },
  {
    id: "2", 
    name: "Dr. Vu B",
    specialty: "Pediatrics",
    doctorId: "D-629502",
    experience: "8 Years",
    status: "Active",
    avatar: "VB",
    dateOfBirth: "1985/03/07",
    gender: "Female",
    email: "vub@email.com",
    phone: "+84 234 567 891",
    address: "456 Health Plaza, Suite 200, Boston, MA",
  },
  {
    id: "3",
    name: "Dr. Tran C",
    specialty: "Neurology", 
    doctorId: "D-847261",
    experience: "15 Years",
    status: "On Leave",
    avatar: "TC",
    dateOfBirth: "1978/09/08",
    gender: "Male",
    email: "tranc@email.com",
    phone: "+84 345 678 912",
    address: "789 Brain Institute, Suite 300, Chicago, IL",
  },
  {
    id: "4",
    name: "Dr. Ngo D",
    specialty: "Dermatology",
    doctorId: "D-391047",
    experience: "5 Years", 
    status: "Active",
    avatar: "ND",
    dateOfBirth: "1988/05/05",
    gender: "Female",
    email: "ngod@email.com",
    phone: "+84 456 789 123",
    address: "321 Skin Care Center, Suite 150, Miami, FL",
  },
  {
    id: "5",
    name: "Dr. Chu E",
    specialty: "Orthopedics",
    doctorId: "D-510283",
    experience: "20 Years",
    avatar: "CE",
    dateOfBirth: "1973/11/10",
    gender: "Male",
    email: "chue@email.com",
    phone: "+84 567 891 234",
    address: "654 Bone & Joint Clinic, Suite 400, Los Angeles, CA",
  }
];

export default function DoctorDetail() {
  const { id } = useParams();
  
  // Tìm doctor theo ID
  const doctor = doctorsData.find(d => d.id === id);
  
  // Edit states
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  
  // Avatar states
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [personalForm, setPersonalForm] = useState({
    dateOfBirth: doctor?.dateOfBirth || "",
    gender: doctor?.gender || "",
    experience: doctor?.experience || ""
  });
  
  const [contactForm, setContactForm] = useState({
    email: doctor?.email || "",
    phone: doctor?.phone || "",
    address: doctor?.address || ""
  });
  
  // Handlers
  const handlePersonalEdit = () => {
    setEditingPersonal(true);
    setPersonalForm({
      dateOfBirth: doctor?.dateOfBirth || "",
      gender: doctor?.gender || "",
      experience: doctor?.experience || ""
    });
  };

  const handlePersonalSave = () => {
    // Trong thực tế sẽ gọi API để update
    console.log("Saving personal info:", personalForm);
    setEditingPersonal(false);
  };

  const handlePersonalCancel = () => {
    setEditingPersonal(false);
    setPersonalForm({
      dateOfBirth: doctor?.dateOfBirth || "",
      gender: doctor?.gender || "",
      experience: doctor?.experience || ""
    });
  };

  // Contact handlers
  const handleContactEdit = () => {
    setEditingContact(true);
    setContactForm({
      email: doctor?.email || "",
      phone: doctor?.phone || "",
      address: doctor?.address || ""
    });
  };

  const handleContactSave = () => {
    // Trong thực tế sẽ gọi API để update
    console.log("Saving contact info:", contactForm);
    setEditingContact(false);
  };

  const handleContactCancel = () => {
    setEditingContact(false);
    setContactForm({
      email: doctor?.email || "",
      phone: doctor?.phone || "",
      address: doctor?.address || ""
    });
  };

  // Avatar handlers
  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Kiểm tra file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh');
        return;
      }
      
      // Kiểm tra file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
        return;
      }

      // Tạo preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Trong thực tế sẽ upload file lên server
      console.log('Uploading avatar:', file);
    }
  };

  
  // Nếu không tìm thấy doctor
  if (!doctor) {
    return (
      <AdminSidebar>
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Doctor Not Found</h1>
            <Link to="/admin/doctors" className="text-blue-600 hover:underline">
              Back to Doctor List
            </Link>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  const getAvatarColor = (avatar: string) => {
    const colors = {
      "NA": "from-blue-500 to-blue-600",
      "VB": "from-purple-500 to-purple-600", 
      "TC": "from-orange-500 to-orange-600",
      "ND": "from-green-500 to-green-600",
      "CE": "from-gray-500 to-gray-600"
    }
    return colors[avatar as keyof typeof colors] || "from-blue-500 to-blue-600"
  }

  return (
    <AdminSidebar>
      <div className="p-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/admin/doctors" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Doctor List</span>
          </Link>
        </div>

        {/* Doctor Profile Header */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={doctor.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getAvatarColor(doctor.avatar)} flex items-center justify-center text-white font-bold text-2xl`}>
                      {doctor.avatar}
                    </div>
                  )}
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Doctor Info */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
                  </div>
                  <p className="text-lg text-gray-600 mb-3">{doctor.specialty} Specialist</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAvatarUpload}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Avatar
                </Button>
                <Button variant="outline" className="border-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Schedule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button className="border-b-2 border-blue-500 text-blue-600 py-2 px-1 text-sm font-medium">
                Overview
              </button>
              <button className="text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
                Schedule
              </button>
            </nav>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Personal Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded"></div>
                  Personal Information
                </CardTitle>
                {!editingPersonal ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={handlePersonalEdit}
                  >
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-green-600 hover:text-green-800"
                      onClick={handlePersonalSave}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-gray-800"
                      onClick={handlePersonalCancel}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {!editingPersonal ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">DATE OF BIRTH</label>
                      <p className="text-gray-900 font-medium mt-1">{doctor.dateOfBirth}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">GENDER</label>
                      <p className="text-gray-900 font-medium mt-1">{doctor.gender}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">EXPERIENCE</label>
                      <p className="text-gray-900 font-medium mt-1">{doctor.experience}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-500 uppercase tracking-wide">DATE OF BIRTH</Label>
                      <Input
                        id="dateOfBirth"
                        value={personalForm.dateOfBirth}
                        onChange={(e) => setPersonalForm({...personalForm, dateOfBirth: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="gender" className="text-sm font-medium text-gray-500 uppercase tracking-wide">GENDER</Label>
                      <select
                        id="gender"
                        value={personalForm.gender}
                        onChange={(e) => setPersonalForm({...personalForm, gender: e.target.value})}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="experience" className="text-sm font-medium text-gray-500 uppercase tracking-wide">EXPERIENCE</Label>
                      <Input
                        id="experience"
                        value={personalForm.experience}
                        onChange={(e) => setPersonalForm({...personalForm, experience: e.target.value})}
                        placeholder="e.g., 12 Years"
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact Details */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded"></div>
                  Contact Details
                </CardTitle>
                {!editingContact ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={handleContactEdit}
                  >
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-green-600 hover:text-green-800"
                      onClick={handleContactSave}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-gray-800"
                      onClick={handleContactCancel}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {!editingContact ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">EMAIL ADDRESS</label>
                        <p className="text-gray-900 font-medium">{doctor.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">PHONE NUMBER</label>
                        <p className="text-gray-900 font-medium">{doctor.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">OFFICE ADDRESS</label>
                        <p className="text-gray-900 font-medium">{doctor.address}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-500 uppercase tracking-wide">EMAIL ADDRESS</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <Input
                          id="email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          placeholder="doctor@email.com"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-500 uppercase tracking-wide">PHONE NUMBER</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Phone className="h-5 w-5 text-blue-600" />
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                          placeholder="+84 123 456 789"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-sm font-medium text-gray-500 uppercase tracking-wide">OFFICE ADDRESS</Label>
                      <div className="flex items-start gap-3 mt-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <Input
                          id="address"
                          value={contactForm.address}
                          onChange={(e) => setContactForm({...contactForm, address: e.target.value})}
                          placeholder="123 Medical Center Dr, Suite 400, City, State"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            

            {/* Duty Schedule */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded"></div>
                  Duty Schedule
                </CardTitle>
                <span className="text-sm text-blue-600 font-medium">THIS WEEK</span>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">Today (Wed)</span>
                  </div>
                  <span className="text-sm text-gray-600">08:00 - 16:00</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="font-medium text-gray-900">Thu, Oct 24</span>
                  </div>
                  <span className="text-sm text-gray-600">10:00 - 18:00</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="font-medium text-gray-900">Fri, Oct 25</span>
                  </div>
                  <span className="text-sm text-gray-600">08:00 - 16:00</span>
                </div>

                <Button variant="outline" className="w-full mt-4 text-blue-600 border-blue-200 hover:bg-blue-50">
                  View Full Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}