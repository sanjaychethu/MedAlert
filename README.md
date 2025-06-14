# MedAlert - Healthcare Companion

A comprehensive healthcare management application built with React Native and Expo, designed to help users manage medications, track vital signs, coordinate with caregivers, and handle medical emergencies.

## 🚀 Features

### 📱 Core Functionality
- **Medication Management**: Track medications, dosages, schedules, and adherence rates
- **Health Monitoring**: Record and monitor vital signs (blood pressure, heart rate, temperature, etc.)
- **Caregiver Network**: Manage primary, secondary, and medical professional caregivers
- **Emergency Response**: Quick access to emergency contacts and location sharing
- **User Profile**: Comprehensive medical profile with conditions, allergies, and insurance info

### 🔐 Security & Privacy
- Secure authentication with Supabase
- Row-level security for all user data
- HIPAA-compliant data handling
- Encrypted data storage

### 🌐 Platform Support
- **Web**: Fully responsive web application
- **Mobile**: iOS and Android support via Expo
- **Cross-platform**: Shared codebase with platform-specific optimizations

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo SDK 52.0.30** - Development platform and tools
- **Expo Router 4.0.17** - File-based routing
- **TypeScript** - Type safety and better developer experience
- **Lucide React Native** - Beautiful, customizable icons

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database with RLS
- **Real-time subscriptions** - Live data updates

### State Management & Storage
- **React Context** - Authentication state management
- **AsyncStorage** - Local data persistence
- **Supabase Client** - Cloud data synchronization

## 📁 Project Structure

```
medalert-healthcare-app/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Authentication screens
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── index.tsx             # Medications screen
│   │   ├── health.tsx            # Health monitoring
│   │   ├── caregivers.tsx        # Caregiver management
│   │   ├── emergency.tsx         # Emergency features
│   │   └── profile.tsx           # User profile
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # App entry point
├── components/                   # Reusable components
│   ├── AddMedicationModal.tsx
│   ├── AddVitalSignsModal.tsx
│   ├── AddCaregiverModal.tsx
│   ├── MedicationCard.tsx
│   ├── VitalSignCard.tsx
│   └── CaregiverCard.tsx
├── contexts/                     # React contexts
│   └── AuthContext.tsx
├── hooks/                        # Custom hooks
│   └── useFrameworkReady.ts
├── lib/                          # External service configs
│   └── supabase.ts
├── types/                        # TypeScript definitions
│   ├── medication.ts
│   └── env.d.ts
├── utils/                        # Utility functions
│   ├── storage.ts
│   ├── supabaseStorage.ts
│   └── mockData.ts
├── supabase/                     # Database migrations
│   └── migrations/
└── assets/                       # Static assets
    └── images/
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medalert-healthcare-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   Run the migrations in your Supabase project:
   ```sql
   -- Run the migration files in supabase/migrations/ in order
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Development Commands

```bash
# Start development server
npm run dev

# Build for web
npm run build:web

# Run linting
npm run lint
```

## 🗄️ Database Schema

### Core Tables

#### `medications`
- User medication tracking with dosages, schedules, and adherence
- Supports multiple daily doses and refill reminders

#### `vital_signs`
- Health metrics including blood pressure, heart rate, temperature
- Timestamped entries for trend analysis

#### `caregivers`
- Caregiver network with roles (primary, secondary, medical)
- Permission-based access control

#### `user_profiles`
- Comprehensive user medical profiles
- Emergency contacts and insurance information

### Security
- Row Level Security (RLS) enabled on all tables
- User-specific data isolation
- Authenticated access only

## 🔐 Authentication

The app uses Supabase Auth with:
- Email/password authentication
- Password reset functionality
- Session management
- Automatic token refresh

### Auth Flow
1. User signs up/signs in
2. Session stored securely
3. RLS policies enforce data access
4. Automatic logout on session expiry

## 📱 Key Features Deep Dive

### Medication Management
- **Smart Scheduling**: Multiple daily doses with custom times
- **Adherence Tracking**: Visual progress indicators and statistics
- **Refill Reminders**: Low stock alerts and pharmacy integration
- **Prescription Management**: Doctor information and instructions

### Health Monitoring
- **Vital Signs**: Blood pressure, heart rate, temperature, oxygen saturation
- **Trend Analysis**: Visual charts and health score calculation
- **Critical Alerts**: Automatic warnings for abnormal readings
- **Data Export**: Share reports with healthcare providers

### Caregiver Network
- **Role-Based Access**: Primary, secondary, and medical professional roles
- **Permission System**: Granular control over data access
- **Communication**: Direct calling and messaging features
- **Activity Tracking**: Monitor caregiver engagement

### Emergency Features
- **SOS Button**: One-touch emergency activation
- **Location Sharing**: Automatic GPS coordinates to emergency contacts
- **Medical Information**: Quick access to critical health data
- **Emergency Contacts**: Prioritized contact list with relationships

## 🌍 Localization

The app is configured for Indian healthcare standards:
- **Emergency Number**: 112 (National Emergency Number)
- **Phone Format**: +91 Indian mobile numbers
- **Medical Standards**: Indian healthcare practices and terminology
- **Currency**: INR for insurance and billing



