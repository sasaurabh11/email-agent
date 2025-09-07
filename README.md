# FocusMail Email AI Agent

An intelligent email management system powered by AI that automatically processes, classifies, summarizes, and responds to emails using Google's Gmail API and Gemini AI.

## 🚀 Features

- **Gmail Integration**: Secure OAuth2 authentication with Google Gmail API
- **AI-Powered Classification**: Automatically categorize emails by type and priority
- **Smart Summarization**: Generate concise summaries of email content
- **Intelligent Email Composition**: AI-generated personalized email responses
- **Meeting Scheduling**: Automatic calendar integration for meeting requests
- **RAG-Powered Search**: Semantic search through email history
- **ReAct Agent**: Advanced reasoning and action-taking AI agent
- **Real-time Processing**: Live email analysis and response generation
- **Modern UI**: Beautiful, responsive React frontend with Tailwind CSS

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EMAIL AI AGENT SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │  REACT FRONTEND │    │ FASTAPI BACKEND │    │ EXTERNAL APIS   │            │
│  │                 │    │                 │    │                 │            │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │            │
│  │ │   Login     │ │◄──►│ │   Auth API  │ │◄──►│ │ Gmail API   │ │            │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │            │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │            │
│  │ │  Dashboard  │ │◄──►│ │ Email API   │ │◄──►│ │Calendar API │ │            │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │            │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │            │
│  │ │ Email List  │ │◄──►│ │ AI Services │ │◄──►│ │ Gemini AI   │ │            │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │            │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    └─────────────────┘            │
│  │ │ AI Agent    │ │◄──►│ │ RAG System  │ │                                   │
│  │ └─────────────┘ │    │ └─────────────┘ │    ┌─────────────────┐            │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │   DATABASES     │            │
│  │ │ Summaries   │ │◄──►│ │ Email Tools │ │◄──►│                 │            │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ ┌─────────────┐ │            │
│  └─────────────────┘    └─────────────────┘    │ │   MongoDB   │ │            │
│                                                 │ └─────────────┘ │            │
│                                                 │ ┌─────────────┐ │            │
│                                                 │ │  ChromaDB   │ │            │
│                                                 │ └─────────────┘ │            │
│                                                 └─────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────┘

AI AGENT WORKFLOW:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Email     │───►│  Classify   │───►│ Summarize   │───►│   Action    │
│  Received   │    │   Email     │    │   Email     │    │  Decision   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                                                              ▼
                                                   ┌─────────────────┐
                                                   │ Execute Action: │
                                                   │ • Draft Reply   │
                                                   │ • Schedule Meet │
                                                   │ • Snooze Email  │
                                                   │ • Archive       │
                                                   └─────────────────┘
```

## 🚀 Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/sasaurabh11/email-agent.git
cd email-ai-agent

# 2. Backend setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 3. Frontend setup
cd ../frontend
npm install

# 4. Configure environment (see detailed setup below)
# 5. Start services
# Backend: uvicorn app.main:app --reload
# Frontend: npm run dev
```

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **MongoDB** (local or cloud)
- **Google Cloud Console** account
- **Gemini API** access

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/sasaurabh11/email-agent.git
cd email-ai-agent
```

### 2. Backend Setup

#### 2.1 Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### 2.2 Install Dependencies

```bash
pip install -r requirements.txt
```

#### 2.3 Environment Configuration

Replace a `.env.example` file with `.env` in the `backend` directory and put all the required key

### 3. Google OAuth Setup

#### 3.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Gmail API** - For email access
   - **Google Calendar API** - For meeting scheduling
   - **Google+ API** - For user profile information

#### 3.2 Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in required fields:
   - **App name**: "Email AI Agent"
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Add scopes:
   - `../auth/gmail.readonly`
   - `../auth/calendar.events`
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

#### 3.3 Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - `http://localhost:8000/emails/auth/callback` (development)
   - `https://yourdomain.com/emails/auth/callback` (production)
5. Download the JSON file and rename it to `client_secret.json`
6. Place it in the `backend` directory

#### 3.4 Generate client_secret.json

The `client_secret.json` file should look like this:

```json
{
  "web": {
    "client_id": "123456789-abcdefg.apps.googleusercontent.com",
    "project_id": "your-project-id-123456",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "GOCSPX-your-client-secret-here",
    "redirect_uris": [
      "http://localhost:8000/emails/auth/callback",
      "https://yourdomain.com/emails/auth/callback"
    ]
  }
}
```

#### 3.5 Update Environment Variables

Add the credentials to your `.env` file:

```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here
```

### 4. Frontend Setup

#### 4.1 Install Dependencies

```bash
cd frontend
npm install
```

#### 4.2 Environment Configuration

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_FRONTEND_URL=http://localhost:5173
```

### 5. Database Setup

#### 5.1 MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `DATABASE_URL` in `.env`

#### 5.2 ChromaDB (Vector Database)

ChromaDB will be automatically initialized when you first run the application. The database files will be stored in `backend/data/chroma_db/`.

### 6. Running the Application

#### 6.1 Start Backend

```bash
cd backend
# Activate virtual environment
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 6.2 Start Frontend

```bash
cd frontend
npm run dev
```

