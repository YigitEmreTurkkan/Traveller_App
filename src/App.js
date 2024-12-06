import React, { useState, useEffect } from "react";
import Auth from "./Auth"; // Giriş/Kayıt bileşeni
import "./App.css"; // Stil dosyası
import { onAuthStateChanged } from "firebase/auth"; // Firebase Authentication dinleyicisi
import { auth } from "./firebase/firebase"; // Firebase yapılandırması
import { saveMapData, fetchMapData } from "./firebase/firestore"; // Firestore işlemleri

function App() {
    const [user, setUser] = useState(null); // Kullanıcı durumu
    const [countries, setCountries] = useState({}); // Harita durumları

    // Kullanıcı giriş/çıkış durumunu izleyin
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser); // Kullanıcıyı ayarla
            if (currentUser) {
                // Kullanıcının harita verilerini Firestore'dan çek
                const userCountries = await fetchMapData(currentUser.uid);
                setCountries(userCountries || {}); // Eğer veri yoksa boş obje döner
            }
        });
        return () => unsubscribe(); // Dinleyiciyi temizle
    }, []);

    // Harita yükleme ve olay dinleyicileri ekleme
    useEffect(() => {
        if (!user) return; // Kullanıcı yoksa işlem yapma

        const svgMapElement = document.getElementById("svgMap");

        const handleMapLoad = () => {
            const svgDoc = svgMapElement.contentDocument;
            if (!svgDoc) {
                console.error("SVG içeriği yüklenemedi.");
                return;
            }

            const countriesElements = svgDoc.querySelectorAll("path"); // Haritadaki ülkeleri seç

            countriesElements.forEach((country) => {
                const countryName = country.getAttribute("title");

                // Harita verilerini uygulama
                if (countries[countryName]) {
                    updateCountryColor(country, countries[countryName]);
                }

                // Ülke üzerine gelme olayı
                country.addEventListener("mouseenter", () => {
                    const displayElement = document.getElementById("countryNameDisplay");
                    displayElement.textContent = countryName || "Bilinmiyor";
                });

                // Ülke üzerinden ayrılma olayı
                country.addEventListener("mouseleave", () => {
                    const displayElement = document.getElementById("countryNameDisplay");
                    displayElement.textContent = "";
                });

                // Ülkeye tıklama olayı
                country.addEventListener("click", () => {
                    const infoBox = document.getElementById("infoBox");
                    const countryTitle = document.getElementById("countryTitle");

                    countryTitle.textContent = countryName || "Bir ülke seçin";
                    infoBox.classList.remove("hidden"); // Menü görünür yapılıyor

                    // Durum butonlarına tıklama olaylarını bağla
                    document.querySelectorAll(".status-button").forEach((button) => {
                        button.onclick = async () => {
                            const status = button.getAttribute("data-status");
                            updateCountryColor(country, status);

                            const updatedCountries = { ...countries, [countryName]: status };
                            setCountries(updatedCountries);
                            await saveMapData(user.uid, updatedCountries); // Firestore'a kaydet
                        };
                    });
                });
            });
        };

        // SVG yükleme olayını dinle
        svgMapElement.addEventListener("load", handleMapLoad);

        // Temizleme işlemi
        return () => {
            svgMapElement.removeEventListener("load", handleMapLoad);
        };
    }, [user, countries]); // Kullanıcı veya ülkeler değiştiğinde çalışır

    // Ülke rengini duruma göre güncelleyen fonksiyon
    const updateCountryColor = (country, status) => {
        const colors = {
            visited: "#FF6F61",
            lived: "#42A5F5",
            living: "#66BB6A",
            wantToVisit: "#FFA726",
            notVisited: "#D3D3D3",
        };
        country.style.fill = colors[status]; // Renk uygula
    };

    // Çıkış yapma fonksiyonu
    const handleLogout = async () => {
        await auth.signOut();
        setUser(null); // Kullanıcıyı sıfırla
    };

    // Kullanıcı giriş yapmamışsa giriş ekranını göster
    if (!user) {
        return <Auth />;
    }

    // Kullanıcı giriş yapmışsa harita ekranını göster
    return (
        <div className="App">
            <button onClick={handleLogout} style={{ position: "absolute", top: 10, right: 10 }}>
                Çıkış Yap
            </button>
            <h1>Gezgin Uygulaması</h1>
            <div id="mapContainer">
                <div id="mapBox">
                    <object
                        id="svgMap"
                        data="/world.svg" // SVG harita dosyası
                        type="image/svg+xml"
                        aria-label="World map displaying countries"
                    ></object>
                </div>
            </div>
            <div id="countryNameDisplay" style={{ textAlign: "center", marginTop: "20px", fontSize: "18px" }}>
                {/* Ülke adı burada gösterilecek */}
            </div>
            <div id="infoBox" className="hidden">
                <h2 id="countryTitle">Bir ülke seçin</h2>
                <div id="options">
                    <button className="status-button" data-status="visited">Gittim</button>
                    <button className="status-button" data-status="lived">Yaşadım</button>
                    <button className="status-button" data-status="living">Yaşıyorum</button>
                    <button className="status-button" data-status="wantToVisit">Gitmek İstiyorum</button>
                    <button className="status-button" data-status="notVisited">Gitmedim</button>
                </div>
            </div>
        </div>
    );
}

export default App;
