import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { questions } from "../data/questions";

function Test() {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);

    const [scores, setScores] = useState({
        weight: { L: 0, H: 0 },
        decision: { I: 0, A: 0 },
        interaction: { P: 0, C: 0 },
        focus: { T: 0, S: 0 },
        tags: [],
    });

    const handleOptionClick = (type, value) => {
        if (type === "tag") {
            setScores((prev) => ({ ...prev, tags: [...prev.tags, value] }));
        } else {
            setScores((prev) => ({
                ...prev,
                [type]: { ...prev[type], [value]: prev[type][value] + 1 },
            }));
        }

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            navigate("/result", { state: { scores } });
        }
    };

    const currentQuestion = questions[currentIndex];
    // 진행률을 계산하여 몇 번째 칸에 서 있는지 표현 (총 10칸 짜리 트랙으로 축약 표현)
    const trackLength = 10;
    const currentPosition = Math.floor((currentIndex / questions.length) * trackLength);

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
                            onClick={() => handleOptionClick(currentQuestion.type, option.value)}
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
