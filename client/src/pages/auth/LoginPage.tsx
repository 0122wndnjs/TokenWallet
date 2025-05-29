// TokenWallet/client/src/pages/auth/LoginPage.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "../../api/auth";
import { LoginPayload } from "../../types/auth";
import { useNavigate, Link } from "react-router-dom";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginPayload>({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const submitHandler = async (data: LoginPayload) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await login(data);
      localStorage.setItem("accessToken", response.accessToken);
      console.log("Login successful:", response.user);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setApiError(
        err.response?.data?.message ||
          "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full sm:w-3/4 lg:w-1/3 h-2/3 flex flex-col justify-between transition-all duration-300">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8 tracking-tight">
          로그인
        </h2>
        <form
          onSubmit={handleSubmit(submitHandler)}
          className="space-y-6 flex-grow flex flex-col justify-center"
        >
          <div>
            <input
              id="username"
              type="text"
              {...register("username", {
                required: "아이디를 입력해주세요.",
                minLength: {
                  value: 3,
                  message: "아이디는 최소 3자 이상이어야 합니다.",
                },
              })}
              placeholder="아이디"
              className={`w-full p-3 border text-gray-900 ${
                errors.username ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <input
              id="password"
              type="password"
              {...register("password", {
                required: "비밀번호를 입력해주세요.",
                minLength: {
                  value: 6,
                  message: "비밀번호는 최소 6자 이상이어야 합니다.",
                },
              })}
              placeholder="비밀번호"
              className={`w-full p-3 border text-gray-900 ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
            >
              비밀번호 찾기
            </Link>
          </div>

          {apiError && (
            <p className="text-red-500 text-center text-sm mt-4">{apiError}</p>
          )}

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-md"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          계정이 없으신가요?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
