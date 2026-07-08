import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { characters } from "../data/characters";
import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import AdFitBanner from "../components/AdFitBanner";

function Result() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [character, setCharacter] = useState(null);
    const [finalResult, setFinalResult] = useState("");
    const [displayTags, setDisplayTags] = useState([]);

    const scores = location.state?.scores;

    useEffect(() => {
        const charIdFromUrl = searchParams.get("c");

        if (charIdFromUrl) {
            const cleanId = charIdFromUrl.trim().toUpperCase();
            const foundCharacter = characters[cleanId];
            if (foundCharacter) {
                setCharacter(foundCharacter);
                setFinalResult(cleanId);
                setDisplayTags(scores?.tags || []);
                return;
            }
        }

        if (scores) {
            const { weight: w, decision: d, interaction: i, focus: f } = scores;
            const weight = w.L > w.H ? "L" : "H";
            const decision = d.I > d.A ? "I" : "A";
            const interaction = i.P > i.C ? "P" : "C";
            const focus = f.T > f.S ? "T" : "S";
            const calculatedResult = `${weight}${decision}${interaction}${focus}`.trim();

            const matchedCharacter = characters[calculatedResult] || {
                mpti: calculatedResult,
                name: "미등록 미플",
                passive: "데이터 없음",
                description: "로직 오류 혹은 데이터 누락",
                goodMatch: "?",
                badMatch: "?",
            };

            setCharacter(matchedCharacter);
            setFinalResult(calculatedResult);
            setDisplayTags(scores.tags || []);
        }
    }, [scores, searchParams]);

    if (!character && !scores && !searchParams.get("c")) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <p style={{ fontWeight: "bold" }}>[ERROR] 데이터를 불러올 수 없습니다.</p>
                <button onClick={() => navigate("/")} style={{ padding: "10px 20px", cursor: "pointer", border: "3px solid #111", fontWeight: "bold" }}>
                    메인으로 복귀
                </button>
            </div>
        );
    }

    if (!character) {
        return <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "'Maplestory-Light', sans-serif", fontWeight: "bold" }}>[SYSTEM] 보드게임 성향 결과 로드 중...</div>;
    }

    const shareUrl = `${window.location.origin}/result?c=${finalResult}`;
    const shareTitle = "MPTI - 보드게임 성향 테스트";
    const shareText = `나의 보드게임 자아는 '${character.name}'입니다. 당신의 성향도 분석해 보세요!`;
    const imageUrl = `${window.location.origin}/images/${finalResult}.png`;

    const incrementShareCount = async () => {
        try {
            const docName = import.meta.env.DEV ? "mpti_stats_dev" : "mpti_stats";
            const statsRef = doc(db, "statistics", docName);
            await setDoc(statsRef, { shareCount: increment(1) }, { merge: true });
        } catch (error) {
            console.error(error);
        }
    };

    const handleCopyMainLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.origin);
            await incrementShareCount();
        } catch (error) {
            console.error(error);
        }
    };

    const handleShareResult = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
        } catch (error) {
            console.error(error);
        }

        if (typeof window.Kakao !== "undefined" && window.Kakao.isInitialized()) {
            try {
                window.Kakao.Share.sendDefault({
                    objectType: "feed",
                    content: {
                        title: shareTitle,
                        description: shareText,
                        imageUrl: imageUrl,
                        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
                    },
                    buttons: [
                        {
                            title: "결과 확인하기 ♟️",
                            link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
                        },
                    ],
                });
                await incrementShareCount();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const parseMatchData = (text) => {
        if (!text) return { id: "unknown", name: "?", desc: "" };

        const match = text.match(/^([a-zA-Z]{4})\s*\(([^)]+)\)\s*,\s*(.*)$/);

        if (match) {
            return {
                id: match[1].toUpperCase(),
                name: match[2].trim(),
                desc: match[3].trim(),
            };
        }

        const parts = text.split(",");
        return {
            id: "unknown",
            name: parts[0] || text,
            desc: parts.slice(1).join(",").trim() || "",
        };
    };

    const good = parseMatchData(character.goodMatch);
    const bad = parseMatchData(character.badMatch);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "100vh",
                backgroundColor: "#2ecc71",
                backgroundImage: "linear-gradient(#27ae60 2px, transparent 2px), linear-gradient(90deg, #27ae60 2px, transparent 2px)",
                backgroundSize: "40px 40px",
                padding: "40px 20px",
                width: "100%",
                overflowX: "hidden",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    backgroundColor: "#fff",
                    border: "6px solid #111",
                    padding: "30px",
                    maxWidth: "450px",
                    width: "100%",
                    boxShadow: "10px 10px 0px rgba(0,0,0,0.8)",
                    position: "relative",
                    marginBottom: "20px",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: "-20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: "#f1c40f",
                        color: "#111",
                        padding: "5px 20px",
                        border: "4px solid #111",
                        fontWeight: "900",
                        fontSize: "1.2rem",
                        letterSpacing: "2px",
                        whiteSpace: "nowrap",
                        boxShadow: "4px 4px 0px #111",
                        fontFamily: "'Maplestory-Light', sans-serif",
                    }}
                >
                    [ {finalResult} ]
                </div>

                <h1
                    style={{
                        fontSize: "1.6rem",
                        textAlign: "center",
                        margin: "30px 0 20px 0",
                        color: "#111",
                        fontWeight: "900",
                        wordBreak: "keep-all",
                        lineHeight: "1.4",
                        fontFamily: "'Maplestory-Light', sans-serif",
                    }}
                >
                    {character.name}
                </h1>

                <div
                    style={{
                        width: "300px",
                        height: "400px",
                        backgroundColor: "#e9e9e9",
                        border: "4px dashed #111",
                        margin: "0 auto 20px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <img
                        src={`/images/${finalResult}.png`}
                        alt={character.name}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        onError={(e) => {
                            e.target.style.display = "none";
                            const placeholder = e.target.parentNode.querySelector(".placeholder-text");
                            if (placeholder) placeholder.style.display = "block";
                        }}
                    />
                    <span className="placeholder-text" style={{ color: "#555", fontWeight: "bold", display: "none" }}>
                        ♟️ [ {finalResult} 일러스트 준비 중 ]
                    </span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px", justifyContent: "center" }}>
                    {displayTags
                        .filter((tag) => tag && tag.trim() !== "")
                        .map((tag, index) => (
                            <span
                                key={index}
                                style={{
                                    backgroundColor: "#111",
                                    color: "#fff",
                                    padding: "6px 12px",
                                    border: "2px solid #111",
                                    fontWeight: "bold",
                                    fontSize: "0.9rem",
                                    fontFamily: "'Maplestory-Light', sans-serif",
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                </div>

                <div style={{ height: "3px", backgroundColor: "#111", margin: "20px 0", borderBottom: "2px dashed #ccc" }}></div>

                <div style={{ marginBottom: "20px" }}>
                    <strong
                        style={{
                            display: "inline-block",
                            backgroundColor: "#e74c3c",
                            color: "#fff",
                            padding: "4px 8px",
                            border: "2px solid #111",
                            marginBottom: "8px",
                            fontSize: "0.9rem",
                            fontFamily: "'Maplestory-Light', sans-serif",
                        }}
                    >
                        ▶ 패시브 스킬
                    </strong>
                    <p style={{ margin: 0, lineHeight: "1.6", fontWeight: "bold", color: "#333", fontSize: "0.95rem" }}>{character.passive}</p>
                </div>

                <div style={{ marginBottom: "25px" }}>
                    <strong
                        style={{
                            display: "inline-block",
                            backgroundColor: "#3498db",
                            color: "#fff",
                            padding: "4px 8px",
                            border: "2px solid #111",
                            marginBottom: "8px",
                            fontSize: "0.9rem",
                            fontFamily: "'Maplestory-Light', sans-serif",
                        }}
                    >
                        ▶ 플레이 스타일
                    </strong>
                    <p style={{ margin: 0, lineHeight: "1.6", fontWeight: "bold", color: "#333", fontSize: "0.95rem" }}>{character.description}</p>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <div
                        style={{
                            flex: 1,
                            backgroundColor: "#f4f1ea",
                            border: "3px solid #111",
                            padding: "12px 8px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >
                        <span style={{ fontWeight: "900", color: "#27ae60", marginBottom: "8px", fontSize: "0.9rem", fontFamily: "'Maplestory-Light', sans-serif" }}>🟢 찰떡 파티원</span>

                        <div
                            style={{
                                width: "85px",
                                height: "85px",
                                backgroundColor: "#fff",
                                border: "2px solid #111",
                                borderRadius: "6px",
                                overflow: "hidden",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                marginBottom: "8px",
                                boxShadow: "2px 2px 0px #111",
                            }}
                        >
                            <img
                                src={`/images/${good.id}.png`}
                                alt={good.name}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                                onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.parentNode.innerHTML = "🤝";
                                }}
                            />
                        </div>

                        <strong style={{ fontSize: "0.95rem", color: "#111", wordBreak: "keep-all" }}>{good.name}</strong>
                        <span style={{ fontSize: "0.7rem", backgroundColor: "#27ae60", color: "#fff", padding: "1px 5px", borderRadius: "4px", marginBottom: "8px", fontWeight: "bold" }}>
                            {good.id}
                        </span>

                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#444", lineHeight: "1.35", wordBreak: "keep-all" }}>{good.desc}</p>
                    </div>

                    <div
                        style={{
                            flex: 1,
                            backgroundColor: "#f4f1ea",
                            border: "3px solid #111",
                            padding: "12px 8px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >
                        <span style={{ fontWeight: "900", color: "#c0392b", marginBottom: "8px", fontSize: "0.9rem", fontFamily: "'Maplestory-Light', sans-serif" }}>🔴 상극 파티원</span>

                        <div
                            style={{
                                width: "85px",
                                height: "85px",
                                backgroundColor: "#fff",
                                border: "2px solid #111",
                                borderRadius: "6px",
                                overflow: "hidden",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                marginBottom: "8px",
                                boxShadow: "2px 2px 0px #111",
                            }}
                        >
                            <img
                                src={`/images/${bad.id}.png`}
                                alt={bad.name}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                                onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.parentNode.innerHTML = "⚔️";
                                }}
                            />
                        </div>

                        <strong style={{ fontSize: "0.95rem", color: "#111", wordBreak: "keep-all" }}>{bad.name}</strong>
                        <span style={{ fontSize: "0.7rem", backgroundColor: "#c0392b", color: "#fff", padding: "1px 5px", borderRadius: "4px", marginBottom: "8px", fontWeight: "bold" }}>
                            {bad.id}
                        </span>

                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#444", lineHeight: "1.35", wordBreak: "keep-all" }}>{bad.desc}</p>
                    </div>
                </div>
            </div>

            <div
                onClick={() => navigate("/all")}
                style={{
                    fontSize: "0.95rem",
                    fontWeight: "bold",
                    color: "#fff",
                    textDecoration: "underline",
                    cursor: "pointer",
                    marginBottom: "25px",
                    fontFamily: "'Maplestory-Light', sans-serif",
                    textShadow: "1px 1px 0px #111",
                    letterSpacing: "0.5px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f1c40f")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
            >
                [ 📜 모든 유형 살펴보기 ]
            </div>

            <button
                onClick={handleShareResult}
                style={{
                    maxWidth: "450px",
                    width: "100%",
                    padding: "15px",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    backgroundColor: "#f9e000",
                    color: "#371d1d",
                    border: "4px solid #111",
                    boxShadow: "4px 4px 0px #111",
                    cursor: "pointer",
                    fontFamily: "'Maplestory-Light', sans-serif",
                }}
            >
                카카오톡으로 결과 공유하기 🔗
            </button>

            <button
                onClick={handleCopyMainLink}
                style={{
                    maxWidth: "450px",
                    width: "100%",
                    padding: "15px",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    backgroundColor: "#fff",
                    color: "#111",
                    border: "4px solid #111",
                    boxShadow: "4px 4px 0px #111",
                    cursor: "pointer",
                    fontFamily: "'Maplestory-Light', sans-serif",
                    marginTop: "12px",
                }}
            >
                테스트 링크 복사 📋
            </button>

            <button
                onClick={() => navigate("/")}
                style={{
                    marginTop: "40px",
                    padding: "15px 40px",
                    fontSize: "1.2rem",
                    fontWeight: "900",
                    cursor: "pointer",
                    border: "4px solid #111",
                    backgroundColor: "#e74c3c",
                    color: "#fff",
                    fontFamily: "'Maplestory-Light', sans-serif",
                    boxShadow: "6px 6px 0px #111",
                    transition: "all 0.1s",
                }}
                onMouseDown={(e) => {
                    e.currentTarget.style.transform = "translate(6px, 6px)";
                    e.currentTarget.style.boxShadow = "0px 0px 0px #111";
                }}
                onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translate(0px, 0px)";
                    e.currentTarget.style.boxShadow = "6px 6px 0px #111";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translate(0px, 0px)";
                    e.currentTarget.style.boxShadow = "6px 6px 0px #111";
                }}
            >
                다시 테스트하기 🔄
            </button>

            <AdFitBanner />
        </div>
    );
}

export default Result;
