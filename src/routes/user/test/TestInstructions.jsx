import React, { useEffect, useState } from "react";
import { Button } from "./Button";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetTestFromDescByIdQuery,
  usePostTestStartMutation,
} from "../../../services/testsApi";
import Loading from "../../../components/Loading";
import { Clock, FileText, User, Users } from "lucide-react";
import { useGetQuestionsForTestQuery } from "../../../services/questionsApi";
import { useDispatch, useSelector } from "react-redux";
import { initializeSession, startSession } from "../../../app/testSessionSlice";
import { useGetQuestionTypesQuery } from "../../../services/questionTypesApi";
import Toast from "../../../components/Toast";
import MarkdownViewer from "../../../components/markdownViewer/MarkdownViewer";

export const TestInstructions = () => {
  const { descId, testId } = useParams();
  const [error, setError] = useState({ hasError: false, message: null });
  const [testStyle, setTestStyle] = useState("one_by_one");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { status } = useSelector((s) => s.testSession);
  const {
    data: testInfo,
    isSuccess: isTestDataSuccess,
    isFetching: isTestDataFetching,
  } = useGetTestFromDescByIdQuery({
    desc: descId,
    test: testId,
  });
  const {
    data: questions,
    isFetching: isQuestionsFetching,
    isSuccess: isQuestionsSuccess,
  } = useGetQuestionsForTestQuery({ test: testId }, { skip: !isAuthenticated });
  const {
    data: questionTypes,
    isFetching: isTypesFetching,
    isSuccess: isTypesSuccess,
  } = useGetQuestionTypesQuery(undefined, { skip: !isAuthenticated });
  const [startTest] = usePostTestStartMutation();
  const onTestStart = async () => {
    if (isAuthenticated === false) {
      sessionStorage.setItem("last-visit", location.pathname)
      navigate("/login")
      return null;
    }
    try {
      await startTest({ desc: descId, test: testId }).unwrap();
      dispatch(startSession({ testStyle }));
    } catch (err) {
      setError({ hasError: true, message: err.data.message });
    }
  };
  useEffect(() => {
    if (
      !testInfo?.data ||
      !isTestDataSuccess ||
      !questions?.data ||
      !isQuestionsSuccess ||
      !isTypesSuccess ||
      !questionTypes?.ids_obj
    )
      return;

    if (status === "idle") {
      dispatch(
        initializeSession({
          test: {
            title: testInfo.data.title,
            id: testInfo.data.id,
            duration: testInfo.data.duration,
          },
          questionTypes: questionTypes.ids_obj,
          questions: questions.data,
        })
      );
    }
  }, [
    testInfo,
    isTestDataSuccess,
    questions,
    isQuestionsSuccess,
    isTypesSuccess,
    questionTypes,
    dispatch,
  ]);
  if (isTestDataFetching || isQuestionsFetching || isTypesFetching) {
    return <Loading />;
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-100 dark:bg-neutral-950">
        <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-primary-blue via-primary-blue to-primary-blue/90 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-900 p-8">
            <h1 className="text-3xl font-bold text-white dark:text-neutral-100 mb-2">
              {testInfo.data.title}
            </h1>
            {/* Author and Community Info */}
            <div className="flex items-center gap-4 text-sm text-white/90 dark:text-neutral-300">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{testInfo.data.author.username}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/60 dark:bg-neutral-400"></div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{testInfo.data.desc.name}</span>
              </div>
            </div>
          </div>
          {/* Content Section */}
          <div className="p-8 space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                About this test
              </h2>
              {testInfo.data.description !== null ? (
                <div className="flex flex-col gap-1 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-100">Description</strong>
                  <div className="text-neutral-700 dark:text-neutral-300">
                    <MarkdownViewer>{testInfo.data.description}</MarkdownViewer>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-600 dark:text-neutral-400">No description.</p>
              )}
            </div>
            {/* Test Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-neutral-100 dark:bg-neutral-950/50 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Duration
                  </p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {testInfo.data.duration
                      ? `${testInfo.data.duration} min`
                      : "No limit"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-neutral-100 dark:bg-neutral-950/50 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Questions
                  </p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {testInfo.data.questions_count}
                  </p>
                </div>
              </div>
            </div>
            {/* Test Style Selection */}
            <div className="pt-2">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                Test Style
              </h3>
              <div className="flex flex-col gap-3 mb-6">
                <label className="flex items-center gap-3 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <input
                    type="radio"
                    name="testStyle"
                    value="one_by_one"
                    checked={testStyle === "one_by_one"}
                    onChange={(e) => setTestStyle(e.target.value)}
                    className="w-4 h-4 text-primary-blue focus:ring-primary-blue focus:ring-2 border-neutral-300 dark:border-neutral-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      One by One
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Solve questions one at a time with next and back buttons
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <input
                    type="radio"
                    name="testStyle"
                    value="all_in_one"
                    checked={testStyle === "all_in_one"}
                    onChange={(e) => setTestStyle(e.target.value)}
                    className="w-4 h-4 text-primary-blue focus:ring-primary-blue focus:ring-2 border-neutral-300 dark:border-neutral-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      All in One
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      View and solve all questions on a single page
                    </div>
                  </div>
                </label>
              </div>
            </div>
            {/* Start Button */}
            <div className="pt-2">
              <Button
                onClick={onTestStart}
                fullWidth
                variant="primary"
                className="text-base py-3.5 font-medium cursor-pointer"
              >
                Start Test
              </Button>
              {testInfo.data.duration && (
                <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-3">
                  Timer starts immediately when you begin
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {error.hasError && (
        <Toast
          message={error.message}
          onClose={() => setError({ hasError: false, message: null })}
          key={"test-start-error"}
          time={10000}
          type="error"
        />
      )}
    </>
  );
};
