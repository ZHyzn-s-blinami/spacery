import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, UserRole } from '../store/user/slice';
import { loginUser, registerUser } from '../store/user/thunks';
import { useNavigate } from 'react-router-dom';

export const AuthForm = () => {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.user);

  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setErrors({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setIsSubmitted(false);
    dispatch(clearError());
  }, [isLogin]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    let formErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    let isValid = true;

    if (!isLogin && !formData.name.trim()) {
      formErrors.name = 'Введите ваше имя';
      isValid = false;
    }

    if (!formData.email.trim()) {
      formErrors.email = 'Введите ваш email';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      formErrors.email = 'Введите корректный email адрес';
      isValid = false;
    }

    if (!formData.password) {
      formErrors.password = 'Введите пароль';
      isValid = false;
      formErrors.password = 'Пароль должен содержать не менее 6 символов';
      isValid = false;
    }

    if (!isLogin) {
      if (!formData.confirmPassword) {
        formErrors.confirmPassword = 'Подтвердите пароль';
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        formErrors.confirmPassword = 'Пароли не совпадают';
        isValid = false;
      }
    }

    setErrors(formErrors);
    return isValid;
  };

  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');

  React.useEffect(() => {
    if (userToken) {
      navigate('/');
    }
  }, [userToken]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) return;

    if (!isLogin) {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: UserRole.ROLE_ANONYMOUS,
      };

      dispatch(registerUser(userData));
    } else {
      const credentials = {
        email: formData.email,
        password: formData.password,
      };

      dispatch(loginUser(credentials));
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClasses = 'text-sm rounded-lg block w-full p-2.5';

    if (isSubmitted && errors[fieldName]) {
      return `${baseClasses} bg-red-50 border border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500`;
    }

    return `${baseClasses} bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500`;
  };

  return (
    <div className="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8">
      <div className="flex mb-6">
        <button
          type="button"
          className={`flex-1 py-2 px-4 text-sm font-medium focus:outline-none ${
            isLogin
              ? 'text-white bg-blue-700 rounded-l-lg hover:bg-blue-800'
              : 'text-gray-900 bg-gray-100 rounded-l-lg hover:bg-gray-200'
          }`}
          onClick={() => setIsLogin(true)}
        >
          Войти
        </button>
        <button
          type="button"
          className={`flex-1 py-2 px-4 text-sm font-medium focus:outline-none ${
            !isLogin
              ? 'text-white bg-blue-700 rounded-r-lg hover:bg-blue-800'
              : 'text-gray-900 bg-gray-100 rounded-r-lg hover:bg-gray-200'
          }`}
          onClick={() => setIsLogin(false)}
        >
          Зарегистрироваться
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <h5 className="text-xl font-medium text-gray-900">
          {isLogin ? 'Вход в аккаунт' : 'Создание аккаунта'}
        </h5>

        {!isLogin && (
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
              Ваше имя
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className={getInputClassName('name')}
              placeholder="Иван Иванов"
              required
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
            Ваш email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className={getInputClassName('email')}
            placeholder="name@company.com"
            required
            value={formData.email}
            onChange={handleInputChange}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
            Пароль
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className={getInputClassName('password')}
            placeholder="••••••••"
            required
            value={formData.password}
            onChange={handleInputChange}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        {!isLogin && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Повторите пароль
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              className={getInputClassName('confirmPassword')}
              placeholder="••••••••"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        )}

        {isLogin && (
          <div className="flex items-center justify-end">
            <a href="#" className="text-sm text-blue-700 hover:underline">
              Забыли пароль?
            </a>
          </div>
        )}

        <button
          type="submit"
          className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          {isLogin ? 'Войти в аккаунт' : 'Создать аккаунт'}
        </button>
        {error && (
          <p className="text-sm text-red-600">{`Ошибка авторизации${
            isLogin ? ': Неверный логин или пароль' : ''
          }`}</p>
        )}

        {isLogin ? (
          <div className="text-sm font-medium text-gray-500">
            Нет аккаунта?{' '}
            <a
              href="#"
              className="text-blue-700 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                setIsLogin(false);
              }}
            >
              Создать аккаунт
            </a>
          </div>
        ) : (
          <div className="text-sm font-medium text-gray-500">
            Уже есть аккаунт?{' '}
            <a
              href="#"
              className="text-blue-700 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                setIsLogin(true);
              }}
            >
              Войти
            </a>
          </div>
        )}
      </form>
    </div>
  );
};
