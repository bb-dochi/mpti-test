import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { characters } from "../data/characters";

import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

function Result() {
    const location = useLocation();
    const navigate = useNavigate();
    const scores = location.state?.scores;

    const hasRecorded = useRef(false);

    if (!scores) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <p style={{ fontWeight: "bold" }}>[ERROR] 데이터를 불러올 수 없습니다.</p>
                <button
                    onClick={() => navigate("/")}
                    style={{
                        padding: "10px 20px",
                        cursor: "pointer",
                        border: "3px solid #111",
                        fontWeight: "bold",
                        fontFamily: "'Maplestory-Light', sans-serif",
                    }}
                >
                    메인으로 복귀
                </button>
            </div>
        );
    }

    // 1. MPTI 알파벳 도출 로직
    const { weight: w, decision: d, interaction: i, focus: f } = scores;
    const weight = w.L > w.H ? "L" : "H";
    const decision = d.I > d.A ? "I" : "A";
    const interaction = i.P > i.C ? "P" : "C";
    const focus = f.T > f.S ? "T" : "S";

    const finalResult = `${weight}${decision}${interaction}${focus}`;

    // 2. 캐릭터 데이터 매칭
    const character = characters[finalResult] || {
        mpti: finalResult,
        name: "미등록 미플",
        passive: "데이터 없음",
        description: "로직 오류 혹은 데이터 누락",
        goodMatch: "?",
        badMatch: "?",
    };

    // 3. 페이지가 열릴 때 딱 한 번 파이어베이스에 데이터 전송하기
    useEffect(() => {
        // 이미 기록했거나 결과가 없다면 중단
        if (hasRecorded.current || !finalResult) return;

        // 기록했다고 표시하기 (방어벽 치기)
        hasRecorded.current = true;

        const saveStatistics = async () => {
            try {
                const docName = import.meta.env.DEV ? "mpti_stats_dev" : "mpti_stats";
                const statsRef = doc(db, "statistics", docName);
                const updateData = {
                    totalTesters: increment(1),
                    [`types.${finalResult}`]: increment(1),
                };

                if (scores.tags && scores.tags.length > 0) {
                    scores.tags.forEach((tag) => {
                        if (tag) {
                            updateData[`extraQuestions.${tag}`] = increment(1);
                        }
                    });
                }

                await setDoc(statsRef, updateData, { merge: true });
                console.log(`🔥 [${docName}] 파이어베이스 통계 누적 성공!`);
            } catch (error) {
                console.error("파이어베이스 저장 에러:", error);
            }
        };

        saveStatistics();
    }, [finalResult, scores.tags]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "100vh",
                backgroundColor: "#2ecc71", // 보드게임 매트 배경
                backgroundImage: "linear-gradient(#27ae60 2px, transparent 2px), linear-gradient(90deg, #27ae60 2px, transparent 2px)",
                backgroundSize: "40px 40px",
                padding: "40px 20px",
            }}
        >
            {/* 캐릭터 카드 UI (부루마블 카드 느낌) */}
            <div
                style={{
                    backgroundColor: "#fff",
                    border: "6px solid #111",
                    padding: "30px",
                    maxWidth: "450px",
                    width: "100%",
                    boxShadow: "10px 10px 0px rgba(0,0,0,0.8)",
                    position: "relative",
                }}
            >
                {/* 상단 MPTI 뱃지 */}
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
                    [ {character.mpti} ]
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

                {/* 미플 일러스트 영역 */}
                <div
                    style={{
                        width: "100%",
                        height: "280px",
                        backgroundColor: "#e9e9e9",
                        border: "4px dashed #111",
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    {/* Vite 환경에서는 public 폴더나 src/assets 폴더의 이미지를 동적으로 가져올 수 있습니다.
                            가장 깔끔하고 보편적인 public 폴더 경로 방식을 사용합니다.
                            나중에 public/images/ 폴더 안에 LIPS.png 형태로 파일을 넣어두면 됩니다.
                        */}
                    <img
                        src={`/images/${finalResult.trim()}.png`}
                        alt={character.name}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        onError={(e) => {
                            // 아직 이미지가 없을 때 보여줄 기본 대체 텍스트/UI 설정
                            e.target.style.display = "none";
                            const placeholder = e.target.parentNode.querySelector(".placeholder-text");
                            if (placeholder) placeholder.style.display = "block";
                        }}
                    />
                    <span className="placeholder-text" style={{ color: "#555", fontWeight: "bold", display: "none" }}>
                        ♟️ [ {character.mpti} 일러스트 준비 중 ]
                    </span>
                </div>

                {/* 획득 칭호 (태그) */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px", justifyContent: "center" }}>
                    {scores.tags.map((tag, index) => (
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

                {/* 스킬 및 설명 */}
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

                {/* 궁합 영역 (보드게임 파티 매칭 컨셉) */}
                <div style={{ backgroundColor: "#f4f1ea", border: "3px solid #111", padding: "15px" }}>
                    <div style={{ marginBottom: "10px" }}>
                        <span style={{ fontWeight: "bold", color: "#27ae60" }}>🟢 찰떡 파티원 : </span>
                        <span style={{ fontWeight: "bold" }}>{character.goodMatch}</span>
                    </div>
                    <div>
                        <span style={{ fontWeight: "bold", color: "#c0392b" }}>🔴 상극 파티원 : </span>
                        <span style={{ fontWeight: "bold" }}>{character.badMatch}</span>
                    </div>
                </div>
            </div>

            {/* 다시하기 버튼 */}
            <button
                onClick={() => navigate("/")}
                style={{
                    marginTop: "40px",
                    padding: "15px 40px",
                    fontSize: "1.2rem",
                    fontWeight: "900",
                    cursor: "pointer",
                    border: "4px solid #111",
                    backgroundColor: "#f1c40f",
                    color: "#111",
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
                RESTART ↺
            </button>
        </div>
    );
}

export default Result;
