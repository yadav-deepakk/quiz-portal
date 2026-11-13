import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../../components/PageHeader";
import { Spinner } from "../../components/Spinner";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";
import type { Question } from "../../types";

function emptyQuestion(quizId?: number): Question {
    return {
        questionContent: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        answer: "",
        quiz: quizId ? { quizId, category: {} } : undefined,
    };
}

export function QuestionForm() {
    const { quizId, quizTitle, questionId } = useParams();
    const isEdit = Boolean(questionId);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const numericQuizId = Number(quizId);
    const title = quizTitle ?? "Quiz";

    const [question, setQuestion] = useState<Question>(emptyQuestion(numericQuizId));
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!questionId) {
            setQuestion(emptyQuestion(numericQuizId));
            setLoading(false);
            return;
        }

        let active = true;
        setLoading(true);

        api
            .get<Question>(`/question/${questionId}`)
            .then((data) => {
                if (active) {
                    setQuestion({
                        ...data,
                        quiz: data.quiz ? { ...data.quiz, quizId: numericQuizId } : { quizId: numericQuizId, category: {} },
                    });
                }
            })
            .catch(() => {
                if (active) {
                    showToast("Unable to load the question.", "error");
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [questionId, numericQuizId, showToast]);

    const options = useMemo(
        () => [question.option1, question.option2, question.option3, question.option4].filter(Boolean) as string[],
        [question.option1, question.option2, question.option3, question.option4]
    );

    function updateField(field: keyof Question, value: string) {
        setQuestion((current) => ({ ...current, [field]: value }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const requiredValues = [
            question.questionContent,
            question.option1,
            question.option2,
            question.option3,
            question.option4,
            question.answer,
        ];

        if (requiredValues.some((value) => !value?.trim())) {
            showToast("All fields are mandatory.", "error");
            return;
        }

        if (!options.includes(question.answer ?? "")) {
            showToast("The answer must match one of the options.", "error");
            return;
        }

        const payload: Question = {
            ...question,
            quiz: { quizId: numericQuizId, category: {} },
        };

        setSubmitting(true);
        try {
            if (isEdit) {
                await api.put<Question>("/question", payload);
                showToast("Question updated.", "success");
            } else {
                await api.post<Question>("/question", payload);
                showToast("Question saved.", "success");
            }
            navigate(`/admin/questions/quiz/${quizId}/${encodeURIComponent(title)}`);
        } catch {
            showToast(`Unable to ${isEdit ? "update" : "save"} the question.`, "error");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <Spinner label="Loading question..." />;
    }

    return (
        <div className="max-w-3xl">
            <PageHeader
                title={isEdit ? "Update question" : "Add a question"}
                subtitle={`Quiz: ${title}`}
            />

            <form onSubmit={handleSubmit} className="card card-body">
                <div className="field">
                    <label className="label" htmlFor="questionContent">
                        Question
                    </label>
                    <textarea
                        id="questionContent"
                        className="input min-h-28"
                        rows={4}
                        value={question.questionContent ?? ""}
                        onChange={(event) => updateField("questionContent", event.target.value)}
                        placeholder="Enter the question text"
                        required
                    />
                </div>

                <div className="grid gap-x-4 sm:grid-cols-2">
                    {(["option1", "option2", "option3", "option4"] as const).map((field, index) => (
                        <div className="field" key={field}>
                            <label className="label" htmlFor={field}>
                                Option {index + 1}
                            </label>
                            <input
                                id={field}
                                className="input"
                                value={question[field] ?? ""}
                                onChange={(event) => updateField(field, event.target.value)}
                                placeholder={`Option ${index + 1}`}
                                required
                            />
                        </div>
                    ))}
                </div>

                <div className="field">
                    <label className="label" htmlFor="answer">
                        Correct answer
                    </label>
                    <select
                        id="answer"
                        className="input"
                        value={question.answer ?? ""}
                        onChange={(event) => updateField("answer", event.target.value)}
                        required
                    >
                        <option value="">Select the correct option</option>
                        {options.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? "Saving..." : isEdit ? "Update" : "Save"}
                    </button>
                    <Link
                        to={`/admin/questions/quiz/${quizId}/${encodeURIComponent(title)}`}
                        className="btn-secondary"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
