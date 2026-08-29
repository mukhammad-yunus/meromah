import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginWarning from "../../../components/LoginWarning";
import GenerateFromJSON from "./../../system/GenerateFromJSON";

const CreateTestFromJson = ({ onCancel }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [mode, setMode] = useState("json"); // reserved for future modes

  const handleJSONSuccess = ({ desc, testId }) => {
    navigate(`/d/${desc}/test/${testId}`);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    // Fallback: go back if no onCancel handler is provided
    navigate(-1);
  };

  if (isAuthenticated === false) return <LoginWarning />;

  return (
    <div className="w-full min-w-0 p-6">
      <GenerateFromJSON onSuccess={handleJSONSuccess} onCancel={handleCancel} />
    </div>
  );
};


export default CreateTestFromJson;
