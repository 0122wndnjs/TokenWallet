// TokenWallet/client/src/pages/auth/RegisterPage.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { register as registerApi } from "../../api/auth";
import { RegisterPayload } from "../../types/auth";
import { useNavigate, Link } from "react-router-dom";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<RegisterPayload & { confirmPassword: string }>({
    defaultValues: {
      username: "",
      name: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      email: "",
    },
    mode: "onChange",
  });

  const password = watch("password", "");

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const submitHandler = async (
    data: RegisterPayload & { confirmPassword: string }
  ) => {
    setIsLoading(true);
    setApiError(null);
    setApiSuccess(null);

    if (data.password !== data.confirmPassword) {
      setApiError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...payload } = data;
      const response = await registerApi(payload);

      setApiSuccess(response.message + " 로그인 페이지로 이동합니다...");
      console.log("Registration successful:", response.user);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      setApiError(
        err.response?.data?.message ||
          "회원가입에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full sm:w-3/4 lg:w-1/3 h-3/4 flex flex-col justify-between transition-all duration-300">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8 tracking-tight">
          회원가입
        </h2>
        {/* 폼의 오른쪽 패딩(pr-2)을 제거하고, 링 잘림 방지를 위해 각 입력 필드에 마진을 주거나 ring-offset을 사용합니다.
            여기서는 overflow-y-auto를 유지하면서, 각 입력 필드에 focus:ring-offset-2를 추가해 봅니다.
            또는 단순히 pr-2를 pr-4 등으로 늘려볼 수도 있습니다.
            일단 pr-2를 유지하고 각 input에 `focus:ring-offset-2`를 추가해보겠습니다. 
            만약 계속 잘린다면 `form`의 `overflow-y-auto`를 제거하고, 폼 자체에 `p-4` 같은 패딩을 주면 됩니다.
        */}
        <form
          onSubmit={handleSubmit(submitHandler)}
          className="space-y-4 flex-grow overflow-y-auto p-4"
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
              // `focus:ring-offset-2` 추가: 링이 요소 경계에서 2px 떨어져서 그려집니다.
              // 이렇게 하면 링이 잘리는 것을 방지할 수 있습니다.
              className={`w-full p-3 border text-gray-900 ${
                errors.username ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 focus:ring-offset-2`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <input
              id="name"
              type="text"
              {...register("name", {
                required: "이름을 입력해주세요.",
              })}
              placeholder="이름"
              className={`w-full p-3 border text-gray-900 ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 focus:ring-offset-2`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
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
              } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 focus:ring-offset-2`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", {
                required: "비밀번호를 다시 입력해주세요.",
                validate: (value) =>
                  value === password || "비밀번호가 일치하지 않습니다.",
              })}
              placeholder="비밀번호 확인"
              className={`w-full p-3 border text-gray-900 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 focus:ring-offset-2`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div>
            <input
              id="phoneNumber"
              type="tel"
              {...register("phoneNumber", {
                required: "전화번호를 입력해주세요.",
                pattern: {
                  value: /^[0-9]{9,15}$/,
                  message: "유효한 전화번호 형식이 아닙니다.",
                },
              })}
              placeholder="전화번호 (숫자만)"
              className={`w-full p-3 border text-gray-900 ${
                errors.phoneNumber ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 focus:ring-offset-2`}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div>
            <input
              id="email"
              type="email"
              {...register("email", {
                required: "이메일 주소를 입력해주세요.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "유효한 이메일 형식이 아닙니다.",
                },
              })}
              placeholder="이메일 주소"
              className={`w-full p-3 border text-gray-900 ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 focus:ring-offset-2`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {apiError && (
            <p className="text-red-500 text-center text-sm mt-4">{apiError}</p>
          )}
          {apiSuccess && (
            <p className="text-green-600 text-center text-sm mt-4">
              {apiSuccess}
            </p>
          )}

          <div className="pt-4 pb-2">
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-md"
            >
              {isLoading ? "회원가입 중..." : "회원가입"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          이미 계정이 있으신가요?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
