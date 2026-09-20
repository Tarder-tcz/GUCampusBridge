import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForum } from '../context/ForumContext';
import { api } from '../services/api';
import { DEFAULT_AVATAR } from '../data/mockData';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { RightPanel } from '../components/layout/RightPanel';
import { CreatePostModal } from '../components/forum/CreatePostModal';
import { NotificationDrawer } from '../components/notifications/NotificationDrawer';
import { AuthModal } from '../components/auth/AuthModal';
import { StaffPortalModal } from '../components/mentorship/StaffPortalModal';
import {
  UserCheck,
  Building2,
  Phone,
  Search,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  Send,
  Sparkles,
  Clock,
  MessageSquare,
  AlertCircle,
  Check,
  FileText,
  User,
  ExternalLink,
  RotateCcw,
  BadgeCheck,
  Calendar,
  Layers,
  HelpCircle,
  Briefcase
} from 'lucide-react';

const DEPARTMENTS = [
  'All Departments',
  'School of Computer Science & Engineering (SCSE)',
  'School of Engineering (SOE)',
  'School of Business (SOB)',
  'Placements & Corporate Relations',
  'Exam Cell & Academic Counseling',
  'School of Law (SOL)',
  'School of Medical & Allied Sciences (SMAS)'
];



export const MentorConnectPage = () => {
  const { userState } = useForum();
  const navigate = useNavigate();

  // Step state: 1 (Student details), 2 (Mentor selection), 3 (Review), 4 (Success confirmation)
  const [step, setStep] = useState(1);

  // Form State
  const [studentName, setStudentName] = useState(userState?.name || '');
  const [admissionNo, setAdmissionNo] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [studentDept, setStudentDept] = useState('School of Computer Science & Engineering (SCSE)');
  const [academicYear, setAcademicYear] = useState('3rd Year');
  const [contactPreference, setContactPreference] = useState('WhatsApp / Phone Call');
  const [reason, setReason] = useState('');

  // Mentor Selection State
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All Departments');
  const [mentorSearch, setMentorSearch] = useState('');
  const [mentorsList, setMentorsList] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);

  // Status & submission
  const [loading, setLoading] = useState(false);
  const [fetchingMentors, setFetchingMentors] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Pre-fill student name and department if logged in
  useEffect(() => {
    if (userState && !userState.isGuest) {
      if (!studentName && userState.name) setStudentName(userState.name);
      if (userState.department) {
        const matched = DEPARTMENTS.find(d => d.toLowerCase().includes(userState.department.toLowerCase()));
        if (matched) setStudentDept(matched);
      }
    }
  }, [userState]);

  // Fetch Mentors List from backend
  useEffect(() => {
    let isMounted = true;
    async function fetchMentors() {
      try {
        setFetchingMentors(true);
        const data = await api.getMentors('all');
        if (isMounted) {
          if (Array.isArray(data)) {
            setMentorsList(data);
          } else {
            setMentorsList([]);
          }
        }
      } catch (err) {
        console.warn('Failed to load mentors from API:', err);
        if (isMounted) {
          setMentorsList([]);
        }
      } finally {
        if (isMounted) setFetchingMentors(false);
      }
    }

    fetchMentors();
    return () => { isMounted = false; };
  }, []);

  // Filtered Mentors list
  const filteredMentors = mentorsList.filter(m => {
    let matchesDept = selectedDeptFilter === 'All Departments';
    if (!matchesDept && m.department) {
      const deptLower = m.department.toLowerCase();
      if (selectedDeptFilter.includes('SCSE') || selectedDeptFilter.includes('Computer')) {
        matchesDept = deptLower.includes('scse') || deptLower.includes('computer');
      } else if (selectedDeptFilter.includes('SOE') || selectedDeptFilter.includes('Engineering')) {
        matchesDept = (deptLower.includes('soe') || deptLower.includes('engineering')) && !deptLower.includes('computer');
      } else if (selectedDeptFilter.includes('SOB') || selectedDeptFilter.includes('Business')) {
        matchesDept = deptLower.includes('sob') || deptLower.includes('business');
      } else if (selectedDeptFilter.includes('Placement')) {
        matchesDept = deptLower.includes('placement');
      } else if (selectedDeptFilter.includes('Exam')) {
        matchesDept = deptLower.includes('exam');
      } else {
        matchesDept = deptLower.includes(selectedDeptFilter.toLowerCase());
      }
    }
    
    const term = mentorSearch.toLowerCase().trim();
    const matchesSearch = !term ||
      (m.name && m.name.toLowerCase().includes(term)) ||
      (m.role && m.role.toLowerCase().includes(term)) ||
      (m.department && m.department.toLowerCase().includes(term)) ||
      (m.bio && m.bio.toLowerCase().includes(term));

    return matchesDept && matchesSearch;
  });

  // Step 1 Validation & Proceed
  const handleStep1Next = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentName.trim()) {
      setErrorMsg('Please enter your full student name.');
      return;
    }
    if (!admissionNo.trim()) {
      setErrorMsg('Please enter your university admission number.');
      return;
    }
    if (!contactNo.trim()) {
      setErrorMsg('Please provide a valid contact number (Phone/WhatsApp) so the faculty member can reach you.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Please specify the reason or topic of discussion for contacting the mentor.');
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(2);
  };

  // Step 2 Validation & Proceed
  const handleStep2Next = () => {
    setErrorMsg('');
    if (!selectedMentor) {
      setErrorMsg('Please select a faculty mentor from the list below before continuing.');
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(3);
  };

  // Step 3: Final Submit Request
  const handleSubmitRequest = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      const fullReasonWithMeta = `[Year: ${academicYear} | Preferred Mode: ${contactPreference}]\n\n${reason}`;

      const res = await api.submitMentorshipRequest({
        admissionNo: admissionNo.trim(),
        studentName: studentName.trim(),
        contactNo: contactNo.trim(),
        studentDepartment: studentDept,
        reason: fullReasonWithMeta,
        mentorId: selectedMentor.id
      });

      setSubmittedRequest(res.request || {
        id: `REQ-${Date.now().toString().slice(-6)}`,
        mentorName: selectedMentor.name,
        createdAt: new Date().toISOString()
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(4);
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || 'Failed to submit mentorship request. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form to book another session
  const handleReset = () => {
    setStep(1);
    setSelectedMentor(null);
    setReason('');
    setSubmittedRequest(null);
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Copy tracking ID
  const handleCopyId = () => {
    if (submittedRequest?.id) {
      navigator.clipboard.writeText(submittedRequest.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col site-gradient-bg text-slate-100 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Content Area */}
        <section className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Navigation & Breadcrumb Header */}
          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/[0.08] shadow-md flex items-center justify-between gap-4 flex-wrap">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] px-3 py-1.5 rounded-xl transition-all haptic-btn cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-rose-400" />
              <span>Back to Campus Feed</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Faculty Advisory</span>
              </span>
              <span className="text-slate-500 text-xs hidden sm:inline">•</span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Confidential & Secure
              </span>
            </div>
          </div>

          {/* Hero Banner with Radial Glow */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-60 h-60 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 -bottom-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>1-on-1 Student-Mentor Connect</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Connect Directly with Galgotias Faculty & Mentors
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/80 mt-2 leading-relaxed">
                Schedule private consultations for research papers, semester CAT exam prep, capstone guidance, placement interview strategies, or academic counseling.
              </p>
            </div>

            {/* Interactive Step-by-Step Progress Indicator */}
            {step < 4 && (
              <div className="mt-8 pt-6 border-t border-white/[0.07] relative z-10">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
                  
                  {/* Step 1 Indicator */}
                  <div
                    onClick={() => step > 1 && setStep(1)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      step === 1
                        ? 'bg-rose-500/15 border-rose-500/40 text-white shadow-lg shadow-rose-950/30'
                        : step > 1
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-200 cursor-pointer hover:bg-emerald-500/15'
                        : 'bg-slate-950/40 border-white/[0.05] text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform ${
                        step === 1
                          ? 'bg-rose-500 text-white scale-105'
                          : step > 1
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Step 1</div>
                      <div className="text-xs font-bold truncate">Student Details</div>
                    </div>
                  </div>

                  {/* Step 2 Indicator */}
                  <div
                    onClick={() => step > 2 && setStep(2)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      step === 2
                        ? 'bg-rose-500/15 border-rose-500/40 text-white shadow-lg shadow-rose-950/30'
                        : step > 2
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-200 cursor-pointer hover:bg-emerald-500/15'
                        : 'bg-slate-950/40 border-white/[0.05] text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform ${
                        step === 2
                          ? 'bg-rose-500 text-white scale-105'
                          : step > 2
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Step 2</div>
                      <div className="text-xs font-bold truncate">Choose Mentor</div>
                    </div>
                  </div>

                  {/* Step 3 Indicator */}
                  <div
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      step === 3
                        ? 'bg-rose-500/15 border-rose-500/40 text-white shadow-lg shadow-rose-950/30'
                        : 'bg-slate-950/40 border-white/[0.05] text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform ${
                        step === 3
                          ? 'bg-rose-500 text-white scale-105'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      3
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Step 3</div>
                      <div className="text-xs font-bold truncate">Review & Submit</div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Error Message Toast */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-3 shadow-lg animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="flex-1">{errorMsg}</div>
              <button
                onClick={() => setErrorMsg('')}
                className="text-rose-400 hover:text-white text-xs underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: Student Information Form */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative">
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.07] mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-rose-400" />
                    <span>Step 1: Enter Your Student Information</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Provide your verified Galgotias student credentials so your advisory request can be officially processed.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                  Required Details
                </span>
              </div>

              <form onSubmit={handleStep1Next} className="space-y-5">
                
                {/* Row 1: Full Name & Admission Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Full Student Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Aryan Sharma"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 transition-all"
                        required
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">As registered in university records</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Admission Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={admissionNo}
                        onChange={(e) => setAdmissionNo(e.target.value.toUpperCase())}
                        placeholder="e.g. 21SCSE1010482"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono uppercase text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 transition-all"
                        required
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Format: 21SCSE101XXXX or official roll ID</span>
                  </div>
                </div>

                {/* Row 2: Contact Number & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Contact Number (WhatsApp/Mobile) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="tel"
                        value={contactNo}
                        onChange={(e) => setContactNo(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 transition-all"
                        required
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Mentor will use this to contact or reply</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Your Department / School <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <select
                        value={studentDept}
                        onChange={(e) => setStudentDept(e.target.value)}
                        className="w-full bg-slate-950/90 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500/60 cursor-pointer transition-all"
                      >
                        {DEPARTMENTS.filter(d => d !== 'All Departments').map(dept => (
                          <option key={dept} value={dept} className="bg-slate-900 text-slate-100 py-1">
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Your enrolled branch or faculty unit</span>
                  </div>
                </div>

                {/* Row 3: Academic Year & Preferred Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Academic Year / Standing
                    </label>
                    <div className="relative flex items-center">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-full bg-slate-950/90 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500/60 cursor-pointer transition-all"
                      >
                        <option value="1st Year (Fresher)" className="bg-slate-900">1st Year (Fresher)</option>
                        <option value="2nd Year (Sophomore)" className="bg-slate-900">2nd Year (Sophomore)</option>
                        <option value="3rd Year (Pre-Final)" className="bg-slate-900">3rd Year (Pre-Final)</option>
                        <option value="4th Year (Final Year)" className="bg-slate-900">4th Year (Final Year)</option>
                        <option value="Postgraduate / Master's" className="bg-slate-900">Postgraduate / Master's</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Preferred Mode of Communication
                    </label>
                    <div className="relative flex items-center">
                      <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <select
                        value={contactPreference}
                        onChange={(e) => setContactPreference(e.target.value)}
                        className="w-full bg-slate-950/90 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500/60 cursor-pointer transition-all"
                      >
                        <option value="WhatsApp / Phone Call" className="bg-slate-900">WhatsApp / Phone Call</option>
                        <option value="In-Person Cabin Session (Faculty Office)" className="bg-slate-900">In-Person Cabin Session (Faculty Office)</option>
                        <option value="Official College Email / Video Link" className="bg-slate-900">Official College Email / Video Link</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Row 4: Reason / Consultation Topic */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Reason for Contacting Mentor <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows="4"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe your academic questions, capstone/mini-project doubts, research paper review, placement interview prep, or personal counseling need..."
                    className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 transition-all leading-relaxed"
                    required
                  />
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                    <span>Be specific to help the faculty member prepare prior to your meeting.</span>
                    <span className="font-mono">{reason.length} chars</span>
                  </div>
                </div>

                {/* Step 1 Actions */}
                <div className="pt-4 border-t border-white/[0.07] flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>All student queries remain strictly confidential.</span>
                  </div>

                  <button
                    type="submit"
                    className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2.5 shadow-lg shadow-rose-950/40 border border-rose-400/30 transition-all cursor-pointer haptic-btn ml-auto"
                  >
                    <span>Proceed to Step 2: Choose Mentor</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: Choose Mentor with Filter System */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative space-y-6">
              
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.07] flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-rose-400" />
                    <span>Step 2: Choose Your Mentor or Professor</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Select a verified professor, HOD, placement coordinator, or senior academic counselor for your 1-on-1 advisory.
                  </p>
                </div>
                
                {selectedMentor && (
                  <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    <span>Selected: <strong>{selectedMentor.name}</strong></span>
                  </div>
                )}
              </div>

              {/* Filter Controls Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/[0.06]">
                {/* Department Dropdown Filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Filter by Faculty Department:</span>
                  </label>
                  <select
                    value={selectedDeptFilter}
                    onChange={(e) => setSelectedDeptFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500/60 cursor-pointer transition-all"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d} className="bg-slate-900 text-slate-100">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mentor Search Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-rose-400" />
                    <span>Search Mentor Name or Expertise:</span>
                  </label>
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={mentorSearch}
                      onChange={(e) => setMentorSearch(e.target.value)}
                      placeholder="e.g. Aniket, SCSE, Algorithms, Placement..."
                      className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/60 transition-all"
                    />
                    {mentorSearch && (
                      <button
                        onClick={() => setMentorSearch('')}
                        className="absolute right-3 text-xs text-slate-400 hover:text-white cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Department Filter Quick Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                  Quick Depts:
                </span>
                {['All Departments', 'SCSE', 'SOE', 'SOB', 'Placements'].map(shortDept => {
                  const isMatching = shortDept === 'All Departments'
                    ? selectedDeptFilter === 'All Departments'
                    : selectedDeptFilter.includes(shortDept);

                  return (
                    <button
                      key={shortDept}
                      type="button"
                      onClick={() => {
                        const full = DEPARTMENTS.find(d => d.includes(shortDept)) || 'All Departments';
                        setSelectedDeptFilter(full);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                        isMatching
                          ? 'bg-rose-500 text-white font-semibold shadow-md shadow-rose-950/40'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                      }`}
                    >
                      {shortDept}
                    </button>
                  );
                })}
              </div>

              {/* Mentors Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>
                    Showing {filteredMentors.length} {filteredMentors.length === 1 ? 'Mentor' : 'Mentors'}
                  </span>
                  {selectedDeptFilter !== 'All Departments' && (
                    <span className="text-rose-400 font-mono text-[11px]">
                      Filtered: {selectedDeptFilter.split(' ')[0]}
                    </span>
                  )}
                </div>

                {fetchingMentors ? (
                  <div className="py-16 text-center text-slate-400 space-y-3">
                    <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs">Loading verified university faculty list...</p>
                  </div>
                ) : filteredMentors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredMentors.map((mentor) => {
                      const isChosen = selectedMentor && selectedMentor.id === mentor.id;

                      return (
                        <div
                          key={mentor.id}
                          onClick={() => setSelectedMentor(mentor)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative group ${
                            isChosen
                              ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-rose-950/40 border-rose-500/80 shadow-xl shadow-rose-950/30 ring-2 ring-rose-500/30'
                              : 'bg-slate-950/60 border-white/[0.07] hover:border-white/20 hover:bg-slate-900/70'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              <img
                                src={mentor.avatar || DEFAULT_AVATAR}
                                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                                alt={mentor.name}
                                className="w-14 h-14 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
                              />
                              {isChosen && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-sm text-white group-hover:text-rose-200 transition-colors truncate">
                                  {mentor.name}
                                </h4>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold shrink-0">
                                  {mentor.role}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                                <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                                <span>{mentor.department}</span>
                              </p>

                              <p className="text-xs text-slate-300/80 mt-2 line-clamp-2 leading-relaxed">
                                {mentor.bio || 'Available for private student consultations, project guidance, and exam mentoring.'}
                              </p>
                            </div>
                          </div>

                          {/* Footer with Select Pill */}
                          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-emerald-400" />
                              <span>Typical reply: &lt; 24 hrs</span>
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMentor(mentor);
                              }}
                              className={`px-3 py-1 rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center gap-1.5 ${
                                isChosen
                                  ? 'bg-rose-500 text-white shadow-sm'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                              }`}
                            >
                              {isChosen ? (
                                <>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Selected</span>
                                </>
                              ) : (
                                <span>Select Mentor</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : mentorsList.length === 0 ? (
                  <div className="py-16 text-center glass-panel rounded-2xl border border-white/[0.08] p-6 space-y-3">
                    <UserCheck className="w-10 h-10 text-slate-500 mx-auto" />
                    <h3 className="text-sm font-bold text-white">No faculty mentors registered yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Verified faculty members will appear here once invited and onboarded by university administration.
                    </p>
                  </div>
                ) : (
                  <div className="py-16 text-center glass-panel rounded-2xl border border-white/[0.08] p-6 space-y-3">
                    <UserCheck className="w-10 h-10 text-slate-500 mx-auto" />
                    <h3 className="text-sm font-bold text-white">No mentors found matching your filters</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Try clearing the search query or selecting "All Departments" to see all available university faculty.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedDeptFilter('All Departments');
                        setMentorSearch('');
                      }}
                      className="bg-slate-900 border border-white/10 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2 Actions */}
              <div className="pt-5 border-t border-white/[0.07] flex items-center justify-between flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setStep(1);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Student Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleStep2Next}
                  disabled={!selectedMentor}
                  className={`font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2.5 shadow-lg transition-all ${
                    selectedMentor
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-950/40 border border-rose-400/30 cursor-pointer haptic-btn'
                      : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>Proceed to Step 3: Review</span>
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: Review Process & Confirmation */}
          {/* ========================================================================= */}
          {step === 3 && selectedMentor && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative space-y-6">
              
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.07]">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Step 3: Review Your Advisory Request</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Please inspect all details carefully before submitting your formal requisition to the faculty member.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Final Step
                </span>
              </div>

              {/* Review Cards Grid */}
              <div className="space-y-4">
                
                {/* 1. Chosen Mentor Card */}
                <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] bg-slate-950/70 relative">
                  <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/[0.06]">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Chosen Faculty Mentor</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Change Mentor
                    </button>
                  </div>

                  <div className="flex items-start gap-4">
                    <img
                      src={selectedMentor.avatar || DEFAULT_AVATAR}
                      onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                      alt={selectedMentor.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-white">{selectedMentor.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                          {selectedMentor.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedMentor.department}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed italic">
                        "{selectedMentor.bio}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Student Credentials Card */}
                <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] bg-slate-950/70">
                  <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/[0.06]">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Student Credentials</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Edit Info
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Full Student Name:</span>
                      <span className="font-bold text-slate-100">{studentName}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Admission Number:</span>
                      <span className="font-mono font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 inline-block">
                        {admissionNo}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Contact Number:</span>
                      <span className="font-mono font-bold text-slate-100 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        {contactNo}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Academic Standing:</span>
                      <span className="font-semibold text-slate-200">{academicYear}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/[0.05] text-xs">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Student Department:</span>
                    <span className="text-slate-200 font-medium">{studentDept}</span>
                  </div>
                </div>

                {/* 3. Reason & Consultation Topic */}
                <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] bg-slate-950/70">
                  <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/[0.06]">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Advisory Topic & Reason for Connect</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Mode: <strong className="text-slate-200">{contactPreference}</strong>
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/90 border border-white/[0.06] text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {reason}
                  </div>
                </div>

                {/* Privacy Guarantee Note */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white">Confidential Advisory Assurance:</strong> Your request and contact details are delivered exclusively to <strong>{selectedMentor.name}</strong>'s authenticated faculty dashboard. You will receive direct communication via your specified phone/WhatsApp within 24–48 hours.
                  </div>
                </div>

              </div>

              {/* Step 3 Actions */}
              <div className="pt-5 border-t border-white/[0.07] flex items-center justify-between flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setStep(2);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Choose Mentor</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitRequest}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold px-7 py-3 rounded-xl text-xs flex items-center gap-2.5 shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all cursor-pointer haptic-btn disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Confirm & Submit Mentorship Request</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: Success & Confirmation Receipt View */}
          {/* ========================================================================= */}
          {step === 4 && (
            <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-emerald-500/30 shadow-2xl relative overflow-hidden text-center space-y-6 animate-fadeIn">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Celebration Icon */}
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              {/* Title & Mentor Notice */}
              <div className="max-w-xl mx-auto space-y-2">
                <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold uppercase tracking-wider">
                  Request Dispatched Successfully
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Your 1-on-1 Advisory Request Has Been Assigned!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed pt-1">
                  Your consultation inquiry has been forwarded to <strong className="text-white">{selectedMentor?.name}</strong> ({selectedMentor?.role}).
                </p>
              </div>

              {/* Reference ID Pill */}
              <div className="inline-flex items-center gap-3 bg-slate-950/80 border border-white/10 rounded-2xl px-5 py-3 text-xs font-mono shadow-md">
                <span className="text-slate-400">Official Tracking ID:</span>
                <span className="text-emerald-400 font-bold tracking-wider">{submittedRequest?.id}</span>
                <button
                  onClick={handleCopyId}
                  className="ml-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5 border border-white/10 cursor-pointer"
                >
                  {copiedId ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* What Happens Next Roadmap */}
              <div className="max-w-xl mx-auto text-left glass-panel p-5 rounded-2xl border border-white/[0.07] bg-slate-950/60 space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <span>Next Steps & Timeline:</span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      <strong>Faculty Review:</strong> {selectedMentor?.name} reviews your query in their private faculty portal.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      <strong>Direct Contact:</strong> The mentor will message or call you at <span className="font-mono text-white">{contactNo}</span> via {contactPreference}.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p>
                      <strong>Session Confirmation:</strong> A mutually agreed time or cabin slot will be coordinated for your advisory session.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3.5 pt-4 flex-wrap">
                <Link
                  to="/"
                  className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-rose-950/40 border border-rose-400/30 transition-all cursor-pointer haptic-btn"
                >
                  Return to Campus Feed
                </Link>

                <button
                  onClick={handleReset}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold px-5 py-2.5 rounded-xl text-xs border border-white/10 transition-all cursor-pointer"
                >
                  Connect with Another Mentor
                </button>
              </div>

            </div>
          )}

        </section>

        {/* Right Sidebar */}
        <RightPanel />
      </main>

      {/* Global Modals for full feature support */}
      <CreatePostModal />
      <NotificationDrawer />
      <AuthModal />
      <StaffPortalModal />
    </div>
  );
};
