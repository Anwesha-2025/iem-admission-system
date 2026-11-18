import React, { createContext, useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { GraduationCap, Eye as EyeIcon, EyeOff, Mail, KeyRound, ArrowLeft, LayoutDashboard, FileText, CreditCard, LogOut, Menu, X, Search, CheckCircle, Clock, AlertCircle, Upload, Eye, Printer, ShieldCheck, Users, ArrowRight } from "lucide-react";
import api, { assetUrl } from "./api";
import Landing from "./Landing";
import Logo from "./Logo";

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true);
  useEffect(() => { if (localStorage.getItem("iem_token")) api.get("/auth/me").then(r=>setUser(r.data.user)).catch(()=>localStorage.removeItem("iem_token")).finally(()=>setLoading(false)); else setLoading(false); }, []);
  const login = async (data) => { const r = await api.post("/auth/login", data); localStorage.setItem("iem_token",r.data.token); setUser(r.data.user); return r.data.user; };
  const register = async (data) => { const r = await api.post("/auth/register", data); localStorage.setItem("iem_token",r.data.token); setUser(r.data.user); return r.data.user; };
  const logout = () => { localStorage.removeItem("iem_token"); setUser(null); };
  return <AuthContext.Provider value={{user,loading,login,register,logout}}>{children}</AuthContext.Provider>;
}
function Protected({children, admin=false}) { const {user,loading}=useAuth(); if(loading)return <Loading/>; if(!user)return <Navigate to={admin?"/admin-login":"/login"} replace/>; if(admin && user.role!=="admin")return <Navigate to="/dashboard" replace/>; if(!admin && user.role==="admin")return <Navigate to="/admin" replace/>; return children; }
function Loading(){return <div className="loading">Loading your portal...</div>}
function Layout({children}) {
 const {user,logout}=useAuth(), [open,setOpen]=useState(false), loc=useLocation();
 const links=user?.role==="admin"?[{to:"/admin",label:"Dashboard",icon:LayoutDashboard},{to:"/admin/applications",label:"Applications",icon:Users}]:[{to:"/dashboard",label:"Dashboard",icon:LayoutDashboard},{to:"/application",label:"Admission Form",icon:FileText},{to:"/payment",label:"Fee Payment",icon:CreditCard}];
 return <div className="app-shell"><aside className={`sidebar ${open?"show":""}`}><div className="brand"><div className="brand-logo"><Logo height={46}/></div><div><b>IEM</b><small>ADMISSION PORTAL</small></div><button className="mobile-close" onClick={()=>setOpen(false)}><X/></button></div><div className="side-label">WORKSPACE</div><nav>{links.map(x=><Link key={x.to} to={x.to} onClick={()=>setOpen(false)} className={loc.pathname===x.to?"active":""}><x.icon size={18}/>{x.label}</Link>)}</nav><div className="sidebar-bottom"><div className="secure"><ShieldCheck size={17}/><span>Secure student portal</span></div><button className="logout" onClick={logout}><LogOut size={17}/>Sign out</button></div></aside>{open&&<div className="scrim" onClick={()=>setOpen(false)}/>}<main className="main"><header className="topbar"><button className="menu-btn" onClick={()=>setOpen(true)}><Menu/></button><div className="crumb">Institute of Engineering & Management <span>/</span> {user?.role==="admin"?"Administration":"Student Portal"}</div><div className="profile"><div className="avatar">{user?.name?.[0]?.toUpperCase()}</div><div><b>{user?.name}</b><small>{user?.role==="admin"?"Administrator":"Student"}</small></div></div></header><div className="content">{children}</div><footer>© {new Date().getFullYear()} Institute of Engineering & Management · Admission Management System</footer></main></div>
}
function Notice({message,type="success",onClose}) { if(!message)return null; return <div className={`notice ${type}`}><span>{message}</span>{onClose&&<button onClick={onClose}>×</button>}</div>; }
function PageTitle({eyebrow,title,subtitle,action}) {return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>}
function Status({status}) {const cls=status?.toLowerCase().replaceAll(" ","-")||"draft";return <span className={`status ${cls}`}>{status||"Draft"}</span>}
const emailMessage=v=>{
  v=(v||"").trim();
  if(!v.includes("@"))return /\.[a-z]{2,}$/i.test(v)?"'@' is missing in the email address.":"'@gmail.com' is missing in the email address.";
  const [local,domain]=v.split("@");
  if(!local)return "Enter the part before '@' (for example anu@gmail.com).";
  if(!domain)return "Add the domain after '@' (for example @gmail.com).";
  return "Enter a valid email address.";
};
const emailProps=()=>({onInvalid:e=>e.target.setCustomValidity(emailMessage(e.target.value)),onInput:e=>e.target.setCustomValidity("")});
const isValidEmail = value => {
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value.trim());
};
const passwordRules = password => ({
  length: password.length >= 8,
  alphanumeric:
    /[A-Za-z]/.test(password) && /\d/.test(password),
  special: /[^A-Za-z0-9\s]/.test(password)
});

