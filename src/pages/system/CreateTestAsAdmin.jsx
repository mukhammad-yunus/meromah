import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import NotFound from "../../components/NotFound";
import CreateTest from "../user/components/CreateTest";
import GenerateFromJSON from "./GenerateFromJSON";

const CreateTestAsAdmin = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [mode, setMode] = useState(null); // reserved for future modes

  const handleJSONSuccess = ({ desc, testId }) => {
    navigate(`/d/${desc}/test/${testId}`);
  };

  const handleCancel = () => {
    if (mode === null) {
      navigate("/system");
    } else {
      setMode(null);
    }
  };

  if (isAuthenticated === false) return <NotFound />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <GenerateFromJSON onSuccess={handleJSONSuccess} onCancel={handleCancel} />
    </div>
  );
};

export default CreateTestAsAdmin;

