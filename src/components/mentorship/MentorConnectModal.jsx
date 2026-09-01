import React, { useState, useEffect } from 'react';
import { useForum } from '../../context/ForumContext';
import { api } from '../../services/api';
import {
  X,
  UserCheck,
  Building2,
  Phone,
  FileText,
  Search,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  Send,
  Sparkles
} from 'lucide-react';

const DEPARTMENTS = [
  'All Departments',
  'School of Computer Science & Engineering (SCSE)',
  'School of Engineering (SOE)',
  'School of Business (SOB)',
  'Placements & Corporate Relations',
  'Exam Cell & Academic Counseling'
];

export const MentorConnectModal = () => {
  const { isMentorModalOpen, setIsMentorModalOpen, userState } = useForum();

  const [step, setStep] = useState(1); // 1: Details, 2: Select Mentor, 3: Preview, 4: Success

  // Form State
  const [admissionNo, setAdmissionNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [studentDept, setStudentDept] = useState('School of Computer Science & Engineering (SCSE)');
  const [reason, setReason] = useState('');

  // Mentor Selection State
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All Departments');
  const [mentorSearch, setMentorSearch] = useState('');
  const [mentorsList, setMentorsList] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRequest, setSubmittedRequest] = useState(null);

  // Pre-fill student name if logged in
  useEffect(() => {
    if (userState && !userState.isGuest) {
      if (!studentName) setStudentName(userState.name || '');
    }
  }, [userState]);

  // Fetch Mentors List
  useEffect(() => {
    async function fetchMentors() {
      try {
        setLoading(true);
        const data = await api.getMentors('all');
        setMentorsList(data);
      } catch (err) {
        console.warn('Failed to load mentors:', err);
      } finally {
        setLoading(false);
      }
    }
    if (isMentorModalOpen) {
      fetchMentors();
    }
  }, [isMentorModalOpen]);

  if (!isMentorModalOpen) return null;

  // Filtered Mentors
  const filteredMentors = mentorsList.filter(m => {
    const matchesDept = selectedDeptFilter === 'All Departments' || m.department.toLowerCase().includes(selectedDeptFilter.toLowerCase().split(' ')[0]);
    const matchesSearch = !mentorSearch ||
      m.name.toLowerCase().includes(mentorSearch.toLowerCase()) ||
      m.role.toLowerCase().includes(mentorSearch.toLowerCase()) ||
      m.department.toLowerCase().includes(mentorSearch.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleStep1Next = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!admissionNo.trim() || !studentName.trim() || !contactNo.trim() || !reason.trim()) {
      setErrorMsg('Please fill in all student details before proceeding.');
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    setErrorMsg('');
    if (!selectedMentor) {
      setErrorMsg('Please select a mentor or professor to connect with.');
      return;
    }
    setStep(3);
  };

  const handleSubmitRequest = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.submitMentorshipRequest({
        admissionNo,
        studentName,
        contactNo,
        studentDepartment: studentDept,
        reason,
        mentorId: selectedMentor.id
      });
      setSubmittedRequest(res.request);
      setStep(4);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsMentorModalOpen(false);
    setStep(1);
    setSelectedMentor(null);
    setSubmittedRequest(null);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl glass-panel rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">
                1-on-1 Student-Mentor Connect
              </h2>
              <p className="text-[11px] text-slate-400">
                Galgotias University Private Advisory & Mentorship Portal
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-3 bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-center shrink-0">
          <div className={`py-2 px-3 border-r border-slate-800 transition-colors ${step === 1 ? 'bg-slate-800 text-slate-100 border-b-2 border-b-emerald-400' : 'text-slate-500'}`}>
            1. Student Details
          </div>
          <div className={`py-2 px-3 border-r border-slate-800 transition-colors ${step === 2 ? 'bg-slate-800 text-slate-100 border-b-2 border-b-emerald-400' : 'text-slate-500'}`}>
            2. Choose Mentor
          </div>
          <div className={`py-2 px-3 transition-colors ${step >= 3 ? 'bg-slate-800 text-slate-100 border-b-2 border-b-emerald-400' : 'text-slate-500'}`}>
            3. Preview & Submit
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Student Information Form */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Admission Number *
                  </label>
                  <div className="relative flex items-center">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={admissionNo}
                      onChange={(e) => setAdmissionNo(e.target.value)}
                      placeholder="e.g. 21SCSE1010482"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Student Name *
                  </label>
                  <div className="relative flex items-center">
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Aryan Sharma"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Number (WhatsApp/Phone) *
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Department *
                  </label>
                  <div className="relative flex items-center">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <select
                      value={studentDept}
                      onChange={(e) => setStudentDept(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-500 cursor-pointer"
                    >
                      {DEPARTMENTS.filter(d => d !== 'All Departments').map(d => (
                        <option key={d} value={d} className="bg-slate-900">{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Contacting Mentor *
                </label>
                <textarea
                  rows="4"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your academic query, exam prep doubt, placement advice, or research paper guidance..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-slate-500"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-slate-100 hover:bg-white text-slate-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Select Mentor</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Department Search & Mentor Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Department Dropdown Filter */}
                <div className="w-full sm:w-1/2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Filter Mentor Department:
                  </label>
                  <select
                    value={selectedDeptFilter}
                    onChange={(e) => setSelectedDeptFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d} className="bg-slate-900">{d}</option>
                    ))}
                  </select>
                </div>

                {/* Mentor Search Input */}
                <div className="w-full sm:w-1/2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Search Mentor Name or Role:
                  </label>
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={mentorSearch}
                      onChange={(e) => setMentorSearch(e.target.value)}
                      placeholder="Search Dr. Ananya, Prof. Rajesh..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Mentors List Grid */}
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {filteredMentors.length > 0 ? (
                  filteredMentors.map(mentor => {
                    const isChosen = selectedMentor && selectedMentor.id === mentor.id;
                    return (
                      <div
                        key={mentor.id}
                        onClick={() => setSelectedMentor(mentor)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                          isChosen
                            ? 'bg-slate-800/90 border-slate-500 shadow-md ring-2 ring-slate-400/20'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <img
                          src={mentor.avatar}
                          alt={mentor.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                              {mentor.name}
                            </h4>
                            <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full font-mono border border-slate-700">
                              {mentor.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {mentor.department}
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-sans">
                            {mentor.bio}
                          </p>
                        </div>
                        <div className="shrink-0">
                          {isChosen ? (
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-950 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-slate-700 bg-slate-950"></div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    No matching mentors or faculty found for this department.
                  </div>
                )}
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Details</span>
                </button>
                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="bg-slate-100 hover:bg-white text-slate-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Preview Request</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Preview Details & Final Submit */}
          {step === 3 && selectedMentor && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Summary Receipt Preview</span>
                </h3>

                {/* Selected Mentor Card */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <img
                    src={selectedMentor.avatar}
                    alt={selectedMentor.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{selectedMentor.name}</h4>
                    <p className="text-[11px] text-slate-400">{selectedMentor.role} • {selectedMentor.department}</p>
                  </div>
                </div>

                {/* Student Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Admission No:</span>
                    <span className="font-mono font-semibold text-slate-200">{admissionNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Student Name:</span>
                    <span className="font-semibold text-slate-200">{studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Number:</span>
                    <span className="font-mono text-slate-200">{contactNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Student Department:</span>
                    <span className="text-slate-200">{studentDept}</span>
                  </div>
                </div>

                {/* Reason Text */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block text-[10px] mb-1">Reason for Contacting:</span>
                  <p className="text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 whitespace-pre-line">
                    {reason}
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Change Mentor</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmitRequest}
                  disabled={loading}
                  className="bg-slate-100 hover:bg-white disabled:opacity-50 text-slate-950 font-bold px-6 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success Receipt Screen */}
          {step === 4 && submittedRequest && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">1-on-1 Request Submitted!</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Your communication request has been assigned to <strong className="text-slate-200">{selectedMentor?.name}</strong>. You will be notified once they review and reply.
                </p>
              </div>
              <div className="inline-block bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-300">
                Request ID: <span className="text-emerald-400 font-bold">{submittedRequest.id}</span>
              </div>
              <div>
                <button
                  onClick={handleClose}
                  className="bg-slate-100 hover:bg-white text-slate-950 font-bold px-6 py-2 rounded-xl text-xs shadow-sm cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
