import { useEffect } from "react";
import {
  useRestrictUserInBoardMutation,
  useGetBoardSubscribersPrivilegedQuery,
} from "../../services/boardSubscriptionsApi";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetBoardQuery } from "../../services/boardsApi";
import CommunityMembers from "./components/CommunityMember/CommunityMembers";

const BoardMembers = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  useEffect(() => {
    if (isAuthenticated === undefined) return;
    if (isAuthenticated === false) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated]);

  return (
    <CommunityMembers
      communityId={boardId}
      communityType="board"
      isAuthenticated={isAuthenticated}
      useGetCommunityMembers={useGetBoardSubscribersPrivilegedQuery}
      useGetCommunityQuery={useGetBoardQuery}
      useRestrictUserInCommunityMutation={useRestrictUserInBoardMutation}
    />
  );
};

export default BoardMembers;
