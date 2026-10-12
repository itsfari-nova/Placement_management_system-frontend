import { useState, useEffect } from 'react'
import './App.css'

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

function App() {
  const [students, setStudents] = useState([])
  const [studentSearch, setStudentSearch] = useState('')
const [branchFilter, setBranchFilter] = useState('All')
    const [jobForm, setJobForm] = useState({
    role: '',
    companyName: '',
    location: '',
    packageAmount: '',
    eligibilityCgpa: '',
    jobType: 'Full-time',
  })

  const [postedJobs, setPostedJobs] = useState([])
  const [jobMessage, setJobMessage] = useState('')
  
const loadStudents = async () => {
  try {
    const response = await fetch('http://localhost:8080/student/get')

    if (!response.ok) {
      throw new Error('Failed to load students')
    }

    const data = await response.json()

const uniqueStudents = data.filter(
  (student, index, array) =>
    index === array.findIndex(
      (item) =>
        item.email?.trim().toLowerCase() ===
        student.email?.trim().toLowerCase()
    )
)

setStudents(uniqueStudents)
  } catch (error) {
    console.error('Error loading students:', error)
  }
}
  
const loadPostedJobs = async () => {
  try {
    const response = await fetch('http://localhost:8080/jobs/get')

    if (!response.ok) {
      throw new Error('Failed to load jobs')
    }

    const data = await response.json()
    setPostedJobs(data)
  } catch (error) {
    console.error('Error loading jobs:', error)
    setJobMessage('Could not load jobs. Please check the backend.')
  }
}


const handleJobChange = (event) => {
  const { name, value } = event.target

  setJobForm((previous) => ({
    ...previous,
    [name]: value,
  }))
}

const postJob = async (event) => {
  event.preventDefault()
  setJobMessage('')

  try {
    const response = await fetch('http://localhost:8080/jobs/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...jobForm,
        packageAmount: Number(jobForm.packageAmount),
        eligibilityCgpa: Number(jobForm.eligibilityCgpa),
        companyEmail: loginEmail.trim(),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to post job')
    }

    setJobMessage('Job opportunity posted successfully! 🎉')

    setJobForm({
      role: '',
      companyName: '',
      location: '',
      packageAmount: '',
      eligibilityCgpa: '',
      jobType: 'Full-time',
    })

    await loadPostedJobs()
  } catch (error) {
    console.error('Error posting job:', error)
    setJobMessage('Could not post the job. Please check your backend.')
  }
}

  const [page, setPage] = useState('home')
  const [companyTab, setCompanyTab] = useState('Overview')


const [companyProfile, setCompanyProfile] = useState({
  name: '',
  email: '',
  industry: '',
  website: '',
  location: '',
  description: '',
  hrContact: '',
  phone: '',
})

const [companyProfileMessage, setCompanyProfileMessage] = useState('')
const [companyProfileLoading, setCompanyProfileLoading] = useState(false)


  const [userRole, setUserRole] = useState('')
  
const [studentTab, setStudentTab] = useState('Overview')
const [studentApplications, setStudentApplications] = useState([])


const [companyApplications, setCompanyApplications] = useState([])

const [interviewForm, setInterviewForm] = useState({
  applicationId: null,
  interviewDateTime: '',
  interviewMode: 'Online',
  interviewLocation: '',
  interviewLink: '',
  recruiterNotes: '',
})

const [interviewMessage, setInterviewMessage] = useState('')

const [adminTab, setAdminTab] = useState('Overview')
const [adminApplications, setAdminApplications] = useState([])
const [adminApplicationsError, setAdminApplicationsError] = useState('')

async function loadAdminApplications() {
  try {
    const response = await fetch('http://localhost:8080/applications/all')

    if (!response.ok) {
      throw new Error('Failed to load applications')
    }

    const data = await response.json()
    setAdminApplications(data)
    setAdminApplicationsError('')
  } catch (error) {
    console.error('Error loading admin applications:', error)
    setAdminApplicationsError('Could not load applications.')
  }
}

const [applicationsLoading, setApplicationsLoading] = useState(false)
const [applicationsError, setApplicationsError] = useState('')

async function loadStudentApplications(email) {
  if (!email) return;

  try {
    const response = await fetch(
      "http://localhost:8080/applications/student/" +
        encodeURIComponent(email)
    );

    if (!response.ok) {
      console.error("Failed to load applications:", response.status);
      return;
    }

    const data = await response.json();

    setStudentApplications(
      data.map((app) => ({
        ...app,
        title: app.jobTitle,
        company: app.companyName,
        type: app.applicationType,
      }))
    );
  } catch (error) {
    console.error("Error loading applications:", error);
  }
}

async function loadCompanyApplications() {
  setApplicationsLoading(true)
  setApplicationsError('')

  try {
    const response = await fetch(
      'http://localhost:8080/applications/all'
    )

    if (!response.ok) {
      throw new Error(`Failed to load applications (${response.status})`)
    }

    const data = await response.json()
    const companyName = (companyProfile.name || '').trim().toLowerCase()

    if (!companyName) {
      setCompanyApplications([])
      setApplicationsError(
        'Please save your company name in Company Profile first.'
      )
      return
    }

    const filteredApplications = data.filter(
      (application) =>
        (application.companyName || '').trim().toLowerCase() ===
        companyName
    )

    setCompanyApplications(filteredApplications)
  } catch (error) {
    console.error('Error loading company applications:', error)
    setApplicationsError('Could not load applications. Please try again.')
  } finally {
    setApplicationsLoading(false)
  }
}

const updateRecruitmentStatus = async (application, newStatus) => {
  try {
    const response = await fetch(
      `http://localhost:8080/applications/${application.id}/recruitment`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          interviewDateTime: application.interviewDateTime || null,
          interviewMode: application.interviewMode || null,
          interviewLocation: application.interviewLocation || null,
          interviewLink: application.interviewLink || null,
          recruiterNotes: application.recruiterNotes || null,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to update status (${response.status})`)
    }

    await loadCompanyApplications()

    if (loginEmail.trim()) {
      await loadStudentApplications(loginEmail.trim())
    }

    alert(`Candidate status updated to: ${newStatus}`)
  } catch (error) {
    console.error('Recruitment update failed:', error)
    alert('Could not update candidate status. Please check the backend.')
  }
}


const openInterviewForm = (application) => {
  setInterviewMessage('')

  setInterviewForm({
    applicationId: application.id,
    interviewDateTime: application.interviewDateTime
      ? application.interviewDateTime.slice(0, 16)
      : '',
    interviewMode: application.interviewMode || 'Online',
    interviewLocation: application.interviewLocation || '',
    interviewLink: application.interviewLink || '',
    recruiterNotes: application.recruiterNotes || '',
  })
}

const saveInterviewDetails = async (event) => {
  event.preventDefault()
  setInterviewMessage('')

  if (!interviewForm.applicationId) {
    setInterviewMessage('Please select a candidate first.')
    return
  }

  if (!interviewForm.interviewDateTime) {
    setInterviewMessage('Please select the interview date and time.')
    return
  }

  try {
    const application = companyApplications.find(
      (item) => item.id === interviewForm.applicationId
    )

    if (!application) {
      throw new Error('Candidate application not found.')
    }

    const response = await fetch(
      `http://localhost:8080/applications/${interviewForm.applicationId}/recruitment`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Interview Scheduled',
          interviewDateTime: interviewForm.interviewDateTime,
          interviewMode: interviewForm.interviewMode,
          interviewLocation: interviewForm.interviewLocation,
          interviewLink: interviewForm.interviewLink,
          recruiterNotes: interviewForm.recruiterNotes,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to save interview (${response.status})`)
    }

    await loadCompanyApplications()

    setInterviewMessage('Interview details saved successfully! 🎉')
    setInterviewForm({
      applicationId: null,
      interviewDateTime: '',
      interviewMode: 'Online',
      interviewLocation: '',
      interviewLink: '',
      recruiterNotes: '',
    })
  } catch (error) {
    console.error('Error saving interview:', error)
    setInterviewMessage(
      'Could not save interview details. Please check the backend.'
    )
  }
}


const [studentSkills, setStudentSkills] = useState('')
const [resumeLink, setResumeLink] = useState('')

  
const [profilePhone, setProfilePhone] = useState('')
const [profileBranch, setProfileBranch] = useState('')
const [profileCgpa, setProfileCgpa] = useState('')
const [profileGraduationYear, setProfileGraduationYear] = useState('')
const [profileEmail, setProfileEmail] = useState('')


  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerRole, setRegisterRole] = useState('STUDENT')

  const [message, setMessage] = useState('')

  useEffect(() => {
  if (page !== 'company-dashboard' || companyTab !== 'Company Profile' || !loginEmail.trim()) {
    return
  }

  const loadCompanyProfile = async () => {
    setCompanyProfileLoading(true)
    setCompanyProfileMessage('')

    try {
      const response = await fetch(
        `http://localhost:8080/company/profile/${encodeURIComponent(loginEmail.trim())}`
      )

      if (!response.ok) {
        throw new Error('Could not load company profile.')
      }

      const data = await response.json()

      setCompanyProfile({
        name: data?.name || '',
        email: data?.email || loginEmail.trim(),
        industry: data?.industry || '',
        website: data?.website || '',
        location: data?.location || '',
        description: data?.description || '',
        hrContact: data?.hrContact || '',
        phone: data?.phone || '',
      })
    } catch (error) {
      console.error('Error loading company profile:', error)
      setCompanyProfile((previous) => ({
        ...previous,
        email: loginEmail.trim(),
      }))
      setCompanyProfileMessage('Could not load your profile. You can still enter your details.')
    } finally {
      setCompanyProfileLoading(false)
    }
  }

  loadCompanyProfile()
}, [page, companyTab, loginEmail])

