import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage, useAppContext } from '../context/AppContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FieldError = ({ id, message }) => message ? <p id={id} role="alert" className="text-red-500 text-xs mt-1">{message}</p> : null;

const Login = () => {
    const { setShowUserLogin, fetchUser, axios } = useAppContext();
    const [state, setState] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const firstField = useRef(null);

    const close = () => setShowUserLogin(false);

    // focus the first field, close with Escape, lock page scroll behind the modal
    useEffect(() => {
        firstField.current?.focus();
        const onKey = (e) => { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', onKey);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = previousOverflow;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    const validate = () => {
        const next = {};
        if (state === "register" && name.trim().length < 2) next.name = "Please enter your name (at least 2 characters)";
        if (!EMAIL_REGEX.test(email.trim())) next.email = "Please enter a valid email address";
        if (password.length < 6) next.password = "Password must be at least 6 characters";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        if (loading || !validate()) return;

        setLoading(true);
        try {
            const { data } = await axios.post(`/api/user/${state}`, { name: name.trim(), email: email.trim(), password });
            if (data.success) {
                await fetchUser(true); // loads the user and merges any items added to the cart while logged out
                toast.success(state === "login" ? "Welcome back!" : "Account created. Welcome to GreenCart!");
                close();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const switchState = (next) => { setState(next); setErrors({}); };

    return (
        <div onClick={close} className="fixed inset-0 z-50 flex items-center justify-center text-sm text-gray-600 bg-black/50 backdrop-blur-sm px-4">
            <form
                noValidate
                role="dialog"
                aria-modal="true"
                aria-label={state === "login" ? "User login" : "Create account"}
                onSubmit={onSubmitHandler}
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col gap-4 m-auto items-start p-8 py-10 w-full max-w-[352px] text-gray-500 rounded-xl shadow-xl border border-gray-200 bg-white animate-fade-up"
            >
                <p className="text-2xl font-medium m-auto">
                    <span className="text-primary">User</span>{" "}
                    {state === "login" ? "Login" : "Sign Up"}
                </p>

                {state === "register" && (
                    <div className="w-full">
                        <label htmlFor="auth-name">Name</label>
                        <input id="auth-name" ref={firstField} onChange={(e) => setName(e.target.value)} value={name} placeholder="Your name" autoComplete="name" className="field mt-1" type="text" aria-invalid={Boolean(errors.name)} aria-describedby="auth-name-error" />
                        <FieldError id="auth-name-error" message={errors.name} />
                    </div>
                )}

                <div className="w-full">
                    <label htmlFor="auth-email">Email</label>
                    <input id="auth-email" ref={state === "login" ? firstField : null} onChange={(e) => setEmail(e.target.value)} value={email} placeholder="you@example.com" autoComplete="email" className="field mt-1" type="email" aria-invalid={Boolean(errors.email)} aria-describedby="auth-email-error" />
                    <FieldError id="auth-email-error" message={errors.email} />
                </div>

                <div className="w-full">
                    <label htmlFor="auth-password">Password</label>
                    <input id="auth-password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="At least 6 characters" autoComplete={state === "login" ? "current-password" : "new-password"} className="field mt-1" type="password" aria-invalid={Boolean(errors.password)} aria-describedby="auth-password-error" />
                    <FieldError id="auth-password-error" message={errors.password} />
                </div>

                {state === "register" ? (
                    <p>
                        Already have an account?{" "}
                        <button type="button" onClick={() => switchState("login")} className="text-primary cursor-pointer hover:underline">Click here</button>
                    </p>
                ) : (
                    <p>
                        Create an account?{" "}
                        <button type="button" onClick={() => switchState("register")} className="text-primary cursor-pointer hover:underline">Click here</button>
                    </p>
                )}

                <button type="submit" disabled={loading} className="bg-primary hover:bg-primary-dull disabled:opacity-60 disabled:cursor-not-allowed transition-all text-white w-full py-2.5 rounded-md cursor-pointer">
                    {loading ? "Please wait..." : state === "register" ? "Create Account" : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;
