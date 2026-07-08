// src/components/AdFitBanner.jsx
import { useEffect, useRef } from "react";

function AdFitBanner() {
    const scriptAdded = useRef(false);

    useEffect(() => {
        if (scriptAdded.current) return;

        try {
            const script = document.createElement("script");
            script.async = true;
            script.src = "https://t1.daumcdn.net/kas/static/ba.min.js";
            document.body.appendChild(script);
            scriptAdded.current = true;
        } catch (error) {
            console.error("카카오 애드핏 로드 에러:", error);
        }
    }, []);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                marginTop: "25px",
                marginBottom: "15px",
                overflow: "hidden",
            }}
        >
            <ins className="kakao_ad_area" style={{ display: "none" }} data-ad-unit="DAN-MDzE36ZOSW6WLDSc" data-ad-width="300" data-ad-height="250"></ins>
        </div>
    );
}

export default AdFitBanner;