useEffect(() => {
  if (page === 'student-dashboard' && loginEmail.trim()) {
    loadStudentApplications(loginEmail.trim())
  }
}, [page, loginEmail])

useEffect(() => {
  if (
    page === 'company-dashboard' &&
    companyTab === 'Applications Received'
  ) {
    loadCompanyApplications()
  }
}, [page, companyTab, companyProfile.name])


const handleCompanyProfileChange = (event) => {
  const { name, value } = event.target

  setCompanyProfile((previous) => ({
    ...previous,
    [name]: value,
  }))
}

const saveCompanyProfile = async (event) => {
  event.preventDefault()
  setCompanyProfileMessage('')
  setCompanyProfileLoading(true)

  try {
    const response = await fetch('http://localhost:8080/company/profile/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...companyProfile,
        email: loginEmail.trim(),
      }),
    })

    if (!response.ok) {
      throw new Error('Could not save company profile.')
    }

    const savedProfile = await response.json()

    setCompanyProfile((previous) => ({
      ...previous,
      ...savedProfile,
      email: savedProfile.email || loginEmail.trim(),
    }))

    setCompanyProfileMessage('Company profile saved successfully!')
  } catch (error) {
    console.error('Error saving company profile:', error)
    setCompanyProfileMessage('Could not save your profile. Please check that the backend is running.')
  } finally {
    setCompanyProfileLoading(false)
  }
}

  useEffect(() => {
    fetch('http://localhost:8080/student/get')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch students')
        return response.json()
      })
      .then((data) => setStudents(data))
      .catch((error) => console.error('Error fetching students:', error))
  }, [])
  
  
useEffect(() => {
  if (
    page === 'company-dashboard' &&
    companyTab === 'Job Opportunities'
  ) {
    loadPostedJobs()
  }

  if (
    page === 'company-dashboard' &&
    companyTab === 'Find Students'
  ) {
    loadStudents()
  }
}, [page, companyTab])

useEffect(() => {
  if (page === 'admin-dashboard') {
    loadStudents()
    loadPostedJobs()
    loadAdminApplications()
  }
}, [page])


  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const openHomeSection = (id) => {
    setPage('home')
    setTimeout(() => scrollToSection(id), 100)
  }

    // Admin Dashboard chart data
  const adminOverviewData = [
    { name: 'Students', count: students.length },
    { name: 'Jobs', count: postedJobs.length },
    { name: 'Applications', count: adminApplications.length },
  ]

  const chartColors = ['#6366f1', '#14b8a6', '#f59e0b']

  
