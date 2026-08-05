import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { questions } from "../data/questions";
import { collection, doc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { getResponseCollectionName, getStatisticsDocumentName, TEST_VERSION } from "../data/testVersion";

const createQuestionOrder = () => {
    const normalQuestions = questions.filter((q) => q.type !== "tag");
    const tagQuestions = questions.filter((q) => q.type === "tag");

    for (let i = normalQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [normalQuestions[i], normalQuestions[j]] = [normalQuestions[j], normalQuestions[i]];
    }

    return [...normalQuestions, ...tagQuestions];
};

function Test() {
    const navigate = useNavigate();

    const [shuffledQuestions] = useState(createQuestionOrder);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [scores, setScores] = useState({
        weight: { L: 0, H: 0 },
        decision: { I: 0, A: 0 },
        interaction: { P: 0, C: 0 },
        focus: { T: 0, S: 0 },
        tags: [],
    });

    const [history, setHistory] = useState([]);
    const [responses, setResponses] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submissionLock = useRef(false);

    const handleBack = () => {
        if (currentIndex === 0) return;

        setCurrentIndex((prev) => prev - 1);

        // 뒤로 가기 시 직전 타임라인의 점수 스냅샷을 완벽히 복원
        const previousState = history[history.length - 1];
        setScores(previousState.scores);
        setResponses(previousState.responses);
        setHistory((prev) => prev.slice(0, -1));
    };

    const currentQuestion = shuffledQuestions[currentIndex];

    const handleOptionClick = async (type, value) => {
        if (submissionLock.current) return;

        // 점수판이 바뀌기 직전 상태를 히스토리에 누적 (뒤로가기용)
        setHistory((prev) => [...prev, { scores, responses }]);

        const selectedResponse = {
            questionId: currentQuestion.id,
            type,
            value,
        };
        const nextResponses = [...responses, selectedResponse];
        setResponses(nextResponses);

        let extraTags = [];

        // 1~24번 일반 질문 및 25번 태그 질문 분기 점수 업데이트
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

        // 넥스트 페이지 체크 로직
        if (currentIndex < shuffledQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            submissionLock.current = true;
            setIsSubmitting(true);

            // 📌 [버그 수정 완료] 리액트 State 비동기 딜레이 우회를 위해 객체를 즉시 직접 빌드
            const finalScores = {
                ...scores,
                tags: extraTags.length > 0 ? [...scores.tags, ...extraTags] : scores.tags,
            };

            if (type === "tag") {
                finalScores.tags = [...scores.tags, value, ...extraTags];
            } else {
                finalScores[type] = { ...scores[type], [value]: scores[type][value] + 1 };
            }

            // 최종 매칭 알파벳 연산
            const { weight: w, decision: d, interaction: i, focus: f } = finalScores;
            const weight = w.L > w.H ? "L" : "H";
            const decision = d.I > d.A ? "I" : "A";
            const interaction = i.P > i.C ? "P" : "C";
            const focus = f.T > f.S ? "T" : "S";
            const finalResult = `${weight}${decision}${interaction}${focus}`.trim();

            // 통계 데이터 파이어베이스 전송
            const saveStatistics = async () => {
                try {
                    const docName = getStatisticsDocumentName();
                    const statsRef = doc(db, "statistics", docName);
                    const responseRef = doc(collection(db, getResponseCollectionName()));
                    const batch = writeBatch(db);
                    const updateData = {
                        version: TEST_VERSION,
                        totalTesters: increment(1),
                        types: { [finalResult]: increment(1) },
                    };

                    if (finalScores.tags && finalScores.tags.length > 0) {
                        updateData.extraQuestions = {};
                        finalScores.tags.forEach((tag) => {
                            if (tag) {
                                updateData.extraQuestions[tag] = increment(1);
                            }
                        });
                    }

                    batch.set(statsRef, updateData, { merge: true });
                    batch.set(responseRef, {
                        version: TEST_VERSION,
                        result: finalResult,
                        scores: {
                            weight: finalScores.weight,
                            decision: finalScores.decision,
                            interaction: finalScores.interaction,
                            focus: finalScores.focus,
                        },
                        answers: nextResponses,
                        tags: finalScores.tags.filter(Boolean),
                        completedAt: serverTimestamp(),
                    });
                    await batch.commit();
                    console.log(`🔥 [${docName}] 테스트 완료 시점에 최초 1회 저장 성공!`);
                } catch (error) {
                    console.error("파이어베이스 저장 에러:", error);
                }
            };

            await saveStatistics();
            const axisScores = [w.L, w.H, d.I, d.A, i.P, i.C, f.T, f.S].join("-");
            navigate(`/result?c=${finalResult}&s=${axisScores}`, { state: { scores: finalScores } });
        }
    };

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
                <div style={{ width: "100%", marginBottom: "35px" }}>
                    {/* 상단 레이아웃: 왼쪽엔 미니 정사각 ◀ 버튼, 오른쪽엔 진행도 숫자 */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                            fontFamily: "'Maplestory-Light', sans-serif",
                            fontSize: "0.95rem",
                            fontWeight: "bold",
                            color: "#111",
                            padding: "0 4px",
                            minHeight: "48px", // 정사각 버튼 높이에 맞춰 여유 있게 조정
                        }}
                    >
                        {/* 👈 좌측 상단: 선택지 버튼과 테마가 같은 완벽한 정사각 미니 버튼 */}
                        {currentIndex > 0 ? (
                            <button
                                onClick={handleBack}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "30px", // 📌 가로 40px 고정
                                    height: "30px", // 📌 세로 40px 고정 (완벽한 정사각형)
                                    cursor: "pointer",
                                    border: "3px solid #111",
                                    backgroundColor: "#fff",
                                    boxShadow: "2px 2px 0px #111",
                                    transition: "all 0.1s",
                                    padding: 0,
                                    boxSizing: "border-box", // 테두리가 늘어나 정사각이 깨지는 것 방지
                                }}
                                onMouseDown={(e) => {
                                    e.currentTarget.style.transform = "translate(2px, 2px)";
                                    e.currentTarget.style.boxShadow = "0px 0px 0px #111";
                                }}
                                onMouseUp={(e) => {
                                    e.currentTarget.style.transform = "translate(0px, 0px)";
                                    e.currentTarget.style.boxShadow = "2px 2px 0px #111";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translate(0px, 0px)";
                                    e.currentTarget.style.boxShadow = "2px 2px 0px #111";
                                }}
                            >
                                {/* 정사각 박스에 예쁘게 안착하도록 패딩 밸런스 맞춘 삼각형 SVG */}
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="#111" style={{ marginRight: "1px" }}>
                                    <path d="M20 22V2L4 12L20 22Z" />
                                </svg>
                            </button>
                        ) : (
                            <div style={{ width: "40px", height: "40px" }} />
                        )}

                        {/* 👉 우측 상단 진행도 스테이터스 */}
                        <span>
                            {currentIndex + 1} / {shuffledQuestions.length}
                        </span>
                    </div>
                    {/* 게이지 트랙 레일 */}
                    <div
                        style={{
                            position: "relative",
                            height: "24px",
                            backgroundColor: "#fff",
                            border: "4px solid #111",
                            borderRadius: "8px",
                            boxShadow: "4px 4px 0px #111",
                            display: "flex",
                            alignItems: "center",
                            overflow: "visible",
                        }}
                    >
                        <div
                            style={{
                                width: `${(currentIndex / (shuffledQuestions.length - 1)) * 100}%`,
                                height: "100%",
                                backgroundColor: "#f1c40f",
                                transition: "width 0.25s ease-out",
                            }}
                        />

                        {/* 미플 말 컴포넌트 */}
                        <div
                            style={{
                                position: "absolute",
                                left: `calc(${(currentIndex / (shuffledQuestions.length - 1)) * 100}% - 14px)`,
                                top: "-12px",
                                fontSize: "1.6rem",
                                transition: "left 0.25s ease-out",
                                zIndex: 2,
                                cursor: "default",
                                userSelect: "none",
                            }}
                        >
                            ♟️
                        </div>

                        <span
                            style={{
                                position: "absolute",
                                right: "12px",
                                fontSize: "0.75rem",
                                fontWeight: "900",
                                color: "#111",
                                fontFamily: "'Maplestory-Light', sans-serif",
                                zIndex: 1,
                            }}
                        >
                            GOAL
                        </span>
                    </div>
                </div>

                {/* 메인 스테이지 질문 카드 */}
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

                {/* 선택 버튼 컴포넌트 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%", marginBottom: "25px" }}>
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleOptionClick(currentQuestion.type, option.value)}
                            disabled={isSubmitting}
                            style={{
                                padding: "20px",
                                fontSize: "1.0rem",
                                cursor: isSubmitting ? "wait" : "pointer",
                                border: "3px solid #111",
                                backgroundColor: "#fff",
                                textAlign: "left",
                                wordBreak: "keep-all",
                                fontFamily: "inherit",
                                boxShadow: "4px 4px 0px #111",
                                transition: "all 0.1s",
                                lineHeight: "1.4",
                                opacity: isSubmitting ? 0.65 : 1,
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
