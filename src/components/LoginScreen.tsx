
import React, { useState, useMemo } from 'react';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (identifier: string, password: string) => void;
  error: string | null;
}

const roleConfig = [
  { role: UserRole.STUDENT, icon: 'fa-user-graduate', label: 'Siswa' },
  { role: UserRole.TEACHER, icon: 'fa-chalkboard-user', label: 'Guru' },
  { role: UserRole.PARENT, icon: 'fa-users', label: 'Orang Tua' },
  { role: UserRole.ADMIN, icon: 'fa-user-shield', label: 'Admin' },
];

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, error }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const loginIdentifierConfig = useMemo(() => {
    switch (selectedRole) {
      case UserRole.STUDENT:
        return { label: 'NISN', placeholder: 'Masukkan NISN', icon: 'fa-id-card', type: 'text' };
      case UserRole.TEACHER:
        return { label: 'NIP', placeholder: 'Masukkan NIP', icon: 'fa-id-card', type: 'text' };
      case UserRole.PARENT:
        return { label: 'NIK', placeholder: 'Masukkan NIK', icon: 'fa-id-card', type: 'text' };
      case UserRole.ADMIN:
        return { label: 'NIP', placeholder: 'Masukkan NIP Admin', icon: 'fa-id-card', type: 'text' };
      default:
        return { label: 'User ID', placeholder: 'Pilih peran terlebih dahulu', icon: 'fa-user', type: 'text' };
    }
  }, [selectedRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(identifier.trim(), password.trim());
  };

  const handleBack = () => {
    setSelectedRole(null);
    setIdentifier('');
    setPassword('');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-all duration-500 bg-cover bg-center"
      style={{ backgroundImage: "url('https://i.imgur.com/hgMTKRD.jpeg')" }}
    >
      <div className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {selectedRole 
                ? <><i className="fas fa-book-open mr-2"></i>Jurnal Siswa</> 
                : 'Pilih Peran Anda'}
          </h1>
          <p className="text-gray-200">
            {selectedRole 
                ? `Masuk sebagai ${selectedRole}` 
                : 'Sistem Informasi Jurnal Siswa'}
          </p>
        </div>
        
        {!selectedRole ? (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            {roleConfig.map(({ role, icon, label }) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className="flex flex-col items-center justify-center space-y-3 p-6 bg-slate-700/50 border-2 border-slate-600 rounded-xl hover:bg-slate-700 hover:border-primary-500 transition-all duration-200 w-full"
              >
                <i className={`fas ${icon} fa-3x text-white`}></i>
                <span className="font-semibold text-white">{label}</span>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="animate-fade-in">
            <button type="button" onClick={handleBack} className="text-sm text-gray-300 hover:text-white hover:underline mb-6 flex items-center">
              <i className="fas fa-arrow-left mr-2"></i> Kembali pilih peran
            </button>

            {error && (
                <div className="bg-red-500/30 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-center text-sm animate-fade-in">
                    <i className="fas fa-exclamation-circle mr-2"></i>{error}
                </div>
            )}

            <div className="space-y-4">
               <div>
                  <label htmlFor="identifier" className="block mb-2 text-sm font-medium text-gray-200">{loginIdentifierConfig.label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <i className={`fas ${loginIdentifierConfig.icon} text-gray-400`}></i>
                    </div>
                    <input
                      type={loginIdentifierConfig.type}
                      name="identifier"
                      id="identifier"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="bg-slate-700/50 border border-slate-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5 placeholder-gray-400"
                      placeholder={loginIdentifierConfig.placeholder}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

               <div>
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-200">Sandi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <i className="fas fa-key text-gray-400"></i>
                    </div>
                    <input
                      type={isPasswordVisible ? 'text' : 'password'}
                      name="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-slate-700/50 border border-slate-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 p-2.5 placeholder-gray-400"
                      required
                      autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                        aria-label="Toggle password visibility"
                    >
                        <i className={`fas ${isPasswordVisible ? 'fa-eye-slash' : 'fa-eye'} text-gray-400 hover:text-white transition-colors`}></i>
                    </button>
                  </div>
                </div>
            </div>

            <button
              type="submit"
              disabled={!identifier || !password}
              className="w-full mt-6 text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-3 text-center transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              Masuk
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