const applicationStatusData = [
  {
    name: 'Applied',
    count: adminApplications.filter(
      (app) =>
        ['applied', 'submitted'].includes(
          (app.status || '').toLowerCase()
        )
    ).length,
  },
  {
    name: 'Shortlisted',
    count: adminApplications.filter(
      (app) => (app.status || '').toLowerCase() === 'shortlisted'
    ).length,
  },
  {
    name: 'Selected',
    count: adminApplications.filter(
      (app) => ['selected', 'accepted'].includes(
        (app.status || '').toLowerCase()
      )
    ).length,
  },
  {
    name: 'Rejected',
    count: adminApplications.filter(
      (app) => (app.status || '').toLowerCase() === 'rejected'
    ).length,
  },
]


  return (
    <div className="app-container">
      
<nav className="navbar">
  <div className="navbar-brand">
    <button
      className="navbar-back-button"
      onClick={() => {
        if (page !== 'home') {
          setPage('home');
        } else {
          window.history.back();
        }
      }}
      title="Go Back"
      aria-label="Go Back"
    >
      ←
    </button>

    <div
      className="brand"
      onClick={() => openHomeSection('dashboard')}
      style={{ cursor: 'pointer' }}
    >
      🎓 PlaceTrack
    </div>
  </div>

  <div className="nav-links">
    <button onClick={() => openHomeSection('dashboard')}>Home</button>
    <button onClick={() => openHomeSection('students')}>Students</button>
    <button onClick={() => openHomeSection('companies')}>Companies</button>
    <button onClick={() => openHomeSection('applications')}>Applications</button>
    <button onClick={() => openHomeSection('eligibility')}>Eligibility</button>
    <button onClick={() => setPage('login')}>Login</button>
    <button onClick={() => setPage('register')}>Register</button>
  </div>
</nav>


      {page === 'home' && (
        <>
          <section className="hero" id="dashboard">
            <span className="hero-tag">CAMPUS PLACEMENT PORTAL</span>
            <h1>Welcome to PlaceTrack 👋</h1>
            <p>
              Your all-in-one placement management platform.
              Connect students with opportunities, help companies discover
              talent, and manage campus placements in one place.
            </p>

            <div className="hero-actions">
              <button onClick={() => openHomeSection('companies')}>
                Get Started →
              </button>
              <button
                className="secondary-button"
                onClick={() => setPage('register')}
              >
                Create Account
              </button>
            </div>
          </section>

          <section className="section" id="overview">
            <h2>Placement Dashboard</h2>
            <p>Total Students: {students.length}</p>

            <p className="section-subtitle">
              Everything you need to manage campus placements.
            </p>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-icon">👨‍🎓</div>
                <h3>Manage Students</h3>
                <p>View student profiles, qualifications, and records.</p>
                <button
                  className="card-link"
                  onClick={() => scrollToSection('students')}
                >
                  Explore Students →
                </button>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">🏢</div>
                <h3>Manage Companies</h3>
                <p>Explore recruiters, job roles, and eligibility criteria.</p>
                <button
                  className="card-link"
                  onClick={() => scrollToSection('companies')}
                >
                  Explore Companies →
                </button>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">📋</div>
                <h3>Track Applications</h3>
                <p>Monitor student applications and placement progress.</p>
                <button
                  className="card-link"
                  onClick={() => scrollToSection('applications')}
                >
                  View Applications →
                </button>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">✅</div>
                <h3>Check Eligibility</h3>
                <p>Check student qualifications against company requirements.</p>
                <button
                  className="card-link"
                  onClick={() => scrollToSection('eligibility')}
                >
                  Check Eligibility →
                </button>
              </div>
            </div>
          </section>

                    <section className="section feature-section" id="students">
            <h2>👨‍🎓 Student Directory</h2>
            <p className="section-subtitle">
              Manage student information and academic records in one place.
            </p>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-icon">👥</div>
                <h3>Student Records</h3>
                <p>
                  Maintain student contact details, academic qualifications,
                  branch, CGPA, and graduation year.
                </p>
                <span className="coming-label">
                  Student profile management
                </span>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">🎓</div>
                <h3>Academic Information</h3>
                <p>
                  Organize academic details to help evaluate placement
                  eligibility and discover suitable opportunities.
                </p>
                <span className="coming-label">
                  Academic record management
                </span>
              </div>
            </div>
          </section>

          <section className="section feature-section" id="companies">
            <h2>🏢 Company Hub</h2>
            <p className="section-subtitle">
              Explore recruiters and discover career opportunities.
            </p>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-icon">🏢</div>
                <h3>Company Directory</h3>
                <p>View recruiters and the organizations participating in placements.</p>
                <span className="coming-label">Company listing integration next</span>
              </div>
              <div className="dashboard-card">
                <div className="card-icon">💼</div>
                <h3>Job Opportunities</h3>
                <p>Explore job roles and learn about company requirements.</p>
                <span className="coming-label">Job postings integration next</span>
              </div>
            </div>
          </section>

          <section className="section feature-section" id="applications">
            <h2>📋 Application Tracker</h2>
            <p className="section-subtitle">
              Keep your placement application journey organized.
            </p>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-icon">📝</div>
                <h3>My Applications</h3>
                <p>Review applications submitted to different companies.</p>
                <span className="coming-label">Application integration next</span>
              </div>
              <div className="dashboard-card">
                <div className="card-icon">📊</div>
                <h3>Application Status</h3>
                <p>Track stages such as applied, shortlisted, and selected.</p>
                <span className="coming-label">Status tracking integration next</span>
              </div>
            </div>
          </section>

          <section className="section feature-section" id="eligibility">
            <h2>✅ Placement Eligibility</h2>
            <p className="section-subtitle">
              Find opportunities that match academic requirements.
            </p>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-icon">🎓</div>
                <h3>Academic Profile</h3>
                <p>Use CGPA, branch, and graduation year to evaluate eligibility.</p>
              </div>
              <div className="dashboard-card">
                <div className="card-icon">🎯</div>
                <h3>Eligibility Checker</h3>
                <p>Compare student details against each company's criteria.</p>
                <span className="coming-label">Eligibility checker integration next</span>
              </div>
            </div>
          </section>
        </>
      )}
      
{page === 'student-dashboard' && (
  <div className="student-portal">
    <aside className="student-sidebar">
      <div className="sidebar-brand">🎓 PlaceTrack</div>

      <p className="sidebar-label">STUDENT MENU</p>

      {[
        { name: 'Overview', icon: '🏠' },
        { name: 'Find Jobs', icon: '💼' },
        { name: 'Internships', icon: '🎯' },
        { name: 'My Applications', icon: '📋' },
        { name: 'Eligibility', icon: '✅' },
        { name: 'My Profile', icon: '👤' },
        { name: 'Skills & Resume', icon: '📄' },
      ].map((item) => (
        <button
          key={item.name}
          className={`sidebar-link ${
            studentTab === item.name ? 'active' : ''
          }`}
          onClick={() => {
            setStudentTab(item.name)
            setMessage('')
          }}
        >
          <span>{item.icon}</span>
          {item.name}
        </button>
      ))}

      
<button
  className="sidebar-logout"
  onClick={() => {
    setLoginEmail('')
    setLoginPassword('')
    setRegisterName('')
    setProfileEmail('')
    setProfilePhone('')
    setProfileBranch('')
    setProfileCgpa('')
    setProfileGraduationYear('')
    setStudentSkills('')
    setResumeLink('')
    setStudentApplications([])
    setUserRole('')
    setStudentTab('Overview')
    setCompanyTab('Overview')
    setMessage('')
    setPage('home')
  }}
>
  🚪 Logout
</button>

    </aside>

    <main className="student-main">
      <header className="student-topbar">
        <div>
          <p className="student-eyebrow">PLACEMENT PORTAL</p>
          <h1>{studentTab}</h1>
        </div>
        <div className="student-user">
          <span className="student-avatar">👤</span>
          <div>
            <strong>{registerName || 'Student'}</strong>
            <p>Student Account</p>
          </div>
        </div>
      </header>

      {studentTab === 'Overview' && (
        <>
          <section className="student-welcome">
            <div>
              <p>YOUR CAREER JOURNEY STARTS HERE</p>
              <h2>Welcome back, {registerName || 'Student'}! 👋</h2>
              <span>
                Discover opportunities and get ready for your next big step.
              </span>
              <br />
              <button onClick={() => setStudentTab('Find Jobs')}>
                Explore Jobs →
              </button>
            </div>
            <div className="welcome-emoji">🚀</div>
          </section>

          <div className="student-stat-grid">
            <div className="student-stat-card">
              <span>💼</span>
              <p>Job Opportunities</p>
              <h3>2</h3>
            </div>
            <div className="student-stat-card">
              <span>🎯</span>
              <p>Internships</p>
              <h3>2</h3>
            </div>
            <div className="student-stat-card">
              <span>📋</span>
              <p>My Applications</p>
              <h3>{studentApplications.length}</h3>
            </div>
            <div className="student-stat-card">
              <span>👥</span>
              <p>Registered Students</p>
              <h3>{students.length}</h3>
            </div>
          </div>

          <section className="student-content-card">
            <div className="student-section-heading">
              <div>
                <h2>Recommended Opportunities</h2>
                <p>Explore sample opportunities available in this demo.</p>
              </div>
              <button onClick={() => setStudentTab('Find Jobs')}>
                View all →
              </button>
            </div>

            <div className="opportunity-row">
              <div className="opportunity-icon">💻</div>
              <div className="opportunity-info">
                <h3>Graduate Software Trainee</h3>
                <p>Tech Company · Entry Level</p>
                <span>Example job listing</span>
              </div>
              <button
                onClick={() => setStudentTab('Find Jobs')}
                className="opportunity-button"
              >
                Explore
              </button>
            </div>

            <div className="opportunity-row">
              <div className="opportunity-icon">⚡</div>
              <div className="opportunity-info">
                <h3>Embedded Systems Intern</h3>
                <p>Electronics Company · Internship</p>
                <span>Example internship listing</span>
              </div>
              <button
                onClick={() => setStudentTab('Internships')}
                className="opportunity-button"
              >
                Explore
              </button>
            </div>
          </section>

          <section className="student-content-card">
            <h2>Quick Actions</h2>
            <div className="quick-action-grid">
              <button onClick={() => setStudentTab('My Profile')}>
                👤 Update Profile
              </button>
              <button onClick={() => setStudentTab('Eligibility')}>
                ✅ Check Eligibility
              </button>
              <button onClick={() => setStudentTab('Skills & Resume')}>
                📄 Add Skills & Resume
              </button>
            </div>
          </section>
        </>
      )}

      {(studentTab === 'Find Jobs' ||
        studentTab === 'Internships') && (
        <section className="student-content-card">
          <h2>
            {studentTab === 'Find Jobs'
              ? '💼 Explore Job Opportunities'
              : '🎯 Explore Internships'}
          </h2>
          <p className="student-muted">
            These are sample listings for the interface demonstration, not
            live vacancies.
          </p>

          {(studentTab === 'Find Jobs'
            ? [
                {
                  title: 'Graduate Software Trainee',
                  company: 'Example Technology Company',
                  details: 'Entry level · Full time',
                  criteria: 'Example requirement: CGPA 7.0 or above',
                },
                {
                  title: 'Junior Embedded Systems Engineer',
                  company: 'Example Electronics Company',
                  details: 'Entry level · Electronics',
                  criteria: 'Example requirement: ECE or related branch',
                },
              ]
            : [
                {
                  title: 'Embedded Systems Intern',
                  company: 'Example Electronics Company',
                  details: 'Internship · Embedded C',
                  criteria: 'Example requirement: ECE or related branch',
                },
                {
                  title: 'VLSI Design Intern',
                  company: 'Example Semiconductor Company',
                  details: 'Internship · Digital Design',
                  criteria: 'Example requirement: Basic digital design knowledge',
                },
              ]
          ).map((job) => {
            const alreadyApplied = studentApplications.some(
              (application) => application.title === job.title
            )

            return (
              <div className="job-card" key={job.title}>
                <div className="opportunity-icon">🏢</div>
                <div className="job-details">
                  <h3>{job.title}</h3>
                  <p>{job.company}</p>
                  <span>{job.details}</span>
                  <p className="job-criteria">{job.criteria}</p>
                </div>
               
<button
  disabled={alreadyApplied}
  onClick={async () => {
    try {
      const response = await fetch(
        'http://localhost:8080/applications/add',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentEmail: loginEmail,
            jobTitle: job.title,
            companyName: job.company,
            applicationType: studentTab,
            status: 'Applied',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save application');
      }

      const savedApplication = await response.json();

      setStudentApplications((current) => [
        ...current,
        {
          ...savedApplication,
          title: savedApplication.jobTitle,
          company: savedApplication.companyName,
          type: savedApplication.applicationType,
        },
      ]);

      alert('Application saved successfully! 🎉');
    } catch (error) {
      console.error('Application error:', error);
      alert('Could not save the application. Please try again.');
    }
  }}
>
  {alreadyApplied ? 'Added ✓' : 'Apply Now'}
</button>

              </div>
            )
          })}
        </section>
      )}

      
{studentTab === 'My Applications' && (
  <section className="student-content-card">
    
    {studentApplications.length === 0 ? (
      <div className="student-empty-state">
        <span>📭</span>
        <h3>No applications yet</h3>
        <p>
          Explore jobs or internships to try the demo application flow.
        </p>
        <button onClick={() => setStudentTab('Find Jobs')}>
          Find Jobs
        </button>
      </div>
    ) : (
      studentApplications.map((application, index) => (
        <div
          className="job-card"
          key={application.id ?? `${application.title}-${index}`}
        >
          <div className="opportunity-icon">📄</div>

          <div className="job-details">
            <h3>{application.title || application.jobTitle}</h3>

            <p>{application.company || application.companyName}</p>

            <span>{application.type || application.applicationType}</span>

            <p>
              <strong>Application Status:</strong>{' '}
              {application.status || 'Applied'}
            </p>

            {application.interviewDateTime ? (
              <div className="student-interview-details">
                <h4>📅 Interview Scheduled</h4>

                <p>
                  <strong>Date &amp; Time:</strong>{' '}
                  {new Date(
                    application.interviewDateTime
                  ).toLocaleString()}
                </p>

                {application.interviewMode && (
                  <p>
                    <strong>Mode:</strong> {application.interviewMode}
                  </p>
                )}

                {application.interviewLocation && (
                  <p>
                    <strong>Location:</strong>{' '}
                    {application.interviewLocation}
                  </p>
                )}

                {application.interviewLink && (
                  <p>
                    <a
                      href={application.interviewLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      🔗 Join Interview
                    </a>
                  </p>
                )}

                {application.recruiterNotes && (
                  <p>
                    <strong>Recruiter Notes:</strong>{' '}
                    {application.recruiterNotes}
                  </p>
                )}
              </div>
            ) : (
              <p className="student-muted">
                No interview scheduled yet.
              </p>
            )}
          </div>

          <span className="demo-status">
            {application.status || 'Applied'}
          </span>
        </div>
      ))
    )}
  </section>
)}


      {studentTab === 'Eligibility' && (
        <section className="student-content-card">
          <h2>✅ Placement Eligibility Checker</h2>
          <p className="student-muted">
            This example checker uses the details currently entered in your
            profile. Final eligibility depends on each recruiter's actual rules.
          </p>

          <div className="eligibility-summary">
            <p>
              <strong>Branch:</strong> {profileBranch || 'Not entered'}
            </p>
            <p>
              <strong>CGPA:</strong> {profileCgpa || 'Not entered'}
            </p>
            <p>
              <strong>Graduation Year:</strong>{' '}
              {profileGraduationYear || 'Not entered'}
            </p>
          </div>

          {profileCgpa !== '' && Number(profileCgpa) >= 7 ? (
            <div className="eligibility-result">
              <h3>✓ Meets the example CGPA criterion</h3>
              <p>
                Your entered CGPA meets the demo threshold of 7.0. This does
                not guarantee eligibility for a real job.
              </p>
            </div>
          ) : profileCgpa !== '' ? (
            <div className="eligibility-notice">
              <h3>Example CGPA criterion not met</h3>
              <p>
                The demo threshold is 7.0. Check the real recruiter's criteria
                because requirements vary.
              </p>
            </div>
          ) : (
            <div className="student-empty-state">
              <span>🎓</span>
              <h3>Add your academic details first</h3>
              <button onClick={() => setStudentTab('My Profile')}>
                Complete My Profile
              </button>
            </div>
          )}
        </section>
      )}

      {studentTab === 'My Profile' && (
        <section className="student-content-card profile-section">
          <h2>👤 My Student Profile</h2>
          <p className="student-muted">
            Add your contact and academic details.
          </p>

          <form
            className="student-profile-form"
            onSubmit={async (event) => {
              event.preventDefault()

              const profile = {
                name: registerName.trim(),
                email: loginEmail.trim().toLowerCase(),
                phone: profilePhone,
                branch: profileBranch,
                cgpa: Number(profileCgpa),
                graduationYear: Number(profileGraduationYear),
              }

              try {
                const response = await fetch(
                  'http://localhost:8080/student/add',
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profile),
                  }
                )

                if (!response.ok) {
                  setMessage('Could not save your profile.')
                  return
                }

                setMessage('Student profile saved successfully!')

                const studentsResponse = await fetch(
                  'http://localhost:8080/student/get'
                )

                if (studentsResponse.ok) {
                  const data = await studentsResponse.json()
                  setStudents(data)
                }
              } catch {
                setMessage('Cannot connect to the backend.')
              }
            }}
          >
            <label htmlFor="profileName">Full Name</label>
            <input
              id="profileName"
              value={registerName}
              onChange={(event) => setRegisterName(event.target.value)}
              required
            />

            <label htmlFor="profileEmail">Email Address</label>
            <input
              id="profileEmail"
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              required
            />

            <label htmlFor="profilePhone">Phone Number</label>
            <input
              id="profilePhone"
              type="tel"
              inputMode="numeric"
              value={profilePhone}
              onChange={(event) =>
                setProfilePhone(event.target.value.replace(/\D/g, '').slice(0, 10))
              }
              maxLength={10}
              required
            />

            <label htmlFor="profileBranch">Branch</label>
            <input
              id="profileBranch"
              value={profileBranch}
              onChange={(event) => setProfileBranch(event.target.value)}
              placeholder="e.g. ECE"
              required
            />

            <label htmlFor="profileCgpa">CGPA</label>
            <input
              id="profileCgpa"
              type="number"
              min="0"
              max="10"
              step="0.01"
              value={profileCgpa}
              onChange={(event) => setProfileCgpa(event.target.value)}
              required
            />

            <label htmlFor="profileGraduationYear">Graduation Year</label>
            <input
              id="profileGraduationYear"
              type="number"
              min="2020"
              max="2100"
              value={profileGraduationYear}
              onChange={(event) =>
                setProfileGraduationYear(event.target.value)
              }
              required
            />

            <button type="submit">Save Profile</button>
          </form>

          {message && <p role="status">{message}</p>}
        </section>
      )}

      {studentTab === 'Skills & Resume' && (
        <section className="student-content-card">
          <h2>📄 Skills & Resume</h2>
          <p className="student-muted">
            Add your skills and an optional link to your resume.
          </p>

          <form
            className="student-profile-form"
            onSubmit={(event) => {
              event.preventDefault()
              setMessage('Skills and resume details updated for this session.')
            }}
          >
            <label htmlFor="studentSkills">Skills</label>
            <textarea
              id="studentSkills"
              rows="4"
              placeholder="e.g. Verilog, C, Embedded Systems, Python"
              value={studentSkills}
              onChange={(event) => setStudentSkills(event.target.value)}
            />

            <label htmlFor="resumeLink">Resume Link (optional)</label>
            <input
              id="resumeLink"
              type="url"
              placeholder="https://..."
              value={resumeLink}
              onChange={(event) => setResumeLink(event.target.value)}
            />

            <button type="submit">Save Details</button>
          </form>

          {message && <p role="status">{message}</p>}

          <p className="student-muted">
            These details are currently held in page state. Persistent saving
            and resume uploads can be added through the backend later.
          </p>
        </section>
      )}
    </main>
  </div>
)}

