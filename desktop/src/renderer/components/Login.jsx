import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
  ExclamationCircleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

export default function Login() {
  const { login } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-50 transition-colors duration-300">
      {/* Toggle tema */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white dark:bg-dark-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      >
        {isDarkMode ? (
          <SunIcon className="h-6 w-6 text-yellow-500" />
        ) : (
          <MoonIcon className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {/* Lado izquierdo - Logo y saludo */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center lg:px-20 lg:py-12 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 text-white text-center">
          <div className="mb-12">
            <img
              src="/images/vlock_logo.png"
              alt="VLock Constructora"
              className="h-32 w-auto mb-8 filter brightness-0 invert mx-auto"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              ¡Hola!
            </h1>
            <p className="text-2xl text-red-100 font-light">
              Bienvenido de vuelta
            </p>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario de login */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <img
              src="/images/vlock_logo.png"
              alt="VLock"
              className="h-20 w-auto mx-auto mb-6"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-10">
              Te damos la bienvenida de vuelta
            </p>
          </div>

          <div className="glassmorphism rounded-2xl p-8 shadow-xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 fade-in">
                  <div className="flex">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-400 dark:text-red-300" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    autoComplete="username"
                    required
                    className="input-focus appearance-none relative block w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200"
                    placeholder="Tu usuario"
                    value={formData.usuario}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="input-focus appearance-none relative block w-full pl-12 pr-12 py-4 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200"
                    placeholder="Tu contraseña"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded transition-colors duration-200"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="button-gradient group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <div className="spinner rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </div>
                  )}
                  <span className={loading ? 'ml-6' : ''}>
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </span>
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ¿Problemas para acceder?{' '}
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200">
                    Contacta al administrador
                  </a>
                </p>
              </div>
            </form>
          </div>

          <div className="text-center mt-8">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 VLock Constructora. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
