const fs = require('fs');

// Fix Login.jsx
let login = fs.readFileSync('frontend/src/pages/Auth/Login.jsx', 'utf8');

// 1. Add useLocation import
login = login.replace(
  "import { Link, useNavigate } from 'react-router-dom';",
  "import { Link, useNavigate, useLocation } from 'react-router-dom';"
);

// 2. Remove redundant isAuthenticated + useEffect redirect, add useLocation
login = login.replace(
  /const \{ login, forgotPassword, isAuthenticated \} = useAuth\(\);\s*\r?\n\s*const navigate = useNavigate\(\);\s*\r?\n\s*\r?\n\s*React\.useEffect\(\(\) => \{\s*\r?\n\s*if \(isAuthenticated\) \{\s*\r?\n\s*navigate\('\/dashboard'\);\s*\r?\n\s*\}\s*\r?\n\s*\}, \[isAuthenticated, navigate\]\);/,
  `const { login, forgotPassword } = useAuth();\r\n  const navigate = useNavigate();\r\n  const location = useLocation();`
);

// 3. Update post-login redirect to use saved location
login = login.replace(
  "navigate('/dashboard', { replace: true });",
  "const from = location.state?.from?.pathname || '/dashboard';\r\n      navigate(from, { replace: true });"
);

fs.writeFileSync('frontend/src/pages/Auth/Login.jsx', login);
console.log('Login.jsx updated');

// Fix Register.jsx
let reg = fs.readFileSync('frontend/src/pages/Auth/Register.jsx', 'utf8');

// 1. Remove redundant isAuthenticated + useEffect redirect
reg = reg.replace(
  /const \{ register, isAuthenticated \} = useAuth\(\);\s*\r?\n\s*const navigate = useNavigate\(\);\s*\r?\n\s*\r?\n\s*React\.useEffect\(\(\) => \{\s*\r?\n\s*if \(isAuthenticated\) \{\s*\r?\n\s*navigate\('\/dashboard'\);\s*\r?\n\s*\}\s*\r?\n\s*\}, \[isAuthenticated, navigate\]\);/,
  `const { register } = useAuth();\r\n  const navigate = useNavigate();`
);

fs.writeFileSync('frontend/src/pages/Auth/Register.jsx', reg);
console.log('Register.jsx updated');