{page === 'company-dashboard' && (
  <section className="company-layout">
    <aside className="company-sidebar">
      <h2>🏢 PlaceTrack</h2>
      <p className="sidebar-subtitle">Company Portal</p>

      <button
        className={companyTab === 'Overview' ? 'active-menu' : ''}
        onClick={() => setCompanyTab('Overview')}
      >
        🏠 Overview
      </button>

      <button
        className={companyTab === 'Find Students' ? 'active-menu' : ''}
        onClick={() => setCompanyTab('Find Students')}
      >
        👥 Find Students
      </button>

      <button
        className={companyTab === 'Job Opportunities' ? 'active-menu' : ''}
        onClick={() => setCompanyTab('Job Opportunities')}
      >
        💼 Job Opportunities
      </button>

      <button
        className={companyTab === 'Recruitment' ? 'active-menu' : ''}
        onClick={() => setCompanyTab('Recruitment')}
      >
        📊 Recruitment
      </button>

      <button
        className={companyTab === 'Company Profile' ? 'active-menu' : ''}
        onClick={() => setCompanyTab('Company Profile')}
      >
        🏢 Company Profile
      </button>

      
<button
  className={companyTab === 'Applications Received' ? 'active-menu' : ''}
  onClick={() => setCompanyTab('Applications Received')}
>
  📥 Applications Received
</button>


      <button
        className={companyTab === 'Notifications' ? 'active-menu' : ''}
        onClick={() => setCompanyTab('Notifications')}
      >
        🔔 Notifications
      </button>

      
<button
  className="company-logout"
  onClick={() => {
    setLoginEmail('')
    setLoginPassword('')
    setCompanyProfile({
      name: '',
      email: '',
      industry: '',
      website: '',
      location: '',
      description: '',
      hrContact: '',
      phone: '',
    })
    setCompanyProfileMessage('')
    setUserRole('')
    setCompanyTab('Overview')
    setStudentTab('Overview')
    setMessage('')
    setPage('home')
  }}
>
  🚪 Logout
</button>

    </aside>

    <main className="company-main">
    
{companyTab === 'Overview' && (
  <>
    <div className="company-greeting">
      <div>
        <p className="greeting-label">COMPANY WORKSPACE</p>
        <h1>Welcome back, Recruiter! 👋</h1>
        <p>
          Your next great hire could be just one click away.
          Manage opportunities, discover talented students, and
          build your future team with PlaceTrack.
        </p>
        <button onClick={() => setCompanyTab('Job Opportunities')}>
          + Post an Opportunity
        </button>
      </div>
      <div className="greeting-illustration">🚀</div>
    </div>

    <div className="overview-heading">
      <div>
        <h2>Your Recruitment Overview</h2>
        <p>Everything you need to manage campus hiring.</p>
      </div>
    </div>

    <div className="dashboard-grid">
      <div className="dashboard-card">
        <div className="card-icon">💼</div>
        <h3>Job Opportunities</h3>
        <p>Publish jobs and internships for students.</p>
        <button onClick={() => setCompanyTab('Job Opportunities')}>
          Manage Opportunities →
        </button>
      </div>

      <div className="dashboard-card">
        <div className="card-icon">👥</div>
        <h3>Find Students</h3>
        <p>Explore student profiles and qualifications.</p>
        <button onClick={() => setCompanyTab('Find Students')}>
          Explore Students →
        </button>
      </div>

      <div className="dashboard-card">
        <div className="card-icon">📊</div>
        <h3>Recruitment</h3>
        <p>Review applications and manage selection.</p>
        <button onClick={() => setCompanyTab('Recruitment')}>
          View Recruitment →
        </button>
      </div>
    </div>

    <div className="company-welcome-card overview-activity">
      <h3>✨ Make your next move</h3>
      <p>
        Start by posting an opportunity, exploring student profiles,
        or reviewing applications. Your recruitment workspace is
        ready when you are.
      </p>
      <div className="overview-quick-actions">
        <button onClick={() => setCompanyTab('Company Profile')}>
          🏢 Complete Company Profile
        </button>
        <button onClick={() => setCompanyTab('Analytics')}>
          📈 Explore Analytics
        </button>
      </div>
    </div>
  </>
)}


      {companyTab === 'Find Students' && (
        <>
          <h1>👥 Find Students</h1>
          <p>Search student profiles and academic qualifications.</p>
          
        </>
      )}

  
{companyTab === 'Recruitment' && (
  <>
    <div className="overview-heading">
      <div>
        <h1>📊 Recruitment Management</h1>
        <p>Shortlist candidates, schedule interviews, and manage final results.</p>
      </div>

      <button onClick={loadCompanyApplications}>
        🔄 Refresh Candidates
      </button>
    </div>

    <div className="company-welcome-card">
      <h3>🎯 Your Recruitment Pipeline</h3>
      <p>
        Review applications and update each candidate's progress
        throughout the selection process.
      </p>
    </div>

    {applicationsLoading && <p>Loading candidates...</p>}

    {applicationsError && (
      <p className="error-message">{applicationsError}</p>
    )}

    {!applicationsLoading &&
      !applicationsError &&
      companyApplications.length === 0 && (
        <div className="company-welcome-card">
          <h3>No candidates yet</h3>
          <p>Student applications will appear here when they apply.</p>
        </div>
      )}

    {!applicationsLoading && companyApplications.length > 0 && (
      <div className="dashboard-grid">
        {companyApplications.map((application) => {
          const student = students.find(
            (item) =>
              (item.email || '').trim().toLowerCase() ===
              (application.studentEmail || '').trim().toLowerCase()
          );

          const status = application.status || 'Applied';

          return (
            <div className="dashboard-card recruitment-card" key={application.id}>
              <div className="card-icon">🎓</div>

              <h3>{student?.name || 'Student Applicant'}</h3>

              <p>
                <strong>Email:</strong> {application.studentEmail}
              </p>

              <p>
                <strong>Job Role:</strong> {application.jobTitle}
              </p>

              <p>
                <strong>Company:</strong> {application.companyName}
              </p>

              <p>
                <strong>Current Status:</strong>{' '}
                <span className="recruitment-status">{status}</span>
              </p>

              <div className="recruitment-actions">
                <button
                  onClick={() =>
                    updateRecruitmentStatus(application, 'Shortlisted')
                  }
                >
                  ⭐ Shortlist
                </button>

                
                <button onClick={() => openInterviewForm(application)}>
                 📅 Schedule Interview
                </button>


                <button
                  onClick={() =>
                    updateRecruitmentStatus(application, 'Selected')
                  }
                >
                  🏆 Select
                </button>

                <button
                  onClick={() =>
                    updateRecruitmentStatus(application, 'Rejected')
                  }
                >
                  ❌ Reject
                </button>
              </div>
              
            
{interviewForm.applicationId === application.id && (
  <form
    className="recruitment-interview-form"
    onSubmit={saveInterviewDetails}
  >
    <h4>📅 Schedule Candidate Interview</h4>

    <label>Interview Date & Time</label>
    <input
      type="datetime-local"
      value={interviewForm.interviewDateTime}
      onChange={(event) =>
        setInterviewForm((previous) => ({
          ...previous,
          interviewDateTime: event.target.value,
        }))
      }
      required
    />

    <label>Interview Mode</label>
    <select
      value={interviewForm.interviewMode}
      onChange={(event) =>
        setInterviewForm((previous) => ({
          ...previous,
          interviewMode: event.target.value,
        }))
      }
    >
      <option value="Online">Online</option>
      <option value="Offline">Offline</option>
    </select>

    <label>Interview Location</label>
    <input
      type="text"
      value={interviewForm.interviewLocation}
      onChange={(event) =>
        setInterviewForm((previous) => ({
          ...previous,
          interviewLocation: event.target.value,
        }))
      }
      placeholder="Office address or meeting platform"
    />

    <label>Meeting Link (for online interviews)</label>
    <input
      type="url"
      value={interviewForm.interviewLink}
      onChange={(event) =>
        setInterviewForm((previous) => ({
          ...previous,
          interviewLink: event.target.value,
        }))
      }
      placeholder="https://..."
    />

    <label>Recruiter Notes</label>
    <textarea
      value={interviewForm.recruiterNotes}
      onChange={(event) =>
        setInterviewForm((previous) => ({
          ...previous,
          recruiterNotes: event.target.value,
        }))
      }
      placeholder="Interview instructions or notes"
      rows={3}
    />

    <button type="submit">💾 Save Interview Details</button>

    <button
      type="button"
      onClick={() => {
        setInterviewForm((previous) => ({
          ...previous,
          applicationId: null,
        }))
        setInterviewMessage('')
      }}
    >
      Cancel
    </button>

    {interviewMessage && <p>{interviewMessage}</p>}
  </form>
)}


              <div className="recruitment-interview-details">
                <h4>Interview Details</h4>

                <p>
                  <strong>Date & Time:</strong>{' '}
                  {application.interviewDateTime
                    ? new Date(application.interviewDateTime).toLocaleString()
                    : 'Not scheduled'}
                </p>

                {application.interviewMode && (
                  <p>
                    <strong>Mode:</strong> {application.interviewMode}
                  </p>
                )}

                {application.interviewLocation && (
                  <p>
                    <strong>Location:</strong> {application.interviewLocation}
                  </p>
                )}

                {application.interviewLink && (
                  <p>
                    <strong>Meeting Link:</strong>{' '}
                    <a
                      href={application.interviewLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Join Interview
                    </a>
                  </p>
                )}

                {application.recruiterNotes && (
                  <p>
                    <strong>Recruiter Notes:</strong>{' '}
                    {application.recruiterNotes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </>
)}


{companyTab === 'Company Profile' && (
  <>
    <h1>🏢 Company Profile</h1>
    <p>Manage your company information and recruiter details.</p>

    <div className="company-welcome-card">
      <h3>Company Information</h3>
      <p>Keep your profile updated so students can learn about your company.</p>

      <form onSubmit={saveCompanyProfile} className="company-profile-form">
        <div className="company-profile-grid">
          <div className="company-form-field">
            <label htmlFor="companyName">Company Name</label>
            <input
              id="companyName"
              name="name"
              value={companyProfile.name}
              onChange={handleCompanyProfileChange}
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="company-form-field">
            <label htmlFor="companyEmail">Company Email</label>
            <input
              id="companyEmail"
              name="email"
              type="email"
              value={companyProfile.email || loginEmail}
              readOnly
            />
          </div>

          <div className="company-form-field">
            <label htmlFor="companyIndustry">Industry</label>
            <input
              id="companyIndustry"
              name="industry"
              value={companyProfile.industry}
              onChange={handleCompanyProfileChange}
              placeholder="e.g. Information Technology"
            />
          </div>

          <div className="company-form-field">
            <label htmlFor="companyWebsite">Website</label>
            <input
              id="companyWebsite"
              name="website"
              type="url"
              value={companyProfile.website}
              onChange={handleCompanyProfileChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="company-form-field">
            <label htmlFor="companyLocation">Location</label>
            <input
              id="companyLocation"
              name="location"
              value={companyProfile.location}
              onChange={handleCompanyProfileChange}
              placeholder="City, State"
            />
          </div>

          <div className="company-form-field">
            <label htmlFor="companyPhone">Phone Number</label>
            <input
              id="companyPhone"
              name="phone"
              type="tel"
              value={companyProfile.phone}
              onChange={handleCompanyProfileChange}
              placeholder="Enter contact number"
            />
          </div>

          <div className="company-form-field">
            <label htmlFor="companyHrContact">HR Contact</label>
            <input
              id="companyHrContact"
              name="hrContact"
              value={companyProfile.hrContact}
              onChange={handleCompanyProfileChange}
              placeholder="HR name or contact person"
            />
          </div>
        </div>

        <div className="company-form-field company-description-field">
          <label htmlFor="companyDescription">Company Description</label>
          <textarea
            id="companyDescription"
            name="description"
            value={companyProfile.description}
            onChange={handleCompanyProfileChange}
            placeholder="Tell students about your company, work culture, and opportunities..."
            rows={5}
          />
        </div>

        <button type="submit" disabled={companyProfileLoading}>
          {companyProfileLoading ? 'Please wait...' : 'Save Company Profile'}
        </button>

        {companyProfileMessage && (
          <p role="status">{companyProfileMessage}</p>
        )}
      </form>
    </div>
  </>
)}

{companyTab === 'Find Students' && (
  <>

    <div className="company-welcome-card">
      <h3>🔎 Search Student Profiles</h3>
      <p>Search by student name or filter by branch.</p>

      <div className="company-profile-grid">
        <div className="company-form-field">
          <label>Search by Name</label>
          <input
            type="text"
            placeholder="Enter student name..."
            value={studentSearch}
            onChange={(event) => setStudentSearch(event.target.value)}
          />
        </div>

        <div className="company-form-field">
          <label>Filter by Branch</label>
          <select
            value={branchFilter}
            onChange={(event) => setBranchFilter(event.target.value)}
          >
            <option value="All">All Branches</option>
            {[...new Set(students.map((student) => student.branch).filter(Boolean))]
              .sort()
              .map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>

    <div className="dashboard-grid">
      {students
        .filter((student) =>
          (student.name || '')
            .toLowerCase()
            .includes(studentSearch.trim().toLowerCase())
        )
        .filter((student) =>
          branchFilter === 'All' || student.branch === branchFilter
        )
        .map((student) => (
          <div className="dashboard-card" key={student.id}>
            <div className="card-icon">🎓</div>
            <h3>{student.name || 'Student'}</h3>
            <p>Branch: {student.branch || 'Not provided'}</p>
            <p>CGPA: {student.cgpa ?? 'Not provided'}</p>
            <p>
              Graduation Year: {student.graduationYear ?? 'Not provided'}
            </p>
          </div>
        ))}
    </div>

    {students.length === 0 && (
      <div className="company-welcome-card">
        <h3>No student profiles found yet</h3>
        <p>Student profiles will appear here once they are saved.</p>
      </div>
    )}

    {students.length > 0 &&
      students.filter((student) =>
        (student.name || '')
          .toLowerCase()
          .includes(studentSearch.trim().toLowerCase())
      ).filter((student) =>
        branchFilter === 'All' || student.branch === branchFilter
      ).length === 0 && (
        <div className="company-welcome-card">
          <h3>No matching students</h3>
          <p>Try another name or select a different branch.</p>
        </div>
      )}
  </>
)}

{companyTab === 'Job Opportunities' && (
  <>
    <div className="overview-heading">
      <div>
        <h1>💼 Job Opportunities</h1>
        <p>Post and manage campus recruitment opportunities.</p>
      </div>
    </div>

    <div className="company-welcome-card">
      <h3>➕ Post a New Opportunity</h3>
      <p>
        Share job openings with eligible students through PlaceTrack.
      </p>

      <form className="company-profile-form" onSubmit={postJob}>
        <div className="company-profile-grid">
          <div className="company-form-field">
            
<label>Job Role</label>
<input
  type="text"
  name="role"
  placeholder="e.g. Graduate Engineer Trainee"
  value={jobForm.role}
  onChange={handleJobChange}
  required
/>

          </div>

          <div className="company-form-field">
            
<label>Company Name</label>
<input
  type="text"
  name="companyName"
  placeholder="Enter company name"
  value={jobForm.companyName}
  onChange={handleJobChange}
  required
/>

          </div>

          <div className="company-form-field">
            
<label>Job Location</label>
<input
  type="text"
  name="location"
  placeholder="e.g. Hyderabad"
  value={jobForm.location}
  onChange={handleJobChange}
  required
/>

          </div>

          <div className="company-form-field">
            
<label>Annual Package (LPA)</label>
<input
  type="number"
  name="packageAmount"
  min="0"
  step="0.1"
  placeholder="e.g. 6"
  value={jobForm.packageAmount}
  onChange={handleJobChange}
  required
/>

          </div>

          <div className="company-form-field">
            
<label>Minimum CGPA</label>
<input
  type="number"
  name="eligibilityCgpa"
  min="0"
  max="10"
  step="0.1"
  placeholder="e.g. 7.0"
  value={jobForm.eligibilityCgpa}
  onChange={handleJobChange}
  required
/>

          </div>

          <div className="company-form-field">
            
<label>Job Type</label>
<select
  name="jobType"
  value={jobForm.jobType}
  onChange={handleJobChange}
>
  <option>Full-time</option>
  <option>Internship</option>
</select>

          </div>
        </div>

        <button type="submit">
          Post Opportunity
        </button>
      </form>
    </div>

    
<div className="company-welcome-card">
  <h3>📋 Your Posted Opportunities</h3>

  {jobMessage && <p>{jobMessage}</p>}

  {postedJobs.length === 0 ? (
    <p>No job opportunities posted yet.</p>
  ) : (
    <div className="company-profile-grid">
      {postedJobs.map((job) => (
        <div className="company-welcome-card" key={job.id}>
          <h3>{job.role}</h3>
          <p><strong>Company:</strong> {job.companyName}</p>
          <p><strong>Location:</strong> {job.location}</p>
          <p><strong>Package:</strong> {job.packageAmount} LPA</p>
          <p><strong>Minimum CGPA:</strong> {job.eligibilityCgpa}</p>
          <p><strong>Job Type:</strong> {job.jobType}</p>
        </div>
      ))}
    </div>
  )}
</div>

  </>
)}

{companyTab === 'Applications Received' && (
  <>
    <div className="overview-heading">
      <div>
        <h1>📥 Applications Received</h1>
        <p>View students who have applied for your opportunities.</p>
      </div>

      <button onClick={loadCompanyApplications}>
        🔄 Refresh Applications
      </button>
    </div>

    {applicationsLoading && (
      <div className="company-welcome-card">
        <p>Loading applications...</p>
      </div>
    )}

    {applicationsError && (
      <div className="company-welcome-card">
        <p role="alert">{applicationsError}</p>
      </div>
    )}

    {!applicationsLoading &&
      !applicationsError &&
      companyApplications.length === 0 && (
        <div className="company-welcome-card">
          <h3>📭 No applications found</h3>
          <p>
            Applications for your company will appear here
            when students apply for your opportunities.
          </p>
        </div>
      )}

    {!applicationsLoading && companyApplications.length > 0 && (
      <>
        <div className="company-welcome-card">
          <h3>
            Total Applications: {companyApplications.length}
          </h3>
        </div>

        <div className="dashboard-grid">
          {companyApplications.map((application) => {
            const student = students.find(
              (item) =>
                (item.email || '').trim().toLowerCase() ===
                (application.studentEmail || '').trim().toLowerCase()
            )

            return (
              <div
                className="dashboard-card"
                key={application.id}
              >
                <div className="card-icon">🎓</div>

                <h3>{student?.name || 'Student Applicant'}</h3>

                <p>
                  <strong>Email:</strong>{' '}
                  {application.studentEmail || 'Not provided'}
                </p>

                <p>
                  <strong>Job Role:</strong>{' '}
                  {application.jobTitle || 'Not provided'}
                </p>

                <p>
                  <strong>Application Type:</strong>{' '}
                  {application.applicationType || 'Not provided'}
                </p>

                <p>
                  <strong>Status:</strong>{' '}
                  {application.status || 'Applied'}
                </p>
              </div>
            )
          })}
        </div>
      </>
    )}
  </>
)}

      {companyTab === 'Notifications' && (
        <>
          <h1>🔔 Notifications</h1>
          <p>Keep track of important recruitment updates.</p>
          <div className="company-welcome-card">
            <h3>Your Notifications</h3>
            <p>
              Application alerts and interview reminders will appear here
              when we implement notifications.
            </p>
          </div>
        </>
      )}
    </main>
  </section>
)}
 
      {page === 'admin-dashboard' && (
        <section className="company-layout">
          <aside className="company-sidebar">
            <h2>🎓 PlaceTrack</h2>
            <p className="sidebar-subtitle">Admin Portal</p>

            {['Overview', 'Students', 'Jobs', 'Applications'].map((tab) => (
              <button
                key={tab}
                className={adminTab === tab ? 'active-menu' : ''}
                onClick={() => {
                  setAdminTab(tab)
                  if (tab === 'Students') loadStudents()
                  if (tab === 'Jobs') loadPostedJobs()
                  if (tab === 'Applications') loadAdminApplications()
                }}
              >
                {tab === 'Overview' && '🏠 '}
                {tab === 'Students' && '👥 '}
                {tab === 'Jobs' && '💼 '}
                {tab === 'Applications' && '📋 '}
                {tab}
              </button>
            ))}

            <button
              className="company-logout"
              onClick={() => {
                setLoginEmail('')
                setLoginPassword('')
                setUserRole('')
                setAdminTab('Overview')
                setPage('home')
              }}
            >
              🚪 Logout
            </button>
          </aside>

          <main className="company-main">
            {adminTab === 'Overview' && (
              <>
                <div className="company-greeting">
                  <div>
                    <p className="greeting-label">ADMIN WORKSPACE</p>
                    <h1>Welcome to PlaceTrack 👋</h1>
                    <p>Monitor students, job opportunities, and applications.</p>
                  </div>
                  <div className="greeting-illustration">📊</div>
                </div>

                <div className="overview-heading">
                  <div>
                    <h2>Placement Overview</h2>
                    <p>Live totals from your backend records.</p>
                  </div>
                  <button
                    onClick={() => {
                      loadStudents()
                      loadPostedJobs()
                      loadAdminApplications()
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>

                <div className="dashboard-grid">
                  <div className="dashboard-card">
                    <div className="card-icon">👥</div>
                    <h3>Total Students</h3>
                    <p>{students.length}</p>
                  </div>

                  <div className="dashboard-card">
                    <div className="card-icon">💼</div>
                    <h3>Posted Jobs</h3>
                    <p>{postedJobs.length}</p>
                  </div>

                  <div className="dashboard-card">
                    <div className="card-icon">📋</div>
                    <h3>Applications</h3>
                    <p>{adminApplications.length}</p>
                  </div>
                </div>

                
<div className="admin-charts-grid">
  <div className="company-welcome-card admin-chart-card">
    <h3>📊 Record Distribution</h3>
    <p className="admin-chart-subtitle">
      Students, jobs and applications
    </p>

    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={adminOverviewData}
          dataKey="count"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={48}
          paddingAngle={3}
        >
          {adminOverviewData.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>

  <div className="company-welcome-card admin-chart-card">
    <h3>📈 Application Statistics</h3>
    <p className="admin-chart-subtitle">
      Applications by status
    </p>

    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={applicationStatusData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar
          dataKey="count"
          name="Applications"
          fill="#6366f1"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

                <div className="company-welcome-card">
                  <h3>⚡ Quick Actions</h3>
                  <div className="overview-quick-actions">
                    <button onClick={() => setAdminTab('Students')}>
                      👥 View Students
                    </button>
                    <button onClick={() => setAdminTab('Jobs')}>
                      💼 View Jobs
                    </button>
                    <button
                      onClick={() => {
                        setAdminTab('Applications')
                        loadAdminApplications()
                      }}
                    >
                      📋 View Applications
                    </button>
                  </div>
                </div>
              </>
            )}

            {adminTab === 'Students' && (
              <>
                <h1>👥 Registered Students</h1>
                <button onClick={loadStudents}>🔄 Refresh Students</button>

                {students.length === 0 ? (
                  <p>No student records found.</p>
                ) : (
                  <div className="dashboard-grid">
                    {students.map((student, index) => (
                      <div
                        className="dashboard-card"
                        key={student.id ?? student.email ?? index}
                      >
                        <h3>{student.name || 'Student'}</h3>
                        <p>Email: {student.email || 'Not provided'}</p>
                        <p>Branch: {student.branch || 'Not provided'}</p>
                        <p>CGPA: {student.cgpa ?? 'Not provided'}</p>
                        <p>
                          Graduation Year:{' '}
                          {student.graduationYear ?? 'Not provided'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {adminTab === 'Jobs' && (
              <>
                <h1>💼 Posted Jobs</h1>
                <button onClick={loadPostedJobs}>🔄 Refresh Jobs</button>

                {postedJobs.length === 0 ? (
                  <p>No job opportunities found.</p>
                ) : (
                  <div className="dashboard-grid">
                    {postedJobs.map((job, index) => (
                      <div
                        className="dashboard-card"
                        key={job.id ?? index}
                      >
                        <h3>{job.role}</h3>
                        <p>Company: {job.companyName}</p>
                        <p>Location: {job.location}</p>
                        <p>Package: {job.packageAmount} LPA</p>
                        <p>Minimum CGPA: {job.eligibilityCgpa}</p>
                        <p>Type: {job.jobType}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {adminTab === 'Applications' && (
              <>
                <h1>📋 All Applications</h1>
                <button onClick={loadAdminApplications}>
                  🔄 Refresh Applications
                </button>

                {adminApplicationsError && (
                  <p role="alert">{adminApplicationsError}</p>
                )}

                {!adminApplicationsError &&
                  adminApplications.length === 0 && (
                    <p>No applications found.</p>
                  )}

                <div className="dashboard-grid">
                  {adminApplications.map((application, index) => (
                    <div
                      className="dashboard-card"
                      key={application.id ?? index}
                    >
                      <h3>{application.jobTitle || 'Job Application'}</h3>
                      <p>
                        Student: {application.studentEmail || 'Not provided'}
                      </p>
                      <p>
                        Company: {application.companyName || 'Not provided'}
                      </p>
                      <p>
                        Type: {application.applicationType || 'Not provided'}
                      </p>
                      <p>Status: {application.status || 'Applied'}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </main>
        </section>
      )}

      
{page === 'login' && (
  <section className="login-split-layout">
    {/* LEFT SIDE: LOGIN FORM */}
    <div className="login-form-panel">
      <div className="login-brand">
        <h1>PlaceTrack</h1>
        <p>Track. Apply. Get Placed.</p>
      </div>

      <h2>Welcome Back 👋</h2>
      <p>Login to your PlaceTrack account.</p>

      <form
        onSubmit={async (event) => {
          event.preventDefault()
          setMessage('')

          try {
            const response = await fetch(
              'http://localhost:8080/auth/login',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: loginEmail,
                  password: loginPassword,
                }),
              }
            )

            const data = await response.json()

            if (!response.ok) {
              setMessage(data.message || 'Invalid email or password.')
              return
            }

            setUserRole(data.role)

            if (data.role === 'STUDENT') {
              try {
                const profileResponse = await fetch(
                  'http://localhost:8080/student/get'
                )

                if (profileResponse.ok) {
                  const allStudents = await profileResponse.json()

                  const existingProfile = allStudents.find(
                    (student) =>
                      student.email?.toLowerCase() ===
                      loginEmail.trim().toLowerCase()
                  )

                  if (existingProfile) {
                    setRegisterName(existingProfile.name || '')
                    setProfileEmail(existingProfile.email || '')
                    setProfilePhone(existingProfile.phone || '')
                    setProfileBranch(existingProfile.branch || '')
                    setProfileCgpa(
                      existingProfile.cgpa != null
                        ? String(existingProfile.cgpa)
                        : ''
                    )
                    setProfileGraduationYear(
                      existingProfile.graduationYear != null
                        ? String(existingProfile.graduationYear)
                        : ''
                    )
                  }
                }
              } catch (error) {
                console.error('Error loading student profile:', error)
              }

              await loadStudentApplications(loginEmail.trim())
              setPage('student-dashboard')
            } else if (data.role === 'COMPANY') {
              setPage('company-dashboard')
            } else if (data.role === 'ADMIN') {
              setPage('admin-dashboard')
            } else {
              setMessage(
                'Login successful, but this role has no dashboard yet.'
              )
            }
          } catch {
            setMessage(
              'Cannot connect to the server. Check your backend.'
            )
          }
        }}
      >
        <label htmlFor="loginEmail">Email address</label>
        <input
          id="loginEmail"
          type="email"
          placeholder="Enter your email"
          value={loginEmail}
          onChange={(event) => setLoginEmail(event.target.value)}
          required
        />

        <label htmlFor="loginPassword">Password</label>
        <input
          id="loginPassword"
          type="password"
          placeholder="Enter your password"
          value={loginPassword}
          onChange={(event) => setLoginPassword(event.target.value)}
          required
        />

        <button type="submit">Login →</button>
      </form>

      {message && <p role="status">{message}</p>}

      <p
        className="auth-switch-text"
        onClick={() => {
          setMessage('')
          setPage('register')
        }}
      >
        Don't have an account?
      </p>

      <button
        type="button"
        onClick={() => {
          setMessage('')
          setPage('register')
        }}
      >
        Create an account
      </button>

      <button
        type="button"
        className="secondary-button"
        onClick={() => {
          setMessage('')
          setPage('home')
        }}
      >
        Back to Home
      </button>
    </div>

    {/* RIGHT SIDE: PLACEMENT IMAGE */}
    <div className="login-image-panel">
      <img
        src="/placetrack-login.png"
        alt="Students collaborating on a laptop"
      />

      <div className="login-image-content">
        <h2>
          Build Your Career with PlaceTrack
        </h2>
        <p>
          Connect with top companies, apply for your dream jobs,
          and build your future.
        </p>
      </div>
    </div>
  </section>

)}

      {page === 'register' && (
  <section className="auth-card">
    <h2>Create Your Account ✨</h2>
    <p>Join PlaceTrack and explore placement opportunities.</p>

    <form
      onSubmit={async (event) => {
        event.preventDefault()
        setMessage('')

        try {
          const response = await fetch('http://localhost:8080/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: registerEmail,
              password: registerPassword,
              role: registerRole,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            setMessage(data.message || 'Registration failed. Please try again.')
            return
          }

          setMessage('Registration successful! You can now log in.')
          setRegisterPassword('')
        } catch {
          setMessage('Cannot connect to the server. Check your backend.')
        }
      }}
    >
      <label htmlFor="registerEmail">Email address</label>
      <input
        id="registerEmail"
        type="email"
        placeholder="Enter your email"
        value={registerEmail}
        onChange={(event) => setRegisterEmail(event.target.value)}
        required
      />

      <label htmlFor="registerPassword">Password</label>
      <input
        id="registerPassword"
        type="password"
        placeholder="Create a password"
        value={registerPassword}
        onChange={(event) => setRegisterPassword(event.target.value)}
        required
      />

      <label htmlFor="registerRole">Register as</label>
      <select
        id="registerRole"
        value={registerRole}
        onChange={(event) => setRegisterRole(event.target.value)}
      >
        <option value="STUDENT">Student</option>
        <option value="COMPANY">Company / Recruiter</option>
      </select>

      <button type="submit">Create Account →</button>
    </form>

    {message && <p role="status">{message}</p>}

    <p
  className="auth-switch-text"
  onClick={() => {
    setMessage('')
    setPage('login')
  }}
>
  Already have an account?
</p>
    <button
  type="button"
  onClick={() => {
    console.log('LOGIN BUTTON CLICKED')
    setMessage('')
    setPage('login')
  }}
>
  Login
</button>

    <button className="secondary-button" onClick={() => {
      setMessage('')
      setPage('home')
    }}>
      Back to Home
    </button>
  </section>
)}


      <footer className="footer">
        <p>PlaceTrack | Placement Management System</p>
        <p>Built with React · Powered by Spring Boot</p>
      </footer>
    </div>
  )
}

export default App