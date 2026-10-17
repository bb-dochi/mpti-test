import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { characters } from "../data/characters";
import { englishCharacters, resultCopy } from "../data/resultLocalization";
import { useLanguage } from "../components/LanguageContext";
import { localizeTag } from "../data/localization";
import { doc, getDoc, setDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import { getStatisticsDocumentName } from "../data/testVersion";

const parseAxisScores = (encodedScores) => {
    if (!/^\d+-\d+-\d+-\d+-\d+-\d+-\d+-\d+$/.test(encodedScores || "")) return null;
    const [L, H, I, A, P, C, T, S] = encodedScores.split("-").map(Number);
    const pairs = [[L, H], [I, A], [P, C], [T, S]];
    if (pairs.some(([left, right]) => left + right !== 5)) return null;
    return { weight: { L, H }, decision: { I, A }, interaction: { P, C }, focus: { T, S } };
};

function Result() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { language } = useLanguage();
    const copy = resultCopy[language];
    const localizedCharacters = language === "en" ? englishCharacters : characters;

    const [typePercentage, setTypePercentage] = useState(null);
    const [notice, setNotice] = useState("");
    const noticeTimer = useRef(null);

    const scores = location.state?.scores || parseAxisScores(searchParams.get("s"));
    const requestedResult = searchParams.get("c")?.trim().toUpperCase();
    const hasInvalidResult = Boolean(requestedResult && !localizedCharacters[requestedResult]);
    const calculatedResult = scores
        ? `${scores.weight.L > scores.weight.H ? "L" : "H"}${scores.decision.I > scores.decision.A ? "I" : "A"}${scores.interaction.P > scores.interaction.C ? "P" : "C"}${scores.focus.T > scores.focus.S ? "T" : "S"}`
        : "";
    const finalResult = requestedResult && localizedCharacters[requestedResult] ? requestedResult : calculatedResult;
    const character = localizedCharacters[finalResult] || (finalResult ? {
        mpti: finalResult,
        name: copy.unknown,
        passive: copy.noData,
        description: copy.missing,
        goodMatch: "?",
        badMatch: "?",
    } : null);
    const displayTags = location.state?.scores?.tags || [];

    const showNotice = (message) => {
        setNotice(message);
        window.clearTimeout(noticeTimer.current);
        noticeTimer.current = window.setTimeout(() => setNotice(""), 2200);
    };

    useEffect(() => {
        return () => window.clearTimeout(noticeTimer.current);
    }, []);

    useEffect(() => {
        if (!finalResult) return;

        let isActive = true;

        const loadTypePercentage = async () => {
            try {
                const docName = getStatisticsDocumentName();
                const statsSnapshot = await getDoc(doc(db, "statistics", docName));

                if (!statsSnapshot.exists()) return;

                const stats = statsSnapshot.data();
                const totalTesters = stats.totalTesters || 0;
                const typeCount = stats.types?.[finalResult] ?? stats[`types.${finalResult}`] ?? 0;

                if (isActive && totalTesters > 0) {
                    setTypePercentage(((typeCount / totalTesters) * 100).toFixed(1));
                }
            } catch (error) {
                console.error("유형 통계를 불러오지 못했습니다:", error);
            }
        };

        loadTypePercentage();

        return () => {
            isActive = false;
        };
    }, [finalResult]);

    if (hasInvalidResult) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "20px",
                    padding: "20px",
                    boxSizing: "border-box",
                    backgroundColor: "#2ecc71",
                    backgroundImage: "linear-gradient(#27ae60 2px, transparent 2px), linear-gradient(90deg, #27ae60 2px, transparent 2px)",
                    backgroundSize: "40px 40px",
                    fontFamily: "'Maplestory-Light', sans-serif",
                    textAlign: "center",
                }}
            >
                <div style={{ maxWidth: "420px", padding: "30px", backgroundColor: "#fff", border: "5px solid #111", boxShadow: "8px 8px 0px #111" }}>
                    <p style={{ margin: "0 0 22px", color: "#333", fontSize: "1.05rem", fontWeight: "bold", lineHeight: 1.6, wordBreak: "keep-all" }}>
                        {copy.invalid}
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        style={{ padding: "12px 28px", border: "4px solid #111", backgroundColor: "#f1c40f", boxShadow: "4px 4px 0px #111", fontFamily: "inherit", fontSize: "1rem", fontWeight: "bold", cursor: "pointer" }}
                    >
                        {copy.home}
                    </button>
                </div>
            </div>
        );
    }

    if (!character && !scores && !searchParams.get("c")) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <p style={{ fontWeight: "bold" }}>{copy.error}</p>
                <button onClick={() => navigate("/")} style={{ padding: "10px 20px", cursor: "pointer", border: "3px solid #111", fontWeight: "bold" }}>
                    {copy.back}
                </button>
            </div>
        );
    }

    if (!character) {
        return <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "'Maplestory-Light', sans-serif", fontWeight: "bold" }}>{copy.loading}</div>;
    }
    const axisRows = scores
        ? [
              { name: "LH", left: "L", leftLabel: copy.axes[0][0], right: "H", rightLabel: copy.axes[0][1], leftScore: scores.weight.L, rightScore: scores.weight.H },
              { name: "IA", left: "I", leftLabel: copy.axes[1][0], right: "A", rightLabel: copy.axes[1][1], leftScore: scores.decision.I, rightScore: scores.decision.A },
              { name: "CP", left: "C", leftLabel: copy.axes[2][0], right: "P", rightLabel: copy.axes[2][1], leftScore: scores.interaction.C, rightScore: scores.interaction.P },
              { name: "TS", left: "T", leftLabel: copy.axes[3][0], right: "S", rightLabel: copy.axes[3][1], leftScore: scores.focus.T, rightScore: scores.focus.S },
          ].map((axis) => ({
              ...axis,
              leftPercentage: Math.round((axis.leftScore / (axis.leftScore + axis.rightScore)) * 100),
          }))
        : [];
    const visibleTags = displayTags.filter((tag) => tag && tag.trim() !== "").map((tag) => localizeTag(tag, language));

    const scoreQuery = searchParams.get("s");
    const shareUrl = `${window.location.origin}/result?c=${finalResult}${scoreQuery ? `&s=${scoreQuery}` : ""}&lang=${language}`;
    const shareTitle = copy.shareTitle;
    const shareText = copy.shareText(character.name);
    const imageUrl = `${window.location.origin}/images/${finalResult}.png`;

    const incrementShareCount = async () => {
        try {
            const docName = getStatisticsDocumentName();
            const statsRef = doc(db, "statistics", docName);
            await setDoc(statsRef, { shareCount: increment(1) }, { merge: true });
        } catch (error) {
            console.error(error);
        }
    };

    const handleCopyMainLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.origin);
            showNotice(copy.testCopied);
            await incrementShareCount();
        } catch (error) {
            console.error(error);
        }
    };

    const handleShareResult = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            showNotice(copy.resultCopied);
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
                            title: copy.shareButton,
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

        const match = text.match(/^([a-zA-Z]{4})\s*\(([^)]+)\)\s*(?:,|—|-)\s*(.*)$/);

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
            {notice && (
                <div
                    role="status"
                    aria-live="polite"
                    style={{
                        position: "fixed",
                        left: "50%",
                        top: "24px",
                        transform: "translateX(-50%)",
                        zIndex: 1000,
                        padding: "11px 18px",
                        backgroundColor: "#111",
                        color: "#fff",
                        border: "3px solid #fff",
                        boxShadow: "4px 4px 0px rgba(0,0,0,0.35)",
                        fontFamily: "'Maplestory-Light', sans-serif",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                    }}
                >
                    {notice}
                </div>
            )}

            <div
                style={{
                    backgroundColor: "#fff",
                    border: "4px solid #111",
                    padding: "30px",
                    maxWidth: "450px",
                    width: "100%",
                    boxShadow: "7px 7px 0px rgba(0,0,0,0.78)",
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
                        backgroundColor: "#f6f6f6",
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
                        {copy.pending(finalResult)}
                    </span>
                </div>

                {typePercentage !== null && (
                    <p
                        style={{
                            margin: "-6px 0 18px",
                            color: "#666",
                            fontSize: "0.78rem",
                            fontWeight: "bold",
                            textAlign: "center",
                            fontFamily: "'Maplestory-Light', sans-serif",
                            wordBreak: "keep-all",
                        }}
                    >
                        {language === "kr" ? (
                            <>전체 테스트 결과 중 <span style={{ color: "#27ae60" }}>{typePercentage}%</span>가 {finalResult} 유형이에요!</>
                        ) : (
                            <><span style={{ color: "#27ae60" }}>{typePercentage}%</span> of all test results are {finalResult}!</>
                        )}
                    </p>
                )}

                {axisRows.length > 0 && (
                    <section
                        aria-label={copy.analysis}
                        style={{ margin: "0 0 18px", padding: "18px", borderRadius: "10px", backgroundColor: "#eef8ee" }}
                    >
                        <h2 style={{ margin: "0 0 14px", fontSize: "1rem", textAlign: "center", fontFamily: "'Maplestory-Light', sans-serif" }}>{copy.analysis}</h2>
                        <div style={{ display: "grid", gap: "10px", fontFamily: "'Spoqa Han Sans Neo', sans-serif" }}>
                            {axisRows.map((axis) => {
                                const rightPercentage = 100 - axis.leftPercentage;
                                return (
                                    <div key={axis.name}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px", fontSize: "0.76rem", fontWeight: "bold" }}>
                                            <span>{axis.left} · {axis.leftLabel}</span>
                                            <span style={{ textAlign: "right" }}>{axis.rightLabel} · {axis.right}</span>
                                        </div>
                                        <div style={{ display: "flex", height: "18px", border: "2px solid #111", backgroundColor: "#fff", overflow: "hidden" }}>
                                            <div style={{ width: `${axis.leftPercentage}%`, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f1c40f", fontSize: "0.67rem", fontWeight: "900" }}>
                                                {axis.leftPercentage > 0 ? `${axis.leftPercentage}%` : ""}
                                            </div>
                                            <div style={{ width: `${rightPercentage}%`, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#2ecc71", fontSize: "0.67rem", fontWeight: "900" }}>
                                                {rightPercentage > 0 ? `${rightPercentage}%` : ""}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {visibleTags.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "15px", justifyContent: "center" }}>
                                {visibleTags.map((tag, index) => (
                                    <span key={index} style={{ backgroundColor: "#111", color: "#fff", padding: "4px 9px", border: "2px solid #111", fontWeight: "bold", fontSize: "0.75rem", fontFamily: "'Maplestory-Light', sans-serif" }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </section>
                )}
                <div style={{ height: 0, margin: "18px 0 22px", borderTop: "1px dashed rgba(17, 17, 17, 0.28)" }}></div>


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
                        {copy.passive}
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
                        {copy.style}
                    </strong>
                    <p style={{ margin: 0, lineHeight: "1.6", fontWeight: "bold", color: "#333", fontSize: "0.95rem" }}>{character.description}</p>
                </div>

                {character.favor && (
                    <div
                        style={{
                            marginBottom: "25px",
                            padding: "16px 16px 16px 18px",
                            backgroundColor: "#fff6cc",
                            border: "none",
                            borderLeft: "5px solid #f1c40f",
                            borderRadius: "0 8px 8px 0",
                        }}
                    >
                        <strong
                            style={{
                                display: "inline-block",
                                color: "#111",
                                padding: 0,
                                marginBottom: "8px",
                                fontSize: "0.9rem",
                                fontFamily: "'Maplestory-Light', sans-serif",
                            }}
                        >
                            {copy.games}
                        </strong>
                        <p
                            style={{
                                margin: 0,
                                lineHeight: "1.6",
                                fontWeight: "bold",
                                color: "#333",
                                fontSize: "0.95rem",
                                wordBreak: "keep-all",
                            }}
                        >
                            {character.favor}
                        </p>
                    </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <div
                        style={{
                            flex: 1,
                            backgroundColor: "#eef9f2",
                            border: "none",
                            borderRadius: "10px",
                            padding: "16px 10px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >
                        <span style={{ fontWeight: "900", color: "#27ae60", marginBottom: "8px", fontSize: "0.9rem", fontFamily: "'Maplestory-Light', sans-serif" }}>{copy.good}</span>

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
                            backgroundColor: "#fff1ef",
                            border: "none",
                            borderRadius: "10px",
                            padding: "16px 10px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >
                        <span style={{ fontWeight: "900", color: "#c0392b", marginBottom: "8px", fontSize: "0.9rem", fontFamily: "'Maplestory-Light', sans-serif" }}>{copy.bad}</span>

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
                {copy.all}
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
                {copy.share}
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
                {copy.copy}
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
                {copy.retry}
            </button>

            <p
                style={{
                    margin: "36px 0 0",
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    textAlign: "center",
                    fontFamily: "'Maplestory-Light', sans-serif",
                    textShadow: "1px 1px 0px #111",
                    lineHeight: 1.6,
                    wordBreak: "keep-all",
                }}
            >
                {copy.follow}
                <br />
                <a
                    href="https://www.instagram.com/meeple.munse/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#f1c40f", fontSize: "1rem", textDecoration: "underline" }}
                >
                    📷 @meeple.munse
                </a>
            </p>
        </div>
    );
}

export default Result;