#### 6.3 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Configuration Details

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/emails/auth/google` | GET | Initiate Google OAuth |
| `/emails/auth/callback` | GET | OAuth callback handler |
| `/emails/mails/fetch` | GET | Fetch emails from Gmail |
| `/emails/mails` | GET | Get stored emails |
| `/summarize/email` | POST | Summarize email content |
| `/filtering/classify` | POST | Classify email category |
| `/personalized/draft` | POST | Generate email draft |
| `/search/rag` | POST | Semantic email search |
| `/think/agent/run/{email_id}` | POST | Run AI agent on email |

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MongoDB connection string | Yes |
| `GEMINI_API_KEY` | Primary Gemini API key | Yes |
| `GEMINI_API_KEY_2` | Backup Gemini API key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |
| `REDIRECT_URL` | OAuth redirect URL | Yes |

## 🚀 Deployment

### Backend Deployment (Render/Railway)

1. Connect your GitHub repository
2. Set environment variables in deployment platform
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend Deployment (Vercel/Netlify)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variables:
   - `VITE_API_BASE_URL`: Your backend URL
   - `VITE_FRONTEND_URL`: Your frontend URL

## 🔐 Security Considerations

- Store sensitive credentials in environment variables
- Use HTTPS in production
- Implement proper CORS policies
- Regularly rotate API keys
- Monitor API usage and costs

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. OAuth Authentication Issues

**Problem**: `redirect_uri_mismatch` error
```
Solution:
- Check redirect URIs in Google Console match exactly
- Ensure no trailing slashes
- Verify http vs https protocol
- Update both development and production URLs
```

**Problem**: `access_denied` error
```
Solution:
- Check OAuth consent screen configuration
- Verify scopes are properly added
- Ensure app is not in testing mode for production
```

#### 2. Database Connection Issues

**Problem**: MongoDB connection failed
```
Solution:
- Verify DATABASE_URL format: mongodb://localhost:27017/email_agent
- Check if MongoDB service is running
- For Atlas: verify connection string and IP whitelist
- Test connection: python -c "import pymongo; print(pymongo.MongoClient('your-url').admin.command('ping'))"
```

#### 3. API Key Issues

**Problem**: Gemini API errors
```
Solution:
- Verify API key is correct and active
- Check API quotas in Google AI Studio
- Ensure billing is enabled if required
- Test API key: python -c "import google.generativeai as genai; genai.configure(api_key='your-key'); print('Valid')"
```

#### 4. CORS Issues

**Problem**: Frontend can't connect to backend
```
Solution:
- Update CORS_ORIGIN in backend .env
- Add both http://localhost:5173 and http://127.0.0.1:5173
- Restart backend server after changes
- Check browser console for specific CORS errors
```

#### 5. Module Import Errors

**Problem**: Python import errors
```
Solution:
- Ensure virtual environment is activated
- Reinstall requirements: pip install -r requirements.txt
- Check Python version compatibility
- Verify all dependencies are installed
```

### Health Checks

Test each component:

```bash
# Backend health
curl http://localhost:8000/health

# Database connection
curl http://localhost:8000/emails/mails?user_id=test

# Frontend
curl http://localhost:5173
```

### Performance Issues

**Slow email fetching**:
- Check Gmail API quotas
- Implement pagination
- Add caching layer

**High memory usage**:
- Monitor ChromaDB size
- Implement cleanup routines
- Optimize vector embeddings

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 📁 Project Structure

```
email-ai-agent/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   │   ├── email_endpoint.py
│   │   │   ├── agent_endpoint.py
│   │   │   ├── summarise_endpoint.py
│   │   │   └── ...
│   │   ├── core/              # Core configuration
│   │   │   ├── config.py
│   │   │   └── mongo.py
│   │   ├── models/            # Data models
│   │   ├── services/          # Business logic
│   │   │   ├── agent_react.py
│   │   │   ├── email_composition.py
│   │   │   └── ...
│   │   └── main.py           # FastAPI app
│   ├── data/                 # ChromaDB storage
│   ├── requirements.txt      # Python dependencies
│   └── client_secret.json    # Google OAuth credentials
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── emails/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   └── services/        # API services
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
├── README.md                # This file
└── SETUP_GUIDE.md          # Detailed setup guide
```

## 🎯 Key Features Explained

### AI Agent (ReAct Pattern)
- **Reasoning**: Analyzes email content and context
- **Action**: Executes appropriate tools (summarize, classify, draft, schedule)
- **Observation**: Learns from results and adjusts behavior

### RAG System
- **Retrieval**: Searches through email history using semantic similarity
- **Augmentation**: Enhances responses with relevant context
- **Generation**: Creates personalized, context-aware responses

### Email Processing Pipeline
1. **Fetch**: Retrieve emails from Gmail API
2. **Parse**: Extract content, metadata, and attachments
3. **Classify**: AI-powered categorization
4. **Summarize**: Generate concise summaries
5. **Action**: Execute appropriate responses

## 🔒 Security Features

- **OAuth 2.0**: Secure Google authentication
- **Token Management**: Automatic refresh and storage
- **CORS Protection**: Configured for specific origins
- **Environment Variables**: Sensitive data protection
- **API Rate Limiting**: Prevents abuse

## 📊 Performance Optimizations

- **Vector Caching**: ChromaDB for fast similarity search
- **Async Processing**: Non-blocking email operations
- **Pagination**: Efficient data loading
- **Connection Pooling**: Optimized database connections

---

**Note**: This application requires proper Google OAuth setup and API keys to function. Make sure to follow the Google Cloud Console setup instructions carefully.

