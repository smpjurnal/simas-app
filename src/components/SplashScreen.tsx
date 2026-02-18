import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 text-white">
      <div className="text-center">
        <h1 className="text-8xl font-black tracking-wider animate-fade-in-scale-up">
          SIMAS
        </h1>
        <p className="mt-4 text-xl tracking-wide animate-fade-in opacity-0" style={{ animationDelay: '0.5s' }}>
          Sistem Informasi Jurnal Siswa
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
