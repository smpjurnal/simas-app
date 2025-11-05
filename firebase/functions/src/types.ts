export enum UserRole {
  STUDENT = 'Siswa',
  TEACHER = 'Guru',
  PARENT = 'Orang Tua',
  ADMIN = 'Admin',
}

export enum Mood {
  HAPPY = 'Senang',
  NEUTRAL = 'Biasa Saja',
  SAD = 'Sedih',
  EXCITED = 'Semangat',
  TIRED = 'Lelah',
}

export interface BaseUser {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email: string;
  password?: string; // Optional because we remove it on the server
}

export interface Student extends BaseUser {
  role: UserRole.STUDENT;
  nisn: string;
  class: string;
  teacherId: string;
  parentId: string;
}

export interface Teacher extends BaseUser {
  role: UserRole.TEACHER;
  nip: string;
  class: string;
  subject: string;
}

export interface Parent extends BaseUser {
  role: UserRole.PARENT;
  nik: string;
  childId: string;
}

export interface Admin extends BaseUser {
  role: UserRole.ADMIN;
  nip: string;
}

export type User = Student | Teacher | Parent | Admin;

export interface JournalEntry {
  id: string;
  studentId: string;
  date: string;
  submissionTime: string;
  category: string;
  activity: string;
  attendance: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  mood: Mood;
  behaviorNote?: string;
  reflection?: string;
  teacherComment?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
