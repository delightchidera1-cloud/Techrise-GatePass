-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "studentId" VARCHAR UNIQUE,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  track VARCHAR,
  title VARCHAR,
  phone VARCHAR,
  role VARCHAR DEFAULT 'participant',
  password VARCHAR NOT NULL,
  "assignedClass" VARCHAR,
  "assignedTutorId" UUID
);

-- Seed Super Admin (You should run this manually to create the super admin)
INSERT INTO users ("studentId", name, email, role, password)
VALUES ('SUPERADMIN-001', 'System Superadmin', 'chideraawuzie92@gmail.com', 'superadmin', '@Delight112')
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS gatepass_requests (
  id VARCHAR PRIMARY KEY,
  "applicantName" VARCHAR,
  "applicantId" VARCHAR,
  "applicantTrack" VARCHAR,
  "applicantPhone" VARCHAR,
  "reasonCategory" VARCHAR,
  destination VARCHAR,
  "exitTime" TIMESTAMP,
  "expectedReturnTime" TIMESTAMP,
  "actualExitTime" TIMESTAMP,
  "actualReturnTime" TIMESTAMP,
  "emergencyContact" VARCHAR,
  "detailedReason" TEXT,
  status VARCHAR DEFAULT 'PENDING',
  "supervisorNotes" TEXT,
  "approvedBy" VARCHAR,
  "passId" VARCHAR,
  "securityToken" VARCHAR,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id VARCHAR PRIMARY KEY,
  status VARCHAR DEFAULT 'OPEN',
  "openedAt" TIMESTAMP DEFAULT NOW(),
  "expiresAt" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_pins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "studentId" VARCHAR NOT NULL,
  pin VARCHAR NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "studentId" VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  "markedAt" TIMESTAMP DEFAULT NOW()
);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE gatepass_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_pins;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_records;

-- Performance Tracking
CREATE TABLE IF NOT EXISTS student_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "studentId" VARCHAR NOT NULL UNIQUE,
  "currentGrade" VARCHAR DEFAULT 'N/A',
  "participationScore" INTEGER DEFAULT 0
);
ALTER PUBLICATION supabase_realtime ADD TABLE student_performance;