const isStrongPassword = password =>
  Object.values(passwordRules(password)).every(Boolean);

function PasswordStrength({ password }) {
  if (!password) return null;

  const rules = passwordRules(password);

  const items = [
    ["length", "At least 8 characters"],
    ["alphanumeric", "Contains both letters and numbers"],
    ["special", "Contains at least one special character (@, #, $)"]
  ];

  const strong = isStrongPassword(password);

  return (
    <div className="password-strength" aria-live="polite">
      {strong ? (
        <b className="strength-good">✓ Strong Password</b>
      ) : (
        <>
          <b className="strength-bad">
            Weak Password – Suggestions:
          </b>

          {items.map(([key, label]) => (
            <div
              key={key}
              className={rules[key] ? "strength-good" : "strength-bad"}
            >
              <span>{rules[key] ? "✓" : "✕"}</span>
              {label}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function PasswordInput({value,onChange,name="password",placeholder="Minimum 8 characters",minLength=8,autoComplete="current-password"}){
 const [show,setShow]=useState(false);
 return <div className="pw-wrap"><input type={show?"text":"password"} name={name} value={value} onChange={onChange} required minLength={minLength} placeholder={placeholder} autoComplete={autoComplete}/><button type="button" className="pw-eye" onClick={()=>setShow(v=>!v)} aria-label={show?"Hide password":"Show password"} title={show?"Hide password":"Show password"}>{show?<EyeOff size={18}/>:<EyeIcon size={18}/>}</button></div>
}
function AuthShell({admin=false,children}){
 return <div className="auth-page"><div className="auth-left"><Link to="/" className="auth-logo-card" title="Back to home"><Logo height={150}/></Link><div className="auth-copy"><div className="eyebrow light">INSTITUTE OF ENGINEERING & MANAGEMENT</div>{admin?<><h1>Admissions<br/>administration.</h1><p>Review applications, verify documents and manage admission decisions securely.</p><div className="auth-points"><span><ShieldCheck/> Restricted administrator access</span><span><CheckCircle/> Review &amp; approve applications</span><span><Users/> Manage applicant records</span></div></>:<><h1>Your future<br/>starts here.</h1><p>A single, secure place to apply, submit documents and follow your admission journey.</p><div className="auth-points"><span><CheckCircle/> Simple online application</span><span><CheckCircle/> Track your application status</span><span><CheckCircle/> Secure document submission</span></div></>}</div><div className="auth-foot">Kolkata · West Bengal</div></div><div className="auth-right"><div className="auth-form-wrap">{children}</div></div></div>
}
function LoginPage({register=false,admin=false}) {
 const {login,register:signup,user}=useAuth(),nav=useNavigate(),[form,setForm]=useState({name:"",email:"",phone:"",address:"",password:""}),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const [emailWarning, setEmailWarning] = useState("");
 if(user)return <Navigate to={user.role==="admin"?"/admin":"/dashboard"}/>;
 const change=e=>setForm({...form,[e.target.name]:e.target.value});
 const submit=async e=>{e.preventDefault();setError("");setBusy(true);try{const u=register?await signup(form):await login({email:form.email,password:form.password,role:admin?"admin":"student"});nav(u.role==="admin"?"/admin":"/dashboard");}catch(err){setError(err.response?.data?.message||"Unable to continue. Please try again.");}finally{setBusy(false)}};
 return <AuthShell admin={admin}>
  <div className="eyebrow">{register?"CREATE YOUR ACCOUNT":admin?"ADMINISTRATOR ACCESS":"WELCOME BACK"}</div>
  <h2>{register?"Student registration":admin?"Admin sign in":"Sign in to your account"}</h2>
  <p className="muted">{register?"Create an account to begin your admission application.":admin?"Enter your administrator credentials to open the admissions dashboard.":"Enter your credentials to access the admission portal."}</p>
  <Notice type="error" message={error}/>
  <form onSubmit={submit} className="form-stack">
   {register&&<Field label="Full name"><input name="name" value={form.name} onChange={change} required maxLength="200" placeholder="Enter your full name"/></Field>}
   
<Field label="Email address">
  <input
    type="email"
    name="email"
    value={form.email}
    onChange={e => {
      change(e);
      setEmailWarning("");
    }}
    onBlur={e => {
      const value = e.target.value.trim();

      if (value && !isValidEmail(value)) {
        setEmailWarning(
          "Please enter a valid email address (e.g. name@gmail.com)."
        );
      } else {
        setEmailWarning("");
      }
    }}
    required
    placeholder={admin ? "admin@iem.edu" : "you@example.com"}
    autoComplete="email"
  />

  {emailWarning && (
    <div className="email-warning">
      <span>⚠</span> {emailWarning}
    </div>
  )}
</Field>

   {register&&<><Field label="Mobile number"><input name="phone" value={form.phone} onChange={change} required pattern="[0-9]{10}" maxLength="10" placeholder="10-digit mobile number"/></Field><Field label="Address"><textarea name="address" value={form.address} onChange={change} required placeholder="Enter your address"/></Field></>}
   <div className="field"><div className="label-row"><span>Password</span>{!register&&<Link to="/forgot-password" className="forgot-link">Forgot password?</Link>}</div><PasswordInput
  value={form.password}
  onChange={change}
  autoComplete={register ? "new-password" : "current-password"}
/>

{register && <PasswordStrength password={form.password}/>}</div>
   <button
  className="btn primary full"
  disabled={busy || (register && !isStrongPassword(form.password))}
>
  {busy ? "Please wait..." : register ? "Create Account" : "Sign In"}
</button>
  </form>
  {admin?<div className="auth-switch">Not an administrator? <Link to="/login">Applicant login</Link></div>
   :<><div className="auth-switch">{register?"Already have an account?":"New to the portal?"} <Link to={register?"/login":"/register"}>{register?"Sign in":"Create an account"}</Link></div>{!register&&<div className="auth-switch tight">Administrator? <Link to="/admin-login">Admin login</Link></div>}</>}
  <div className="auth-switch tight"><Link to="/"><ArrowLeft size={12} style={{verticalAlign:"-2px"}}/> Back to home</Link></div>
 </AuthShell>
}
function ForgotPassword(){
 const [email,setEmail]=useState(""),[busy,setBusy]=useState(false),[msg,setMsg]=useState(""),[error,setError]=useState("");
 const submit=async e=>{e.preventDefault();setError("");setMsg("");setBusy(true);try{const r=await api.post("/auth/forgot-password",{email});setMsg(r.data.message);}catch(err){setError(err.response?.data?.message||"Unable to send the reset email. Please try again.");}finally{setBusy(false)}};
 return <AuthShell>
  <div className="eyebrow">ACCOUNT RECOVERY</div><h2>Forgot your password?</h2>
  <p className="muted">Enter the email address linked to your account. We'll email you a secure link to verify it's you and set a new password.</p>
  <Notice message={msg}/><Notice type="error" message={error}/>
  {!msg&&<form onSubmit={submit} className="form-stack"><Field label="Email address"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" autoComplete="email" {...emailProps()}/></Field><button
  className="btn primary full"
  disabled={busy || (register && !isStrongPassword(form.password))}
>{busy?"Sending...":"Send reset link"} <Mail size={16}/></button></form>}
  <div className="auth-switch"><Link to="/login"><ArrowLeft size={12} style={{verticalAlign:"-2px"}}/> Back to sign in</Link></div>
 </AuthShell>
}
function ResetPassword(){
 const {token}=useParams(),nav=useNavigate(),[pw,setPw]=useState(""),[pw2,setPw2]=useState(""),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState("");
 const submit=async e=>{e.preventDefault();setError("");if(pw!==pw2)return setError("Passwords do not match.");setBusy(true);try{await api.post("/auth/reset-password",{token,password:pw});setDone(true);setTimeout(()=>nav("/login"),2500);}catch(err){setError(err.response?.data?.message||"Unable to reset password. Please try again.");}finally{setBusy(false)}};
 return <AuthShell>
  <div className="eyebrow">ACCOUNT RECOVERY</div><h2>Set a new password</h2>
  <p className="muted">Choose a strong password of at least 8 characters.</p>
  {done?<Notice message="Password updated successfully. Redirecting you to sign in..."/>:<><Notice type="error" message={error}/><form onSubmit={submit} className="form-stack"><div className="field"><span>New password</span><PasswordInput name="pw" value={pw} onChange={e=>setPw(e.target.value)} autoComplete="new-password"/>
    <PasswordStrength password={pw}/>
    </div><div className="field"><span>Confirm new password</span><PasswordInput name="pw2" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="Re-enter new password" autoComplete="new-password"/></div><button
  className="btn primary full"
  disabled={busy || !isStrongPassword(pw) || pw !== pw2}
>{busy?"Updating...":"Reset password"} <KeyRound size={16}/></button></form></>}
  <div className="auth-switch"><Link to="/login">Back to sign in</Link></div>
 </AuthShell>
}
function Field({label,children,hint,wide}){return <label className={`field${wide?" wide":""}`}><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>}
function Dashboard(){const [data,setData]=useState(null),[error,setError]=useState("");useEffect(()=>{api.get("/applications/mine").then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.message||"Unable to load application."))},[]);if(!data&&!error)return <Loading/>;const app=data?.application,docs=app?.documents||[];return <><PageTitle eyebrow="STUDENT OVERVIEW" title="Your admission dashboard" subtitle="Manage your application and stay updated on every step."/><Notice type="error" message={error}/><div className="welcome-card"><div><div className="eyebrow light">ADMISSION SESSION</div><h2>Welcome to IEM Admissions</h2><p>Your application journey, all in one place.</p></div><GraduationCap size={66}/></div><div className="stats-grid"><Stat label="Application status" value={app?.status||"Not started"} icon={FileText}/><Stat label="Documents uploaded" value={`${docs.length}/5`} icon={Upload}/><Stat label="Payment" value={data?.payment?"Paid":app?.status==="Approved"?"Pending":"Locked"} icon={CreditCard}/></div><section className="panel"><div className="panel-head"><div><h3>Application progress</h3><p>Follow the steps to complete your admission.</p></div>{app?.status&&<Status status={app.status}/>}</div><div className="steps"><Step n="01" title="Create account" done/><Step n="02" title="Complete admission form" done={!!app}/><Step n="03" title="Upload documents" done={docs.length===5}/><Step n="04" title="Admin review" done={["Under Review","Approved","Rejected"].includes(app?.status)}/><Step n="05" title="Fee payment" done={!!data?.payment}/></div>{app?.applicationId&&<div className="application-id"><span>YOUR APPLICATION ID</span><b>{app.applicationId}</b></div>}{app?.status==="Rejected"&&<Notice type="error" message={`Application rejected: ${app.rejectionReason}`}/>}<div className="panel-actions">{!app||app.status==="Draft"?<Link className="btn primary" to="/application">{app?"Continue application":"Start application"} <ArrowRight size={16}/></Link>:app.status==="Approved"&&!data?.payment?<Link className="btn primary" to="/payment">Proceed to payment <ArrowRight size={16}/></Link>:<Link className="btn secondary" to="/application">View application</Link>}</div></section></>}
function Stat({label,value,icon:Icon}){return <div className="stat-card"><div className="stat-icon"><Icon size={19}/></div><span>{label}</span><b>{value}</b></div>}
function Step({n,title,done}){return <div className={`step ${done?"done":""}`}><div className="step-number">{done?<CheckCircle size={17}/>:n}</div><span>{title}</span></div>}
const docTypes=["Photograph","Class 10 Marksheet","Class 12 Marksheet","Aadhaar Card","Transfer Certificate"];
const boards10=["CBSE","ICSE","WBBSE","NIOS","Other State Board","Other"];
const boards12=["CBSE","ISC","WBCHSE","NIOS","Other State Board","Other"];
const entranceExams=["IEM-JEE","WB-JEE","JEE-MAINS"];
const qualifyingOptions=[...entranceExams,"Other / Merit based (Class 12 marks)"];
const courseGroups=[
  {category:"Engineering & Technology",options:[
    "B.Tech – Computer Science & Engineering (CSE)",
    "B.Tech – CSE (Artificial Intelligence)",
    "B.Tech – CSE (Artificial Intelligence & Machine Learning)",
    "B.Tech – CSE (Internet of Things)",
    "B.Tech – CSE (Cyber Security)",
    "B.Tech – CSE (Data Science)",
    "B.Tech – CSE (AI & Data Science)",
    "B.Tech – CSE (IoT, Cyber Security & Blockchain Technology)",
    "B.Tech – Information Technology (IT)",
    "B.Tech – Computer Science & Business Systems (CSBS)",
    "B.Tech – Electronics & Communication Engineering (ECE)",
    "B.Tech – Electrical Engineering (EE)",
    "B.Tech – Electrical & Electronics Engineering (EEE)",
    "B.Tech – Mechanical Engineering (ME)",
    "B.Tech – Biotechnology"]},
  {category:"Management",options:[
    "BBA – Bachelor of Business Administration",
    "BBA – Business Analytics",
    "BBA – Digital Business"]},
  {category:"Computer Applications",options:["BCA – Bachelor of Computer Applications"]},
  {category:"Law",options:["BBA LL.B (Hons.) – Integrated Programme"]},
  {category:"Hospitality",options:[
    "BHMCT – Bachelor of Hotel Management and Catering Technology",
    "B.Sc. – Hospitality and Hotel Administration"]}
];
function ApplicationPage(){
  const [data,setData]=useState({
    studentName:"",dob:"",gender:"",address:"",mobile:"",
    guardianName:"",guardianRelation:"",guardianMobile:"",guardianEmail:"",guardianOccupation:"",
    class10School:"",class10Board:"",class10Marks:"",
    class12School:"",class12Board:"",class12Marks:"",
    qualifyingExam:"",qualifyingExamRank:"",qualifyingExamPercentile:"",
    courseApplyingFor:""
  });
  const [app,setApp]=useState(null),[files,setFiles]=useState({}),[message,setMessage]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const editable=!app||app.status==="Draft";
  const isEntrance=entranceExams.includes(data.qualifyingExam);

  useEffect(()=>{
    api.get("/applications/mine").then(r=>{
      const application=r.data.application;
      if(application){
        setApp(application);
        setData(cur=>Object.fromEntries(Object.keys(cur).map(k=>[k,k==="dob"&&application[k]?new Date(application[k]).toISOString().slice(0,10):(application[k]??"")])));
      }
    }).catch(()=>{});
  },[]);

  const change=e=>{
    const {name,value}=e.target;
    setData(cur=>{
      const next={...cur,[name]:value};
      // rank / percentile only apply to entrance exams
      if(name==="qualifyingExam"&&!entranceExams.includes(value)){next.qualifyingExamRank="";next.qualifyingExamPercentile="";}
      return next;
    });
  };

  const validate=()=>{
    if(!/^[0-9]{10}$/.test(String(data.guardianMobile).trim())){setError("Please enter a valid 10-digit guardian mobile number.");return false;}
    if(!data.qualifyingExam){setError("Please select your qualifying examination.");return false;}
    if(entranceExams.includes(data.qualifyingExam)&&!String(data.qualifyingExamRank).trim()){setError("Rank is mandatory for the selected entrance examination.");return false;}
    if(data.qualifyingExamPercentile!==""&&(Number(data.qualifyingExamPercentile)<0||Number(data.qualifyingExamPercentile)>100)){setError("Percentile must be between 0 and 100.");return false;}
    if(!data.courseApplyingFor){setError("Please select the course you are applying for.");return false;}
    return true;
  };

  const save=async()=>{
    setError("");setMessage("");
    if(!validate())return;
    setBusy(true);
    try{const r=await api.put("/applications/mine",data);setApp(r.data.application);setMessage("Application details saved successfully.");}
    catch(e){setError(e.response?.data?.message||"Could not save application.");}
    finally{setBusy(false)}
  };
  const upload=async type=>{
    if(!files[type])return setError(`Choose a file for ${type}.`);
    const fd=new FormData();fd.append("documentType",type);fd.append("document",files[type]);
    setBusy(true);setError("");
    try{const r=await api.post("/applications/mine/documents",fd,{headers:{"Content-Type":"multipart/form-data"}});setApp({...app,documents:r.data.documents});setMessage(r.data.message);}
    catch(e){setError(e.response?.data?.message||"Upload failed.");}
    finally{setBusy(false)}
  };
  const submit=async()=>{
    setError("");setMessage("");
    if(!validate())return;
    setBusy(true);
    try{const r=await api.post("/applications/mine/submit");setApp(r.data.application);setMessage(r.data.message);}
    catch(e){setError(e.response?.data?.message||"Submission failed.");}
    finally{setBusy(false)}
  };

  return <>
    <PageTitle eyebrow="APPLICATION" title="Admission application" subtitle="Enter accurate details and upload all required documents." action={app?.applicationId&&<Status status={app.status}/>}/>
    <Notice message={message} onClose={()=>setMessage("")}/>
    <Notice type="error" message={error} onClose={()=>setError("")}/>
    <section className="panel">

      <div className="section-heading"><span>01</span><div><h3>Student details</h3><p>Basic details of the applicant.</p></div></div>
      <div className="form-grid">
        <Field label="Full name"><input name="studentName" value={data.studentName} onChange={change} disabled={!editable} required placeholder="As per official records"/></Field>
        <Field label="Date of birth"><input type="date" name="dob" value={data.dob?.slice?.(0,10)||""} onChange={change} disabled={!editable}/></Field>
        <Field label="Gender"><select name="gender" value={data.gender} onChange={change} disabled={!editable}><option value="">Select gender</option>{["Male","Female","Other"].map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field label="Mobile number"><input name="mobile" value={data.mobile} onChange={change} maxLength="10" disabled={!editable} placeholder="10-digit number"/></Field>
        <Field label="Address" wide><textarea name="address" value={data.address} onChange={change} disabled={!editable} placeholder="Full residential address"/></Field>
      </div>

      <div className="section-heading spaced"><span>02</span><div><h3>Guardian information</h3><p>Details of the parent or legal guardian.</p></div></div>
      <div className="form-grid">
        <Field label="Guardian full name"><input name="guardianName" value={data.guardianName} onChange={change} disabled={!editable} placeholder="Parent / guardian name"/></Field>
        <Field label="Relationship with applicant"><select name="guardianRelation" value={data.guardianRelation} onChange={change} disabled={!editable}><option value="">Select relationship</option>{["Father","Mother","Legal guardian","Other"].map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field label="Guardian mobile number"><input name="guardianMobile" value={data.guardianMobile} onChange={change} maxLength="10" disabled={!editable} placeholder="10-digit number"/></Field>
        <Field label="Guardian email (optional)"><input type="email" name="guardianEmail" value={data.guardianEmail} onChange={change} disabled={!editable} placeholder="guardian@example.com" {...emailProps()}/></Field>
        <Field label="Guardian occupation (optional)" wide><input name="guardianOccupation" value={data.guardianOccupation} onChange={change} disabled={!editable} placeholder="Occupation"/></Field>
      </div>

      <div className="section-heading spaced"><span>03</span><div><h3>Academic information</h3><p>Enter your Class 10 and Class 12 details.</p></div></div>
      <div className="sub-card"><h4>Class 10 Details</h4><div className="form-grid three">
        <Field label="School name"><input name="class10School" value={data.class10School} onChange={change} disabled={!editable} placeholder="Enter Class 10 school name"/></Field>
        <Field label="Board"><select name="class10Board" value={data.class10Board} onChange={change} disabled={!editable}><option value="">Select board</option>{boards10.map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field label="Marks obtained (%)"><input type="number" min="0" max="100" step="0.01" name="class10Marks" value={data.class10Marks} onChange={change} disabled={!editable} placeholder="Enter marks percentage"/></Field>
      </div></div>
      <div className="sub-card"><h4>Class 12 Details</h4><div className="form-grid three">
        <Field label="School name"><input name="class12School" value={data.class12School} onChange={change} disabled={!editable} placeholder="Enter Class 12 school name"/></Field>
        <Field label="Board"><select name="class12Board" value={data.class12Board} onChange={change} disabled={!editable}><option value="">Select board</option>{boards12.map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field label="Marks obtained (%)"><input type="number" min="0" max="100" step="0.01" name="class12Marks" value={data.class12Marks} onChange={change} disabled={!editable} placeholder="Enter marks percentage"/></Field>
      </div></div>

      <div className="section-heading spaced"><span>04</span><div><h3>Qualifying examination</h3><p>Select the examination you appeared for.</p></div></div>
      <div className="sub-card"><div className="form-grid">
        <Field label="Qualifying examination" wide><select name="qualifyingExam" value={data.qualifyingExam} onChange={change} disabled={!editable}><option value="">Select examination</option>{qualifyingOptions.map(x=><option key={x}>{x}</option>)}</select></Field>
        {isEntrance&&<>
          <Field label="Rank (mandatory)" hint="Enter your rank as per the scorecard."><input type="number" min="1" name="qualifyingExamRank" value={data.qualifyingExamRank} onChange={change} disabled={!editable} placeholder="Enter your rank"/></Field>
          <Field label="Percentile (optional)" hint="Between 0 and 100."><input type="number" min="0" max="100" step="0.01" name="qualifyingExamPercentile" value={data.qualifyingExamPercentile} onChange={change} disabled={!editable} placeholder="Enter percentile"/></Field>
        </>}
      </div></div>

      <div className="section-heading spaced"><span>05</span><div><h3>Course applying for</h3><p>Select the programme for which you wish to apply.</p></div></div>
      <div className="sub-card"><div className="form-grid">
        <Field label="Select course" wide><select name="courseApplyingFor" value={data.courseApplyingFor} onChange={change} disabled={!editable}><option value="">Select a course</option>{courseGroups.map(g=><optgroup key={g.category} label={g.category}>{g.options.map(o=><option key={o} value={o}>{o}</option>)}</optgroup>)}</select></Field>
      </div></div>

      {editable&&<div className="panel-actions"><button className="btn primary" onClick={save} disabled={busy}>{busy?"Saving...":"Save application details"}</button></div>}
    </section>

    <section className="panel">
      <div className="section-heading"><span>06</span><div><h3>Required documents</h3><p>Accepted formats: PDF, JPG, JPEG, PNG. Maximum size: 5 MB per file.</p></div></div>
      <div className="document-list">{docTypes.map(type=>{const existing=app?.documents?.find(d=>d.type===type);return <div className="document-row" key={type}><div className="doc-icon"><FileText/></div><div className="doc-info"><b>{type}</b><small>{existing?existing.originalName:"Required document"}</small></div>{existing?<span className="uploaded"><CheckCircle size={15}/> Uploaded</span>:<span className="required">Required</span>}{editable&&<div className="upload-control"><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>setFiles({...files,[type]:e.target.files[0]})}/><button className="btn small secondary" onClick={()=>upload(type)} disabled={busy}>Upload</button></div>}</div>})}</div>
      {editable&&<div className="submit-bar"><div><b>Ready to submit?</b><small>Ensure all fields are complete and all five documents are uploaded.</small></div><button className="btn primary" onClick={submit} disabled={busy||!app}>Submit application <ArrowRight size={16}/></button></div>}
      {!editable&&<div className="info-strip">Your application has been submitted and is now read-only. Contact the admissions office for corrections.</div>}
    </section>
  </>
}
function PaymentPage(){const [app,setApp]=useState(null),[payment,setPayment]=useState(null),[method,setMethod]=useState("UPI"),[msg,setMsg]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);useEffect(()=>{api.get("/applications/mine").then(r=>{setApp(r.data.application);setPayment(r.data.payment)})},[]);const pay=async simulate=>{setBusy(true);setError("");setMsg("");try{const r=await api.post("/payments/pay",{method,simulate});setPayment(r.data.payment);setMsg(r.data.message);}catch(e){setError(e.response?.data?.message||"Payment failed.");}finally{setBusy(false)}};if(!app)return <><PageTitle eyebrow="PAYMENT" title="Admission fee payment" subtitle="Payment becomes available after your application is approved."/></>;return <><PageTitle eyebrow="PAYMENT" title="Admission fee payment" subtitle="Review your payment details and complete the simulated transaction."/><Notice message={msg}/><Notice type="error" message={error}/>{payment?<Receipt payment={payment} app={app}/>:app.status!=="Approved"?<div className="empty-state"><div className="empty-icon"><Clock/></div><h3>Payment is not available yet</h3><p>Your application status is <Status status={app.status}/>. The fee payment option will unlock after administrator approval.</p></div>:<div className="payment-layout"><section className="panel"><h3>Select payment method</h3><p className="muted">Choose one of the available payment methods.</p><div className="payment-methods">{["UPI","Debit/Credit Card","Net Banking"].map(m=><button key={m} onClick={()=>setMethod(m)} className={method===m?"selected":""}><CreditCard size={20}/><b>{m}</b><span>{method===m?"Selected":"Select"}</span></button>)}</div><div className="info-strip">Academic prototype: this is a simulated payment. No actual money will be charged.</div><div className="panel-actions"><button className="btn primary" onClick={()=>pay("success")} disabled={busy}>{busy?"Processing...":"Simulate successful payment"}</button><button className="btn secondary" onClick={()=>pay("failure")} disabled={busy}>Test payment failure</button></div></section><aside className="panel fee-card"><div className="eyebrow">PAYMENT SUMMARY</div><h3>Admission fee</h3><div className="fee-amount">₹50,000</div><div className="fee-line"><span>Application ID</span><b>{app.applicationId}</b></div><div className="fee-line"><span>Payment method</span><b>{method}</b></div><div className="fee-line total"><span>Total payable</span><b>₹50,000</b></div></aside></div>}</>}
function Receipt({payment,app}){return <section className="panel receipt"><div className="receipt-top"><div className="receipt-check"><CheckCircle size={30}/></div><div><h2>Payment successful</h2><p>Your payment has been recorded. Keep this receipt for your records.</p></div></div><div className="receipt-brand"><Logo height={64}/> <span>INSTITUTE OF ENGINEERING & MANAGEMENT</span></div><div className="receipt-title">FEE PAYMENT RECEIPT</div><div className="receipt-grid">{[["Receipt number",payment.receiptNumber],["Application ID",app.applicationId],["Student name",app.studentName],["Transaction ID",payment.transactionId],["Payment method",payment.method],["Payment date",new Date(payment.paidAt||payment.createdAt).toLocaleString("en-IN")],["Payment status","SUCCESS"]].map(([k,v])=><div><span>{k}</span><b>{v}</b></div>)}</div><div className="receipt-total"><span>Amount paid</span><b>₹{Number(payment.amount).toLocaleString("en-IN")}</b></div><button className="btn primary" onClick={()=>window.print()}><Printer size={17}/> Print receipt</button></section>}
function AdminDashboard(){const [apps,setApps]=useState([]),[q,setQ]=useState(""),[status,setStatus]=useState("All"),[error,setError]=useState("");const load=()=>api.get("/admin/applications",{params:{search:q,status}}).then(r=>setApps(r.data.applications)).catch(e=>setError(e.response?.data?.message||"Unable to load applications."));useEffect(()=>{load()},[status]);return <><PageTitle eyebrow="ADMINISTRATION" title="Admissions dashboard" subtitle="Review applications and manage admission decisions."/><Notice type="error" message={error}/><div className="stats-grid"><Stat label="Total applications" value={apps.length} icon={Users}/><Stat label="Awaiting review" value={apps.filter(a=>["Submitted","Under Review"].includes(a.status)).length} icon={Clock}/><Stat label="Approved" value={apps.filter(a=>a.status==="Approved").length} icon={CheckCircle}/></div><section className="panel"><div className="panel-head"><div><h3>Applications</h3><p>Search by application ID or student name.</p></div></div><div className="filters"><div className="searchbox"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()} placeholder="Search applications..."/></div><select value={status} onChange={e=>setStatus(e.target.value)}>{["All","Submitted","Under Review","Approved","Rejected"].map(x=><option key={x}>{x}</option>)}</select><button className="btn secondary" onClick={load}>Search</button></div><div className="table-wrap"><table><thead><tr><th>Application ID</th><th>Student</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>{apps.map(a=><tr key={a._id}><td className="mono">{a.applicationId||"Draft"}</td><td><b>{a.studentName}</b><small>{a.student?.email}</small></td><td>{new Date(a.createdAt).toLocaleDateString("en-IN")}</td><td><Status status={a.status}/></td><td><Link className="table-link" to={`/admin/applications/${a._id}`}>Review <ArrowRight size={14}/></Link></td></tr>)}</tbody></table>{!apps.length&&<div className="table-empty">No applications found.</div>}</div></section></>}
function AdminReview(){const {id}=useParams();const [app,setApp]=useState(null),[reason,setReason]=useState(""),[error,setError]=useState(""),[msg,setMsg]=useState("");const load=()=>api.get(`/admin/applications/${id}`).then(r=>setApp(r.data.application)).catch(e=>setError(e.response?.data?.message||"Could not load application."));useEffect(()=>{load()},[id]);const review=async status=>{setError("");setMsg("");try{const r=await api.patch(`/admin/applications/${id}/review`,{status,rejectionReason:reason});setApp(r.data.application);setMsg(r.data.message);}catch(e){setError(e.response?.data?.message||"Could not update status.")}};if(!app)return error?<><PageTitle eyebrow="APPLICATION REVIEW" title="Could not open this application" subtitle="Something went wrong while loading it."/><Notice type="error" message={error}/><Link className="btn secondary" to="/admin/applications"><ArrowLeft size={15}/> Back to applications</Link></>:<Loading/>;return <><PageTitle eyebrow="APPLICATION REVIEW" title={app.studentName} subtitle={`Application ID: ${app.applicationId||"Not assigned"}`} action={<Status status={app.status}/>}/><Notice message={msg}/><Notice type="error" message={error}/><section className="panel"><h3>Student &amp; guardian details</h3><div className="detail-grid">{[["Full name",app.studentName],["Email",app.student?.email],["Mobile",app.mobile],["Date of birth",new Date(app.dob).toLocaleDateString("en-IN")],["Gender",app.gender],["Guardian name",app.guardianName],["Guardian relationship",app.guardianRelation],["Guardian mobile",app.guardianMobile],["Guardian email",app.guardianEmail],["Guardian occupation",app.guardianOccupation],["Address",app.address],["Class 10 school",app.class10School],["Class 10 board",app.class10Board],["Class 10 marks",`${app.class10Marks}%`],["Class 12 school",app.class12School],["Class 12 board",app.class12Board],["Class 12 marks",`${app.class12Marks}%`],["Course applied",app.courseApplyingFor],["Qualifying exam",app.qualifyingExam],["Rank",app.qualifyingExamRank],["Percentile",app.qualifyingExamPercentile]].map(([k,v])=><div key={k}><span>{k}</span><b>{v||"—"}</b></div>)}</div><h3 className="subheading">Submitted documents</h3><div className="document-list">{app.documents.map(d=><div className="document-row" key={d._id||d.type}><FileText/><div className="doc-info"><b>{d.type}</b><small>{d.originalName}</small></div><a className="table-link" href={assetUrl(d.path)} target="_blank" rel="noreferrer"><Eye size={15}/> View</a></div>)}</div><h3 className="subheading">Admission decision</h3><Field label="Rejection reason (required only when rejecting)"><textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Enter a clear reason if rejecting the application."/></Field><div className="panel-actions"><button className="btn secondary" onClick={()=>review("Under Review")}>Mark under review</button><button className="btn primary" onClick={()=>review("Approved")}>Approve application</button><button className="btn danger" onClick={()=>review("Rejected")}>Reject application</button></div></section></>}
function useParamsSafe(){return requireParams();}
function requireParams(){return window.location.pathname.split("/").filter(Boolean).at(-1);}
function App(){return <AuthProvider><Routes><Route path="/" element={<LandingRoute/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/register" element={<LoginPage register/>}/><Route path="/admin-login" element={<LoginPage admin/>}/><Route path="/forgot-password" element={<ForgotPassword/>}/><Route path="/reset-password/:token" element={<ResetPassword/>}/><Route path="/dashboard" element={<Protected><Layout><Dashboard/></Layout></Protected>}/><Route path="/application" element={<Protected><Layout><ApplicationPage/></Layout></Protected>}/><Route path="/payment" element={<Protected><Layout><PaymentPage/></Layout></Protected>}/><Route path="/admin" element={<Protected admin><Layout><AdminDashboard/></Layout></Protected>}/><Route path="/admin/applications" element={<Protected admin><Layout><AdminDashboard/></Layout></Protected>}/><Route path="/admin/applications/:id" element={<Protected admin><Layout><AdminReview/></Layout></Protected>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></AuthProvider>}
function LandingRoute(){const {user}=useAuth();return <Landing user={user}/>}
export default App;
