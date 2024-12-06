import React, { useState } from "react";
import { registerUser, loginUser } from "./firebase/auth";
import { saveUserData } from "./firebase/firestore";

function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true); // true: giriş, false: kayıt

    const handleAuth = async () => {
        try {
            if (isLogin) {
                const user = await loginUser(email, password);
                alert(`Giriş başarılı: ${user.email}`);
            } else {
                const user = await registerUser(email, password);
                await saveUserData(user.uid, { email }); // Kullanıcı bilgilerini kaydet
                alert(`Kayıt başarılı: ${user.email}`);
            }
        } catch (error) {
            alert("Hata: " + error.message);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>{isLogin ? "Giriş Yap" : "Kayıt Ol"}</h2>
            <input
                type="email"
                placeholder="E-posta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleAuth}>
                {isLogin ? "Giriş Yap" : "Kayıt Ol"}
            </button>
            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Kayıt Olmak İstiyorum" : "Giriş Yapmak İstiyorum"}
            </button>
        </div>
    );
}

export default Auth;
