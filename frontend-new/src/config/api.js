const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-app.onrender.com/api'
  : 'http://localhost:5001/api';

export default API_BASE_URL;
