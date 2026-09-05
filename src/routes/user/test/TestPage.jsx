import { useDispatch, useSelector } from "react-redux";
import { TestInstructions } from "./TestInstructions";
import { QuestionRunner } from "./QuestionRunner";
import { ReviewAnswers } from "./ReviewAnswers";
import { EditAnswer } from "./EditAnswer";
import { AllInOneTest } from "./AllInOneTest";
import { useLocation, useNavigate } from "react-router-dom";
import { TestResultPage } from "./TestResultPage";
import { useEffect } from "react";
import { useAmILoggedInQuery } from "../../../services/authApi";
import { setIsAuthenticated } from "../../../app/authSlice";

export const TestPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation()
  const { status, test } = useSelector((s) => s.testSession);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { data: loginStatus } = useAmILoggedInQuery(undefined, {skip: isAuthenticated !== undefined});
  if (isAuthenticated === false && status !== "idle") {
    sessionStorage.setItem("last-visit", location.pathname)
    navigate("/login", {replace: true});
    return null;
  }
  useEffect(() => {
    if (loginStatus === undefined || isAuthenticated) return;
    dispatch(setIsAuthenticated(loginStatus.isAuthenticated));
  }, [loginStatus, dispatch]);
  useEffect(() => {
    if (status === "idle" || status === "completed") return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [status]);
  switch (status) {
    case "idle":
      return <TestInstructions />;

    case "in_progress":
      return <QuestionRunner />;

    case "all_in_one":
      return <AllInOneTest />;

    case "review":
      return <ReviewAnswers />;
    case "edit":
      return <EditAnswer />;

    case "completed":
      return <TestResultPage />;

    default:
      return <TestInstructions />;
  }
};
