"use client";

import React, { useState, useEffect } from "react";
import { validateField, validateLogin } from "@/app/utils/validations";
import { userLogin } from "@/app/services/login";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

function Login() {
    const { setIsAuthenticated, setUserName } = useAuth();

    const [userData, setUserData] = useState({
        username: "",
        password: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();


    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {

            router.push("/dashboard");
        }
    }, [router]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: validateField(name, value),
        }));
    };

    const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setLoginError("");

        const formErrors = validateLogin(userData);
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            setLoading(false);
            return;
        }

        try {
            const data = await userLogin(userData.username, userData.password);
            console.log("Usuario autenticado con éxito:", data);

            if (data && data.token) {

                localStorage.setItem("authToken", data.token);
                localStorage.setItem("userData", JSON.stringify(data.user));


                setIsAuthenticated(true);
                setUserName(data.user.name);

                Swal.fire({
                    title: "Buen trabajo!",
                    text: "Has iniciado sesión!",
                    icon: "success"
                });


                router.push("/dashboard");
            } else {
                setLoginError("No se recibió un token válido.");
            }
        } catch (error) {
            setLoginError(error instanceof Error ? error.message : "Error desconocido");
            Swal.fire({
                title: "Ocurrió un problema",
                text: "Este usuario no existe",
                icon: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
        <div className="flex  items-center justify-center bg-gray-100">
            <div className=" bg-white rounded-lg shadow-md p-8 w-[500px]">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Iniciar Sesión</h1>
                <form onSubmit={handleOnSubmit} className="space-y-4">
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Usuario
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={userData.username}
                            onChange={handleInputChange}
                            placeholder="Ejemplo: ejemplo123"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                        />
                        {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                    </div>

                    <div>
                        <label className="block text-black mb-1">Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={userData.password}
                                name="password"
                                placeholder="******"
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                            <button
                                type="button"
                                onClick={toggleShowPassword}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                        )}
                    </div>
                    {loginError && (
                        <p className="text-sm text-red-500">{loginError}</p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? "Cargando..." : "Iniciar Sesión"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
