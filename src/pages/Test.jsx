import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { questions } from "../data/questions";

function Test() {
    const navigate = useNavigate();

    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [scores, setScores] = useState({
        weight: { L: 0, H: 0 },
        decision: { I: 0, A: 0 },
        interaction: { P: 0, C: 0 },
        focus: { T: 0, S: 0 },
        tags: [],
    });

    useEffect(() => {
        const normalQuestions = questions.filter((q) => q.type !== "tag");
        const tagQuestions = questions.filter((q) => q.type === "tag");

        const shuffledNormal = [...normalQuestions];
        for (let i = shuffledNormal.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledNormal[i], shuffledNormal[j]] = [shuffledNormal[j], shuffledNormal[i]];
        }

        setShuffledQuestions([...shuffledNormal, ...tagQuestions]);
    }, []);

    if (shuffledQuestions.length === 0) {
        return <div style={{ textAlign: "center", marginTop: "50px", fontWeight: "bold" }}>[SYSTEM] 퀘스트 카드를 섞는 중...</div>;
    }

    const currentQuestion = shuffledQuestions[currentIndex];

    const handleOptionClick = (type, value, optionIndex) => {
        let extraTags = [];

        if (type === "tag") {
            setScores((prev) => ({
                ...prev,
                tags: [...prev.tags, value, ...extraTags],
            }));
        } else {
            setScores((prev) => ({
                ...prev,
                [type]: { ...prev[type], [value]: prev[type][value] + 1 },
                tags: extraTags.length > 0 ? [...prev.tags, ...extraTags] : prev.tags,
            }));
        }

        // 다음 스테이지로 이동 또는 결과 창 진입
        if (currentIndex < shuffledQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // 최신 점수 상태를 즉시 계산하여 최종 결과 도출
            const finalScores = {
                ...scores,
                tags: extraTags.length > 0 ? [...scores.tags, ...extraTags] : scores.tags,
            };

            if (type === "tag") {
                finalScores.tags = [...scores.tags, value, ...extraTags];
            } else {
                finalScores[type] = { ...scores[type], [value]: scores[type][value] + 1 };
            }

            // 📌 [핵심 수정] 마지막 순간에 MPTI 알파벳 조합 생성
            const { weight: w, decision: d, interaction: i, focus: f } = finalScores;
            const weight = w.L > w.H ? "L" : "H";
            const decision = d.I > d.A ? "I" : "A";
            const interaction = i.P > i.C ? "P" : "C";
            const focus = f.T > f.S ? "T" : "S";
            const finalResult = `${weight}${decision}${interaction}${focus}`.trim();

            // 쿼리 파라미터(?c=) 뒤에 finalResult를 안전하게 매립하여 이동
            navigate(`/result?c=${finalResult}`, { state: { scores: finalScores } });
        }
    };

    const trackLength = 10;
    const currentPosition = Math.floor((currentIndex / shuffledQuestions.length) * trackLength);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "100vh",
                backgroundColor: "#f4f1ea",
                padding: "20px",
            }}
        >
            <div style={{ maxWidth: "500px", width: "100%", marginTop: "20px" }}>
                {/* 보드게임 진행 트랙 UI */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        backgroundColor: "#111",
                        padding: "10px",
                        border: "4px solid #111",
                        borderRadius: "10px",
                        marginBottom: "30px",
                    }}
                >
                    {Array.from({ length: trackLength }).map((_, idx) => (
                        <div
                            key={idx}
                            style={{
                                width: "30px",
                                height: "30px",
                                backgroundColor: idx === currentPosition ? "#f1c40f" : "#fff",
                                border: "2px solid #555",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.2rem",
                            }}
                        >
                            {idx === currentPosition ? "♟️" : ""}
                        </div>
                    ))}
                    <div
                        style={{
                            color: "#fff",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "10px",
                            fontFamily: "'Maplestory-Light', sans-serif",
                        }}
                    >
                        GOAL
                    </div>
                </div>

                {/* 퀘스트 카드 영역 */}
                <div
                    style={{
                        backgroundColor: "#fff",
                        border: "4px solid #111",
                        padding: "30px",
                        boxShadow: "8px 8px 0px rgba(0,0,0,0.8)",
                        marginBottom: "30px",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: "-15px",
                            left: "20px",
                            backgroundColor: "#3498db",
                            color: "#fff",
                            padding: "5px 15px",
                            border: "2px solid #111",
                            fontWeight: "bold",
                            fontFamily: "'Maplestory-Light', sans-serif",
                        }}
                    >
                        STAGE {currentIndex + 1}
                    </div>
                    <h2
                        style={{
                            fontSize: "1.2rem",
                            textAlign: "center",
                            marginTop: "20px",
                            minHeight: "60px",
                            wordBreak: "keep-all",
                            lineHeight: "1.4",
                            fontFamily: "inherit",
                        }}
                    >
                        {currentQuestion.question}
                    </h2>
                </div>

                {/* 선택지 (카드 드로우 느낌) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%" }}>
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleOptionClick(currentQuestion.type, option.value, index)}
                            style={{
                                padding: "20px",
                                fontSize: "1.0rem",
                                cursor: "pointer",
                                border: "3px solid #111",
                                backgroundColor: "#fff",
                                textAlign: "left",
                                wordBreak: "keep-all",
                                fontFamily: "inherit",
                                boxShadow: "4px 4px 0px #111",
                                transition: "all 0.1s",
                                lineHeight: "1.4",
                            }}
                            onMouseDown={(e) => {
                                e.currentTarget.style.transform = "translate(4px, 4px)";
                                e.currentTarget.style.boxShadow = "0px 0px 0px #111";
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.transform = "translate(0px, 0px)";
                                e.currentTarget.style.boxShadow = "4px 4px 0px #111";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translate(0px, 0px)";
                                e.currentTarget.style.boxShadow = "4px 4px 0px #111";
                            }}
                        >
                            {option.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Test;
